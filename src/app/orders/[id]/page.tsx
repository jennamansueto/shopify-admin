'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package, CreditCard, Truck, MapPin, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  formatCurrency,
  formatDateTime,
  formatStatusLabel,
  getStatusColor,
} from '@/lib/utils'
import type { Order } from '@/lib/types'

const channelLabels: Record<string, string> = {
  online_store: 'Online Store',
  pos: 'Point of Sale',
  wholesale: 'Wholesale',
  social: 'Social',
  marketplace: 'Marketplace',
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fulfilling, setFulfilling] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [fulfillDialogOpen, setFulfillDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${params.id}`)
        if (res.status === 404) {
          setError('Order not found')
          return
        }
        if (!res.ok) throw new Error('Failed to load order')
        const data = await res.json()
        setOrder(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [params.id])

  const handleFulfill = async () => {
    if (!order) return
    setFulfilling(true)
    try {
      const res = await fetch(`/api/orders/${order.id}/fulfill`, { method: 'POST' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to fulfill order')
      }
      const updated = await res.json()
      setOrder(updated)
      setFulfillDialogOpen(false)
      toast.success(`Order #${order.orderNumber} has been fulfilled`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to fulfill order')
    } finally {
      setFulfilling(false)
    }
  }

  const handleCancel = async () => {
    if (!order) return
    setCancelling(true)
    try {
      const res = await fetch(`/api/orders/${order.id}/cancel`, { method: 'POST' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to cancel order')
      }
      const updated = await res.json()
      setOrder(updated)
      setCancelDialogOpen(false)
      toast.success(`Order #${order.orderNumber} has been cancelled`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to cancel order')
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/30">
        <Header title="Order Details" />
        <div className="p-6 space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full rounded-lg" />
              <Skeleton className="h-48 w-full rounded-lg" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-36 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50/30">
        <Header title="Order Details" />
        <div className="p-6">
          <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
            <p className="text-sm text-red-800">{error || 'Order not found'}</p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/orders">Back to orders</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const canFulfill = order.fulfillmentStatus !== 'fulfilled' && order.paymentStatus === 'paid' && order.status !== 'cancelled'
  const canCancel = order.status !== 'cancelled' && order.fulfillmentStatus !== 'fulfilled'

  return (
    <div className="min-h-screen bg-gray-50/30">
      <Header
        title={`Order #${order.orderNumber}`}
        actions={
          <div className="flex items-center gap-2">
            {canFulfill && (
              <Dialog open={fulfillDialogOpen} onOpenChange={setFulfillDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Package className="h-4 w-4 mr-1" />
                    Fulfill order
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Fulfill Order #{order.orderNumber}</DialogTitle>
                    <DialogDescription>
                      This will mark the order as fulfilled and shipped. The customer will be notified.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setFulfillDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleFulfill} disabled={fulfilling}>
                      {fulfilling ? 'Fulfilling...' : 'Confirm fulfillment'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
            {canCancel && (
              <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm">Cancel order</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cancel Order #{order.orderNumber}</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. {order.paymentStatus === 'paid' ? 'A refund will be issued to the customer.' : 'The order will be marked as cancelled.'}
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
                      Keep order
                    </Button>
                    <Button variant="destructive" onClick={handleCancel} disabled={cancelling}>
                      {cancelling ? 'Cancelling...' : 'Confirm cancellation'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        }
      />
      <div className="p-6">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href="/orders">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to orders
          </Link>
        </Button>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Order status */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-gray-900">Order Status</CardTitle>
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(order.status)} variant="secondary">
                      {formatStatusLabel(order.status)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Payment</p>
                      <Badge className={getStatusColor(order.paymentStatus)} variant="secondary">
                        {formatStatusLabel(order.paymentStatus)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Fulfillment</p>
                      <Badge className={getStatusColor(order.fulfillmentStatus)} variant="secondary">
                        {formatStatusLabel(order.fulfillmentStatus)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Created</p>
                      <p className="text-sm font-medium">{formatDateTime(order.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Line items */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold text-gray-900">Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.lineItems?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100 text-xs font-medium text-gray-500">
                          {item.quantity}x
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.title}</p>
                          <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{formatCurrency(item.total)}</p>
                        <p className="text-xs text-gray-500">{formatCurrency(item.unitPrice)} each</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-medium">{formatCurrency(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tax</span>
                    <span className="font-medium">{formatCurrency(order.tax)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Shipping</span>
                    <span className="font-medium">{order.shipping === 0 ? 'Free' : formatCurrency(order.shipping)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Customer */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold text-gray-900">Customer</CardTitle>
              </CardHeader>
              <CardContent>
                {order.customer ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {order.customer.firstName} {order.customer.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{order.customer.email}</p>
                      {order.customer.phone && (
                        <p className="text-sm text-gray-500">{order.customer.phone}</p>
                      )}
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Total orders</p>
                        <p className="text-sm font-medium">{order.customer.totalOrders}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Total spent</p>
                        <p className="text-sm font-medium">{formatCurrency(order.customer.totalSpent)}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No customer information</p>
                )}
              </CardContent>
            </Card>

            {/* Shipping */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold text-gray-900">Shipping Address</CardTitle>
              </CardHeader>
              <CardContent>
                {order.shippingAddress ? (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                    <p className="text-sm text-gray-600">{order.shippingAddress}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No shipping address</p>
                )}
              </CardContent>
            </Card>

            {/* Additional info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold text-gray-900">Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Sales Channel</p>
                    <p className="text-sm font-medium">{channelLabels[order.salesChannel] || order.salesChannel}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Currency</p>
                    <p className="text-sm font-medium">{order.currency}</p>
                  </div>
                  {order.tags && (
                    <div>
                      <p className="text-xs text-gray-500">Tags</p>
                      <Badge variant="outline" className="mt-1">{order.tags}</Badge>
                    </div>
                  )}
                  {order.notes && (
                    <div>
                      <p className="text-xs text-gray-500">Notes</p>
                      <p className="text-sm text-gray-600">{order.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
