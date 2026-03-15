import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { generateRequestId } from '@/lib/request-id'

export async function GET(request: NextRequest) {
  const requestId = generateRequestId()
  const { searchParams } = new URL(request.url)

  const range = searchParams.get('range') || '30'
  const compare = searchParams.get('compare') === 'true'

  logger.info('Fetching timeseries data', { requestId, range, compare })

  try {
    const days = parseInt(range, 10)
    const now = new Date()
    const periodStart = new Date(now)
    periodStart.setDate(periodStart.getDate() - days)
    periodStart.setHours(0, 0, 0, 0)

    const aggregates = await prisma.analyticsAggregate.findMany({
      where: { date: { gte: periodStart } },
      orderBy: { date: 'asc' },
    })

    let prevAggregates: typeof aggregates = []
    if (compare) {
      const prevPeriodStart = new Date(periodStart)
      prevPeriodStart.setDate(prevPeriodStart.getDate() - days)

      prevAggregates = await prisma.analyticsAggregate.findMany({
        where: { date: { gte: prevPeriodStart, lt: periodStart } },
        orderBy: { date: 'asc' },
      })
    }

    const timeseries = aggregates.map((agg, index) => ({
      date: agg.date.toISOString().split('T')[0],
      sales: agg.totalSales,
      orders: agg.orderCount,
      previousSales: compare && prevAggregates[index] ? prevAggregates[index].totalSales : undefined,
      previousOrders: compare && prevAggregates[index] ? prevAggregates[index].orderCount : undefined,
    }))

    logger.info('Timeseries data fetched', { requestId, points: timeseries.length })

    return NextResponse.json({ timeseries }, {
      headers: { 'X-Request-Id': requestId },
    })
  } catch (error) {
    logger.error('Failed to fetch timeseries', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return NextResponse.json(
      { error: 'Failed to load timeseries data' },
      { status: 500, headers: { 'X-Request-Id': requestId } }
    )
  }
}
