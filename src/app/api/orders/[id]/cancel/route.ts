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

  logger.info('Cancelling order', { requestId, orderId: id })

  try {
    const order = await prisma.order.findUnique({ where: { id } })

    if (!order) {
      logger.warn('Order not found for cancellation', { requestId, orderId: id })
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404, headers: { 'X-Request-Id': requestId } }
      )
    }

    if (order.status === 'cancelled') {
      logger.warn('Order already cancelled', { requestId, orderId: id })
      return NextResponse.json(
        { error: 'Order is already cancelled' },
        { status: 400, headers: { 'X-Request-Id': requestId } }
      )
    }

    if (order.fulfillmentStatus === 'fulfilled') {
      logger.warn('Cannot cancel fulfilled order', { requestId, orderId: id })
      return NextResponse.json(
        { error: 'Cannot cancel an order that has been fulfilled' },
        { status: 400, headers: { 'X-Request-Id': requestId } }
      )
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: 'cancelled',
        paymentStatus: order.paymentStatus === 'paid' ? 'refunded' : order.paymentStatus,
        updatedAt: new Date(),
      },
      include: {
        customer: true,
        lineItems: true,
      },
    })

    await prisma.activityEvent.create({
      data: {
        type: 'order_refunded',
        title: `Order #${order.orderNumber} cancelled`,
        description: `Order has been cancelled${order.paymentStatus === 'paid' ? ' and refunded' : ''}`,
        metadata: JSON.stringify({
          orderId: order.id,
          orderNumber: order.orderNumber,
        }),
      },
    })

    logger.info('Order cancelled successfully', {
      requestId,
      orderId: id,
      orderNumber: order.orderNumber,
    })

    return NextResponse.json(updatedOrder, {
      headers: { 'X-Request-Id': requestId },
    })
  } catch (error) {
    logger.error('Failed to cancel order', {
      requestId,
      orderId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return NextResponse.json(
      { error: 'Failed to cancel order' },
      { status: 500, headers: { 'X-Request-Id': requestId } }
    )
  }
}
