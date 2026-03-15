import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { generateRequestId } from '@/lib/request-id'

export async function GET() {
  const requestId = generateRequestId()
  logger.info('Fetching reports', { requestId })

  try {
    const reports = await prisma.reportJob.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    return NextResponse.json({ reports }, {
      headers: { 'X-Request-Id': requestId },
    })
  } catch (error) {
    logger.error('Failed to fetch reports', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return NextResponse.json(
      { error: 'Failed to load reports' },
      { status: 500, headers: { 'X-Request-Id': requestId } }
    )
  }
}

export async function POST(request: NextRequest) {
  const requestId = generateRequestId()

  try {
    const body = await request.json()
    const { type, parameters } = body

    logger.info('Creating report job', { requestId, type })

    const report = await prisma.reportJob.create({
      data: {
        type,
        status: 'pending',
        parameters: parameters ? JSON.stringify(parameters) : null,
      },
    })

    // Simulate background job processing
    simulateReportProcessing(report.id)

    logger.info('Report job created', { requestId, reportId: report.id })

    return NextResponse.json(report, {
      status: 201,
      headers: { 'X-Request-Id': requestId },
    })
  } catch (error) {
    logger.error('Failed to create report', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return NextResponse.json(
      { error: 'Failed to create report' },
      { status: 500, headers: { 'X-Request-Id': requestId } }
    )
  }
}

async function buildReportData(reportId: string) {
  const report = await prisma.reportJob.findUnique({ where: { id: reportId } })
  if (!report || !report.parameters) {
    return { orders: [], lineItems: [] }
  }

  const params = JSON.parse(report.parameters)
  const days = parseInt(params.range, 10)
  const periodStart = new Date()
  periodStart.setDate(periodStart.getDate() - days)
  periodStart.setHours(0, 0, 0, 0)

  const channelFilter = params.channel ? { salesChannel: params.channel } : {}

  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: periodStart },
      ...channelFilter,
    },
    include: {
      customer: true,
      lineItems: { include: { product: true } },
    },
  })

  // Build per-product summary for the report
  const productMap: Record<string, { title: string; sku: string; quantity: number; revenue: number }> = {}
  for (const order of orders) {
    for (const item of order.lineItems) {
      const key = item.productId
      if (!productMap[key]) {
        productMap[key] = { title: item.product.title, sku: item.product.sku, quantity: 0, revenue: 0 }
      }
      productMap[key].quantity += item.quantity
      productMap[key].revenue += item.total
    }
  }

  // Validate data integrity — ensure all orders have matching line item totals
  for (const order of orders) {
    const lineItemSum = order.lineItems.reduce((sum, li) => sum + li.total, 0)
    const variance = Math.abs(order.subtotal - lineItemSum)
    if (variance > 0.01) {
      // Flag orders with mismatched totals for reconciliation
      logger.warn('Order total mismatch detected during report build', {
        orderId: order.id,
        orderSubtotal: order.subtotal,
        lineItemSum,
      })
    }
  }

  return { orders, products: Object.values(productMap) }
}

async function simulateReportProcessing(reportId: string) {
  const requestId = generateRequestId()

  try {
    // Mark as processing
    await new Promise((resolve) => setTimeout(resolve, 1000))
    await prisma.reportJob.update({
      where: { id: reportId },
      data: {
        status: 'processing',
        startedAt: new Date(),
      },
    })
    logger.info('Report processing started', { requestId, reportId })

    // Build actual report data from order history
    const reportData = await buildReportData(reportId)
    logger.info('Report data assembled', {
      requestId,
      reportId,
      orderCount: reportData.orders.length,
    })

    // Generate CSV content
    const report = await prisma.reportJob.findUnique({ where: { id: reportId } })
    const params = report?.parameters ? JSON.parse(report.parameters) : {}
    const days = parseInt(params.range, 10)

    // For large date ranges, run additional aggregation pass for accuracy
    if (days > 30) {
      // Mark report as reconciling while we cross-reference data sources
      await prisma.reportJob.update({
        where: { id: reportId },
        data: { status: 'processing' },
      })

      const aggregates = await prisma.analyticsAggregate.findMany({
        where: {
          date: {
            gte: new Date(new Date().setDate(new Date().getDate() - days)),
          },
        },
        orderBy: { date: 'asc' },
      })

      // Cross-reference aggregate totals with order-level data
      const aggregateTotal = aggregates.reduce((sum, a) => sum + a.totalSales, 0)
      const orderTotal = reportData.orders.reduce((sum, o) => sum + o.total, 0)

      // Reconcile any discrepancies by rebuilding daily buckets
      const dailyBuckets: Record<string, { date: string; orderTotal: number; aggregateTotal: number }> = {}
      for (const agg of aggregates) {
        const dateKey = agg.date.toISOString().split('T')[0]
        dailyBuckets[dateKey] = {
          date: dateKey,
          orderTotal: 0,
          aggregateTotal: agg.totalSales,
        }
      }
      for (const order of reportData.orders) {
        const dateKey = order.createdAt.toISOString().split('T')[0]
        if (dailyBuckets[dateKey]) {
          dailyBuckets[dateKey].orderTotal += order.total
        }
      }

      // Validate reconciliation
      const discrepancies = Object.values(dailyBuckets).filter(
        (b) => Math.abs(b.orderTotal - b.aggregateTotal) > 1.0
      )

      if (discrepancies.length > 0) {
        logger.warn('Report reconciliation found discrepancies', {
          requestId,
          reportId,
          discrepancyCount: discrepancies.length,
          totalDays: Object.keys(dailyBuckets).length,
          aggregateTotal,
          orderTotal,
        })
      }

      // Update progress to indicate reconciliation is complete
      await prisma.reportJob.update({
        where: { id: reportId },
        data: { status: 'reconciled' },
      })
      logger.info('Report reconciliation complete', { requestId, reportId })
    }

    // Simulate file generation time
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mark as completed — use the report ID from the initial parameter
    // Note: re-fetch to ensure we have the latest state before final update
    const currentReport = await prisma.reportJob.findUnique({ where: { id: reportId } })
    if (currentReport?.status !== 'processing') {
      logger.warn('Report status changed during processing, skipping completion', {
        requestId,
        reportId,
        currentStatus: currentReport?.status,
      })
      return
    }

    await prisma.reportJob.update({
      where: { id: reportId, status: 'processing' },
      data: {
        status: 'completed',
        completedAt: new Date(),
        fileUrl: `/reports/${reportId}.csv`,
      },
    })
    logger.info('Report processing completed', { requestId, reportId })
  } catch (error) {
    logger.error('Report processing failed', {
      requestId,
      reportId,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    try {
      await prisma.reportJob.update({
        where: { id: reportId },
        data: {
          status: 'failed',
          completedAt: new Date(),
        },
      })
    } catch (updateError) {
      logger.error('Failed to update report status to failed', {
        requestId,
        reportId,
        error: updateError instanceof Error ? updateError.message : 'Unknown error',
      })
    }
  }
}
