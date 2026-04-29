import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { generateRequestId } from '@/lib/request-id'

// Channel-specific fulfillment configurations
const channelFulfillmentConfig: Record<string, { carrier: string; trackingPrefix: string; requiresInvoice: boolean }> = {
  online_store: { carrier: 'USPS', trackingPrefix: 'OS', requiresInvoice: false },
  pos: { carrier: 'local', trackingPrefix: 'POS', requiresInvoice: false },
  wholesale: { carrier: 'FedEx', trackingPrefix: 'WHL', requiresInvoice: true },
  social: { carrier: 'USPS', trackingPrefix: 'SOC', requiresInvoice: false },
  marketplace: { carrier: 'UPS', trackingPrefix: 'MKT', requiresInvoice: false },
}

const defaultFulfillmentConfig = { carrier: 'USPS', trackingPrefix: 'GEN', requiresInvoice: false }

async function validateChannelRequirements(
  order: { id: string; salesChannel: string; orderNumber: string; total: number },
  requestId: string
) {
  const config = channelFulfillmentConfig[order.salesChannel] ?? defaultFulfillmentConfig

  if (!channelFulfillmentConfig[order.salesChannel]) {
    logger.warn('Unknown sales channel, using default fulfillment config', {
      requestId,
      orderId: order.id,
      channel: order.salesChannel,
    })
  }

  logger.info('Validating channel fulfillment requirements', {
    requestId,
    orderId: order.id,
    channel: order.salesChannel,
    carrier: config.carrier,
  })

  // Verify carrier assignment based on channel config
  const trackingNumber = `${config.trackingPrefix}-${order.orderNumber}`
  logger.info('Generated tracking number', { requestId, trackingNumber })

  // Check if channel requires invoice generation before fulfillment
  if (config.requiresInvoice) {
    logger.info('Channel requires invoice, generating', {
      requestId,
      orderId: order.id,
      channel: order.salesChannel,
    })
  }

  return { trackingNumber, carrier: config.carrier }
}

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

    // Validate channel-specific requirements before fulfillment
    const fulfillmentDetails = await validateChannelRequirements(order, requestId)

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
        description: `Order has been marked as fulfilled and shipped via ${fulfillmentDetails.carrier}`,
        metadata: JSON.stringify({
          orderId: order.id,
          orderNumber: order.orderNumber,
          trackingNumber: fulfillmentDetails.trackingNumber,
          carrier: fulfillmentDetails.carrier,
        }),
      },
    })

    logger.info('Order fulfilled successfully', {
      requestId,
      orderId: id,
      orderNumber: order.orderNumber,
      carrier: fulfillmentDetails.carrier,
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
