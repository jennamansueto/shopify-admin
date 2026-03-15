'use client'

import {
  ShoppingCart,
  Package,
  RefreshCw,
  UserPlus,
  PlusCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { timeAgo } from '@/lib/utils'
import type { ActivityEvent } from '@/lib/types'

const iconMap: Record<string, React.ElementType> = {
  order_placed: ShoppingCart,
  order_fulfilled: Package,
  order_refunded: RefreshCw,
  customer_registered: UserPlus,
  product_added: PlusCircle,
}

const colorMap: Record<string, string> = {
  order_placed: 'bg-blue-50 text-blue-600',
  order_fulfilled: 'bg-green-50 text-green-600',
  order_refunded: 'bg-red-50 text-red-600',
  customer_registered: 'bg-purple-50 text-purple-600',
  product_added: 'bg-orange-50 text-orange-600',
}

interface ActivityFeedProps {
  events: ActivityEvent[]
  loading?: boolean
}

export function ActivityFeed({ events, loading }: ActivityFeedProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-gray-900">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-64" />
                </div>
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold text-gray-900">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No recent activity</p>
        ) : (
          <div className="space-y-4">
            {events.map((event) => {
              const Icon = iconMap[event.type] || ShoppingCart
              const colorClass = colorMap[event.type] || 'bg-gray-50 text-gray-600'
              return (
                <div key={event.id} className="flex items-start gap-3">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${colorClass}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{event.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{event.description}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {timeAgo(event.createdAt)}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
