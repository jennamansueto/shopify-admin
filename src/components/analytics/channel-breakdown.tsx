'use client'

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils'
import type { ChannelBreakdown as ChannelBreakdownType } from '@/lib/types'

const channelLabels: Record<string, string> = {
  online_store: 'Online Store',
  pos: 'Point of Sale',
  wholesale: 'Wholesale',
  social: 'Social',
  marketplace: 'Marketplace',
}

const COLORS = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626', '#6b7280']

interface ChannelBreakdownProps {
  data: ChannelBreakdownType[]
  loading?: boolean
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ payload: ChannelBreakdownType & { name: string } }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload[0]) return null
  const item = payload[0].payload
  return (
    <div className="rounded-lg border bg-white p-3 shadow-md">
      <p className="text-sm font-medium">{item.name}</p>
      <p className="text-sm text-gray-600">{formatCurrency(item.sales)}</p>
      <p className="text-xs text-gray-500">{item.orders} orders ({item.percentage}%)</p>
    </div>
  )
}

export function ChannelBreakdown({ data, loading }: ChannelBreakdownProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-gray-900">Sales by Channel</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    )
  }

  const chartData = data.map((d) => ({
    ...d,
    name: channelLabels[d.channel] || d.channel,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold text-gray-900">Sales by Channel</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-[250px] flex items-center justify-center text-sm text-muted-foreground">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="sales"
                nameKey="name"
              >
                {chartData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
