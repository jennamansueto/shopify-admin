import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { generateRequestId } from '@/lib/request-id'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  const requestId = generateRequestId()
  const { searchParams } = new URL(request.url)

  const page = parseInt(searchParams.get('page') || '1', 10)
  const pageSize = parseInt(searchParams.get('pageSize') || '20', 10)
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || ''
  const paymentStatus = searchParams.get('paymentStatus') || ''
  const fulfillmentStatus = searchParams.get('fulfillmentStatus') || ''
  const channel = searchParams.get('channel') || ''
  const sortBy = searchParams.get('sortBy') || 'createdAt'
  const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'

  logger.info('Fetching orders', {
    requestId,
    page,
    pageSize,
    search,
    status,
    fulfillmentStatus,
    channel,
    sortBy,
    sortOrder,
  })

  try {
    const where: Prisma.OrderWhereInput = {}

    if (status) where.status = status
    if (paymentStatus) where.paymentStatus = paymentStatus
    if (fulfillmentStatus) where.fulfillmentStatus = fulfillmentStatus
    if (channel) where.salesChannel = channel

    if (search) {
      const orderNum = parseInt(search, 10)
      where.OR = [
        ...(isNaN(orderNum) ? [] : [{ orderNumber: orderNum }]),
        {
          customer: {
            OR: [
              { firstName: { contains: search } },
              { lastName: { contains: search } },
              { email: { contains: search } },
            ],
          },
        },
      ]
    }

    const orderByField = ['orderNumber', 'total', 'createdAt', 'status', 'paymentStatus', 'fulfillmentStatus'].includes(sortBy)
      ? sortBy
      : 'createdAt'

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: true,
          lineItems: true,
        },
        orderBy: { [orderByField]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.order.count({ where }),
    ])

    const totalPages = Math.ceil(total / pageSize)

    logger.info('Orders fetched successfully', {
      requestId,
      total,
      page,
      totalPages,
    })

    return NextResponse.json(
      {
        orders,
        total,
        page,
        pageSize,
        totalPages,
      },
      { headers: { 'X-Request-Id': requestId } }
    )
  } catch (error) {
    logger.error('Failed to fetch orders', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return NextResponse.json(
      { error: 'Failed to load orders' },
      { status: 500, headers: { 'X-Request-Id': requestId } }
    )
  }
}
