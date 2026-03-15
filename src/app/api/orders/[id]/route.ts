import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { generateRequestId } from '@/lib/request-id'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = generateRequestId()
  const { id } = await params

  logger.info('Fetching order detail', { requestId, orderId: id })

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        lineItems: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!order) {
      logger.warn('Order not found', { requestId, orderId: id })
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404, headers: { 'X-Request-Id': requestId } }
      )
    }

    logger.info('Order fetched successfully', {
      requestId,
      orderId: id,
      orderNumber: order.orderNumber,
    })

    return NextResponse.json(order, {
      headers: { 'X-Request-Id': requestId },
    })
  } catch (error) {
    logger.error('Failed to fetch order', {
      requestId,
      orderId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return NextResponse.json(
      { error: 'Failed to load order' },
      { status: 500, headers: { 'X-Request-Id': requestId } }
    )
  }
}
