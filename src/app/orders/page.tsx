'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import { Header } from '@/components/layout/header'
import { OrderFilters } from '@/components/orders/order-filters'
import { OrderTable } from '@/components/orders/order-table'
import { Skeleton } from '@/components/ui/skeleton'
import type { Order, OrdersResponse } from '@/lib/types'

function OrdersContent() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [paymentStatus, setPaymentStatus] = useState('all')
  const [fulfillmentStatus, setFulfillmentStatus] = useState('all')
  const [channel, setChannel] = useState('all')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('pageSize', '20')
      params.set('sortBy', sortBy)
      params.set('sortOrder', sortOrder)
      if (search) params.set('search', search)
      if (status && status !== 'all') params.set('status', status)
      if (paymentStatus && paymentStatus !== 'all') params.set('paymentStatus', paymentStatus)
      if (fulfillmentStatus && fulfillmentStatus !== 'all') params.set('fulfillmentStatus', fulfillmentStatus)
      if (channel && channel !== 'all') params.set('channel', channel)

      const res = await fetch(`/api/orders?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to load orders')
      const data: OrdersResponse = await res.json()

      setOrders(data.orders)
      setTotal(data.total)
      setTotalPages(data.totalPages)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [page, sortBy, sortOrder, search, status, paymentStatus, fulfillmentStatus, channel])

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchOrders()
    }, search ? 300 : 0)
    return () => clearTimeout(debounce)
  }, [fetchOrders, search])

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
    setPage(1)
  }

  const handleClearFilters = () => {
    setSearch('')
    setStatus('all')
    setPaymentStatus('all')
    setFulfillmentStatus('all')
    setChannel('all')
    setPage(1)
  }

  const hasActiveFilters =
    search !== '' ||
    (status !== 'all' && status !== '') ||
    (paymentStatus !== 'all' && paymentStatus !== '') ||
    (fulfillmentStatus !== 'all' && fulfillmentStatus !== '') ||
    (channel !== 'all' && channel !== '')

  return (
    <div className="min-h-screen bg-gray-50/30">
      <Header title="Orders" description="Manage and track customer orders" />
      <div className="p-6 space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {error}
          </div>
        )}

        <OrderFilters
          search={search}
          onSearchChange={(v) => { setSearch(v); setPage(1) }}
          status={status}
          onStatusChange={(v) => { setStatus(v); setPage(1) }}
          paymentStatus={paymentStatus}
          onPaymentStatusChange={(v) => { setPaymentStatus(v); setPage(1) }}
          fulfillmentStatus={fulfillmentStatus}
          onFulfillmentStatusChange={(v) => { setFulfillmentStatus(v); setPage(1) }}
          channel={channel}
          onChannelChange={(v) => { setChannel(v); setPage(1) }}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        <OrderTable
          orders={orders}
          loading={loading}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          page={page}
          totalPages={totalPages}
          total={total}
          onPageChange={setPage}
        />
      </div>
    </div>
  )
}

function OrdersLoading() {
  return (
    <div className="min-h-screen bg-gray-50/30">
      <Header title="Orders" description="Manage and track customer orders" />
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-[500px] w-full rounded-lg" />
      </div>
    </div>
  )
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<OrdersLoading />}>
      <OrdersContent />
    </Suspense>
  )
}
