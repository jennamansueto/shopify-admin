import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { generateRequestId } from '@/lib/request-id'

export async function GET() {
  const requestId = generateRequestId()
  logger.info('Fetching home dashboard data', { requestId })

  try {
    const now = new Date()
    const todayStart = new Date(now)
    todayStart.setHours(0, 0, 0, 0)
    const yesterdayStart = new Date(todayStart)
    yesterdayStart.setDate(yesterdayStart.getDate() - 1)

    const last7DaysStart = new Date(todayStart)
    last7DaysStart.setDate(last7DaysStart.getDate() - 7)
    const prev7DaysStart = new Date(last7DaysStart)
    prev7DaysStart.setDate(prev7DaysStart.getDate() - 7)

    // Current period metrics (last 7 days)
    const currentOrders = await prisma.order.findMany({
      where: { createdAt: { gte: last7DaysStart } },
    })
    const previousOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: prev7DaysStart, lt: last7DaysStart },
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

    // Conversion rate from analytics aggregates
    const recentAggregates = await prisma.analyticsAggregate.findMany({
      where: { date: { gte: last7DaysStart } },
    })
    const prevAggregates = await prisma.analyticsAggregate.findMany({
      where: { date: { gte: prev7DaysStart, lt: last7DaysStart } },
    })

    const currentCR = recentAggregates.length > 0
      ? recentAggregates.reduce((sum, a) => sum + a.conversionRate, 0) / recentAggregates.length
      : 0
    const previousCR = prevAggregates.length > 0
      ? prevAggregates.reduce((sum, a) => sum + a.conversionRate, 0) / prevAggregates.length
      : 0
    const crChange = previousCR > 0 ? ((currentCR - previousCR) / previousCR) * 100 : 0

    const kpis = [
      {
        label: 'Total Sales',
        value: `$${currentSales.toFixed(2)}`,
        change: Math.round(salesChange * 10) / 10,
        changeLabel: 'vs previous 7 days',
        trend: salesChange >= 0 ? 'up' : 'down',
      },
      {
        label: 'Orders',
        value: String(currentOrderCount),
        change: Math.round(ordersChange * 10) / 10,
        changeLabel: 'vs previous 7 days',
        trend: ordersChange >= 0 ? 'up' : 'down',
      },
      {
        label: 'Conversion Rate',
        value: `${currentCR.toFixed(1)}%`,
        change: Math.round(crChange * 10) / 10,
        changeLabel: 'vs previous 7 days',
        trend: crChange >= 0 ? 'up' : 'down',
      },
      {
        label: 'Avg Order Value',
        value: `$${currentAOV.toFixed(2)}`,
        change: Math.round(aovChange * 10) / 10,
        changeLabel: 'vs previous 7 days',
        trend: aovChange >= 0 ? 'up' : 'down',
      },
    ]

    // Recent activity
    const recentActivity = await prisma.activityEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    // Alerts
    const alerts = []

    const pendingOrders = await prisma.order.count({
      where: { status: 'pending' },
    })
    if (pendingOrders > 0) {
      alerts.push({
        id: 'pending-orders',
        type: 'warning',
        title: `${pendingOrders} orders awaiting confirmation`,
        description: 'Review and confirm pending orders to keep fulfillment on track.',
        actionLabel: 'View orders',
        actionHref: '/orders?status=pending',
      })
    }

    const unfulfilledOrders = await prisma.order.count({
      where: { fulfillmentStatus: 'unfulfilled', paymentStatus: 'paid' },
    })
    if (unfulfilledOrders > 0) {
      alerts.push({
        id: 'unfulfilled-orders',
        type: 'info',
        title: `${unfulfilledOrders} paid orders awaiting fulfillment`,
        description: 'These orders have been paid and are ready to ship.',
        actionLabel: 'Fulfill orders',
        actionHref: '/orders?fulfillmentStatus=unfulfilled&paymentStatus=paid',
      })
    }

    const lowStockProducts = await prisma.product.count({
      where: { inventory: { lt: 50 }, status: 'active' },
    })
    if (lowStockProducts > 0) {
      alerts.push({
        id: 'low-stock',
        type: 'warning',
        title: `${lowStockProducts} products with low inventory`,
        description: 'Some products are running low on stock and may need reordering.',
        actionLabel: 'View products',
        actionHref: '/products',
      })
    }

    logger.info('Home data fetched successfully', { requestId })

    return NextResponse.json({ kpis, recentActivity, alerts }, {
      headers: { 'X-Request-Id': requestId },
    })
  } catch (error) {
    logger.error('Failed to fetch home data', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return NextResponse.json(
      { error: 'Failed to load dashboard data' },
      { status: 500, headers: { 'X-Request-Id': requestId } }
    )
  }
}
