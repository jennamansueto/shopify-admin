import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { generateRequestId } from '@/lib/request-id'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = generateRequestId()
  const { id } = await params

  logger.info('Fulfilling order', { requestId, orderId: id })

  try {
    const order = await prisma.order.findUnique({ where: { id } })

    if (!order) {
      logger.warn('Order not found for fulfillment', { requestId, orderId: id })
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404, headers: { 'X-Request-Id': requestId } }
      )
    }

    if (order.fulfillmentStatus === 'fulfilled') {
      logger.warn('Order already fulfilled', { requestId, orderId: id })
      return NextResponse.json(
        { error: 'Order is already fulfilled' },
        { status: 400, headers: { 'X-Request-Id': requestId } }
      )
    }

    if (order.paymentStatus !== 'paid') {
      logger.warn('Cannot fulfill unpaid order', { requestId, orderId: id })
      return NextResponse.json(
        { error: 'Cannot fulfill order that has not been paid' },
        { status: 400, headers: { 'X-Request-Id': requestId } }
      )
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        fulfillmentStatus: 'fulfilled',
        status: 'shipped',
        updatedAt: new Date(),
      },
      include: {
        customer: true,
        lineItems: true,
      },
    })

    await prisma.activityEvent.create({
      data: {
        type: 'order_fulfilled',
        title: `Order #${order.orderNumber} fulfilled`,
        description: `Order has been marked as fulfilled and shipped`,
        metadata: JSON.stringify({
          orderId: order.id,
          orderNumber: order.orderNumber,
        }),
      },
    })

    logger.info('Order fulfilled successfully', {
      requestId,
      orderId: id,
      orderNumber: order.orderNumber,
    })

    return NextResponse.json(updatedOrder, {
      headers: { 'X-Request-Id': requestId },
    })
  } catch (error) {
    logger.error('Failed to fulfill order', {
      requestId,
      orderId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return NextResponse.json(
      { error: 'Failed to fulfill order' },
      { status: 500, headers: { 'X-Request-Id': requestId } }
    )
  }
}
