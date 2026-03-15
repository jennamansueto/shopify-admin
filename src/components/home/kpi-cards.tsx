'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn, formatPercentage } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import type { KPIMetric } from '@/lib/types'

interface KPICardsProps {
  kpis: KPIMetric[]
  loading?: boolean
}

export function KPICards({ kpis, loading }: KPICardsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-3 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <Card key={kpi.label}>
          <CardHeader className="pb-2">
            <CardTitle>{kpi.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
            <div className="mt-1 flex items-center gap-1 text-xs">
              {kpi.trend === 'up' ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : kpi.trend === 'down' ? (
                <TrendingDown className="h-3 w-3 text-red-600" />
              ) : (
                <Minus className="h-3 w-3 text-gray-400" />
              )}
              <span
                className={cn(
                  'font-medium',
                  kpi.trend === 'up' && 'text-green-600',
                  kpi.trend === 'down' && 'text-red-600',
                  kpi.trend === 'neutral' && 'text-gray-500'
                )}
              >
                {formatPercentage(kpi.change)}
              </span>
              <span className="text-muted-foreground">{kpi.changeLabel}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
