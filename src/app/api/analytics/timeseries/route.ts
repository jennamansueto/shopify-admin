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

    // Build a map from day-offset to aggregate for the previous period
    const prevAggregatesByOffset = new Map<number, typeof aggregates[number]>()
    if (compare) {
      const prevPeriodStartTime = new Date(periodStart)
      prevPeriodStartTime.setDate(prevPeriodStartTime.getDate() - days)
      for (const prev of prevAggregates) {
        const offset = Math.round((prev.date.getTime() - prevPeriodStartTime.getTime()) / (1000 * 60 * 60 * 24))
        prevAggregatesByOffset.set(offset, prev)
      }
    }

    const timeseries = aggregates.map((agg) => {
      const dayOffset = Math.round((agg.date.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24))
      const prevAgg = prevAggregatesByOffset.get(dayOffset)
      return {
        date: agg.date.toISOString().split('T')[0],
        sales: agg.totalSales,
        orders: agg.orderCount,
        previousSales: compare && prevAgg ? prevAgg.totalSales : undefined,
        previousOrders: compare && prevAgg ? prevAgg.orderCount : undefined,
      }
    })

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
