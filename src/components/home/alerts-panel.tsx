'use client'

import Link from 'next/link'
import { AlertTriangle, Info, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { Alert } from '@/lib/types'

const iconMap: Record<string, React.ElementType> = {
  warning: AlertTriangle,
  info: Info,
  error: AlertCircle,
}

const colorMap: Record<string, string> = {
  warning: 'bg-yellow-50 text-yellow-600 border-yellow-200',
  info: 'bg-blue-50 text-blue-600 border-blue-200',
  error: 'bg-red-50 text-red-600 border-red-200',
}

interface AlertsPanelProps {
  alerts: Alert[]
  loading?: boolean
}

export function AlertsPanel({ alerts, loading }: AlertsPanelProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-gray-900">Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold text-gray-900">Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No active alerts</p>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => {
              const Icon = iconMap[alert.type] || Info
              const colorClass = colorMap[alert.type] || colorMap.info
              return (
                <div
                  key={alert.id}
                  className={`flex items-start gap-3 rounded-lg border p-3 ${colorClass}`}
                >
                  <Icon className="h-4 w-4 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{alert.title}</p>
                    <p className="text-xs mt-0.5 opacity-80">{alert.description}</p>
                  </div>
                  {alert.actionLabel && alert.actionHref && (
                    <Button asChild variant="ghost" size="sm" className="shrink-0 text-xs h-7">
                      <Link href={alert.actionHref}>{alert.actionLabel}</Link>
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
