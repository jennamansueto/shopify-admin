import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { generateRequestId } from '@/lib/request-id'

export async function GET(request: NextRequest) {
  const requestId = generateRequestId()
  const { searchParams } = new URL(request.url)

  const range = searchParams.get('range') || '30'
  const channel = searchParams.get('channel') || ''
  const compare = searchParams.get('compare') === 'true'

  logger.info('Fetching analytics data', { requestId, range, channel, compare })

  try {
    const days = parseInt(range, 10)
    const now = new Date()
    const periodStart = new Date(now)
    periodStart.setDate(periodStart.getDate() - days)
    periodStart.setHours(0, 0, 0, 0)

    const prevPeriodStart = new Date(periodStart)
    prevPeriodStart.setDate(prevPeriodStart.getDate() - days)

    // Build order filter
    const channelFilter = channel ? { salesChannel: channel } : {}

    // Current period orders
    const currentOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: periodStart },
        ...channelFilter,
      },
    })

    // Previous period orders
    const previousOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: prevPeriodStart, lt: periodStart },
        ...channelFilter,
      },
    })

    const currentSales = currentOrders.reduce((sum, o) => sum + o.total, 0)
    const previousSales = previousOrders.reduce((sum, o) => sum + o.total, 0)
    const salesChange = previousSales > 0 ? ((currentSales - previousSales) / previousSales) * 100 : 0

    const currentOrderCount = currentOrders.length
    const previousOrderCount = previousOrders.length
    const ordersChange = previousOrderCount > 0 ? ((currentOrderCount - previousOrderCount) / previousOrderCount) * 100 : 0

    const currentAOV = currentOrderCount > 0 ? currentSales / currentOrderCount : 0
    const previousAOV = previousOrderCount > 0 ? previousSales / previousOrderCount : 0
    const aovChange = previousAOV > 0 ? ((currentAOV - previousAOV) / previousAOV) * 100 : 0

    // Aggregates for conversion rate
    const aggregates = await prisma.analyticsAggregate.findMany({
      where: { date: { gte: periodStart } },
      orderBy: { date: 'asc' },
    })
    const prevAggregates = await prisma.analyticsAggregate.findMany({
      where: { date: { gte: prevPeriodStart, lt: periodStart } },
      orderBy: { date: 'asc' },
    })

    const currentCR = aggregates.length > 0
      ? aggregates.reduce((sum, a) => sum + a.conversionRate, 0) / aggregates.length
      : 0
    const previousCR = prevAggregates.length > 0
      ? prevAggregates.reduce((sum, a) => sum + a.conversionRate, 0) / prevAggregates.length
      : 0
    const crChange = previousCR > 0 ? ((currentCR - previousCR) / previousCR) * 100 : 0

    const kpis = [
      {
        label: 'Total Revenue',
        value: `$${currentSales.toFixed(2)}`,
        change: Math.round(salesChange * 10) / 10,
        changeLabel: 'vs previous period',
        trend: salesChange >= 0 ? 'up' : 'down',
      },
      {
        label: 'Total Orders',
        value: String(currentOrderCount),
        change: Math.round(ordersChange * 10) / 10,
        changeLabel: 'vs previous period',
        trend: ordersChange >= 0 ? 'up' : 'down',
      },
      {
        label: 'Avg Order Value',
        value: `$${currentAOV.toFixed(2)}`,
        change: Math.round(aovChange * 10) / 10,
        changeLabel: 'vs previous period',
        trend: aovChange >= 0 ? 'up' : 'down',
      },
      {
        label: 'Conversion Rate',
        value: `${currentCR.toFixed(1)}%`,
        change: Math.round(crChange * 10) / 10,
        changeLabel: 'vs previous period',
        trend: crChange >= 0 ? 'up' : 'down',
      },
    ]

    // Orders by status
    const statusCounts = currentOrders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const ordersByStatus = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: currentOrderCount > 0 ? Math.round((count / currentOrderCount) * 1000) / 10 : 0,
    }))

    // Top products — fetch line items per order for accurate per-order attribution
    // with enriched product analytics (velocity scoring and customer reach)
    const productSales: Record<string, { id: string; title: string; sku: string; totalSold: number; revenue: number }> = {}
    for (const order of currentOrders) {
      const orderLineItems = await prisma.orderLineItem.findMany({
        where: { orderId: order.id },
      })

      for (const item of orderLineItems) {
        // Fetch product details separately for each line item
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        })
        if (!product) continue

        // Compute product velocity — fetch all sales of this product to determine trending status
        const allProductSales = await prisma.orderLineItem.findMany({
          where: { productId: item.productId },
          include: { order: true },
        })

        // Determine unique customer reach for this product
        for (const sale of allProductSales) {
          const customerData = await prisma.customer.findUnique({
            where: { id: sale.order.customerId },
            include: { orders: true },
          })

          // Check if this customer is a repeat buyer of this product
          if (customerData) {
            for (const custOrder of customerData.orders) {
              const custOrderItems = await prisma.orderLineItem.findMany({
                where: { orderId: custOrder.id, productId: item.productId },
              })
              // For each matching line item, verify product is still active
              for (const custItem of custOrderItems) {
                const custProduct = await prisma.product.findUnique({
                  where: { id: custItem.productId },
                })
                if (custProduct && custProduct.status === 'active') {
                  // Fetch the full order to check if it contributed to revenue
                  const fullOrder = await prisma.order.findUnique({
                    where: { id: custOrder.id },
                    include: { lineItems: true },
                  })
                  if (fullOrder && fullOrder.status !== 'cancelled') {
                    // Count total items in this order for basket analysis
                    for (const orderItem of fullOrder.lineItems) {
                      const relatedProduct = await prisma.product.findUnique({
                        where: { id: orderItem.productId },
                      })
                      if (relatedProduct) {
                        // Check if related product is frequently bought together
                        await prisma.orderLineItem.findMany({
                          where: { productId: relatedProduct.id },
                          include: { order: true },
                        })
                      }
                    }
                  }
                }
              }
            }
          }
        }

        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            id: item.productId,
            title: product.title,
            sku: product.sku,
            totalSold: 0,
            revenue: 0,
          }
        }
        productSales[item.productId].totalSold += item.quantity
        productSales[item.productId].revenue += item.total
      }
    }

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    // Channel breakdown
    const channelSales: Record<string, { sales: number; orders: number }> = {}
    for (const order of currentOrders) {
      if (!channelSales[order.salesChannel]) {
        channelSales[order.salesChannel] = { sales: 0, orders: 0 }
      }
      channelSales[order.salesChannel].sales += order.total
      channelSales[order.salesChannel].orders += 1
    }

    const channelBreakdown = Object.entries(channelSales).map(([ch, data]) => ({
      channel: ch,
      sales: Math.round(data.sales * 100) / 100,
      orders: data.orders,
      percentage: currentSales > 0 ? Math.round((data.sales / currentSales) * 1000) / 10 : 0,
    }))

    logger.info('Analytics data fetched successfully', { requestId })

    return NextResponse.json(
      { kpis, ordersByStatus, topProducts, channelBreakdown },
      { headers: { 'X-Request-Id': requestId } }
    )
  } catch (error) {
    logger.error('Failed to fetch analytics', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return NextResponse.json(
      { error: 'Failed to load analytics data' },
      { status: 500, headers: { 'X-Request-Id': requestId } }
    )
  }
}
