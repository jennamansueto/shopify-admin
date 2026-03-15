'use client'

import Link from 'next/link'
import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency, formatDate, formatStatusLabel, getStatusColor } from '@/lib/utils'
import type { Order } from '@/lib/types'

const channelLabels: Record<string, string> = {
  online_store: 'Online Store',
  pos: 'Point of Sale',
  wholesale: 'Wholesale',
  social: 'Social',
  marketplace: 'Marketplace',
}

interface OrderTableProps {
  orders: Order[]
  loading?: boolean
  sortBy: string
  sortOrder: 'asc' | 'desc'
  onSort: (field: string) => void
  page: number
  totalPages: number
  total: number
  onPageChange: (page: number) => void
}

function SortHeader({
  label,
  field,
  sortBy,
  sortOrder,
  onSort,
}: {
  label: string
  field: string
  sortBy: string
  sortOrder: string
  onSort: (field: string) => void
}) {
  return (
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-900 transition-colors"
    >
      {label}
      <ArrowUpDown className={`h-3 w-3 ${sortBy === field ? 'text-gray-900' : 'text-gray-400'}`} />
    </button>
  )
}

export function OrderTable({
  orders,
  loading,
  sortBy,
  sortOrder,
  onSort,
  page,
  totalPages,
  total,
  onPageChange,
}: OrderTableProps) {
  if (loading) {
    return (
      <div className="rounded-lg border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left"><Skeleton className="h-4 w-16" /></th>
                <th className="px-4 py-3 text-left"><Skeleton className="h-4 w-16" /></th>
                <th className="px-4 py-3 text-left"><Skeleton className="h-4 w-24" /></th>
                <th className="px-4 py-3 text-left"><Skeleton className="h-4 w-16" /></th>
                <th className="px-4 py-3 text-left"><Skeleton className="h-4 w-16" /></th>
                <th className="px-4 py-3 text-left"><Skeleton className="h-4 w-20" /></th>
                <th className="px-4 py-3 text-left"><Skeleton className="h-4 w-20" /></th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 10 }).map((_, i) => (
                <tr key={i} className="border-b last:border-b-0">
                  <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-16 rounded-full" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-20 rounded-full" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-12 text-center">
        <p className="text-sm text-muted-foreground">No orders found</p>
        <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filters</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-white">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50/50">
              <th className="px-4 py-3 text-left">
                <SortHeader label="Order" field="orderNumber" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
              </th>
              <th className="px-4 py-3 text-left">
                <SortHeader label="Date" field="createdAt" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
              </th>
              <th className="px-4 py-3 text-left">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</span>
              </th>
              <th className="px-4 py-3 text-left">
                <SortHeader label="Total" field="total" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
              </th>
              <th className="px-4 py-3 text-left">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</span>
              </th>
              <th className="px-4 py-3 text-left">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Fulfillment</span>
              </th>
              <th className="px-4 py-3 text-left">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Channel</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b last:border-b-0 hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3">
                  <Link
                    href={`/orders/${order.id}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    #{order.orderNumber}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {formatDate(order.createdAt)}
                </td>
                <td className="px-4 py-3">
                  {order.customer ? (
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {order.customer.firstName} {order.customer.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{order.customer.email}</p>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {formatCurrency(order.total)}
                </td>
                <td className="px-4 py-3">
                  <Badge className={getStatusColor(order.paymentStatus)} variant="secondary">
                    {formatStatusLabel(order.paymentStatus)}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge className={getStatusColor(order.fulfillmentStatus)} variant="secondary">
                    {formatStatusLabel(order.fulfillmentStatus)}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {channelLabels[order.salesChannel] || order.salesChannel}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t px-4 py-3">
        <p className="text-sm text-gray-500">
          {total} order{total !== 1 ? 's' : ''} total
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="h-8"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="h-8"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
