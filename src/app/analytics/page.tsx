'use client'

import { useEffect, useState, useCallback } from 'react'
import { Download, FileText, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AnalyticsKPIs } from '@/components/analytics/analytics-kpis'
import { SalesChart } from '@/components/analytics/sales-chart'
import { OrdersByStatus } from '@/components/analytics/orders-by-status'
import { TopProducts } from '@/components/analytics/top-products'
import { ChannelBreakdown } from '@/components/analytics/channel-breakdown'
import type {
  KPIMetric,
  TimeseriesPoint,
  StatusBreakdown,
  TopProduct,
  ChannelBreakdown as ChannelBreakdownType,
  ReportJob,
} from '@/lib/types'

export default function AnalyticsPage() {
  const [range, setRange] = useState('30')
  const [channel, setChannel] = useState('all')
  const [compare, setCompare] = useState(false)

  const [kpis, setKpis] = useState<KPIMetric[]>([])
  const [timeseries, setTimeseries] = useState<TimeseriesPoint[]>([])
  const [ordersByStatus, setOrdersByStatus] = useState<StatusBreakdown[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [channelBreakdown, setChannelBreakdown] = useState<ChannelBreakdownType[]>([])

  const [loading, setLoading] = useState(true)
  const [timeseriesLoading, setTimeseriesLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generatingReport, setGeneratingReport] = useState(false)

  const fetchAnalytics = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set('range', range)
      if (channel && channel !== 'all') params.set('channel', channel)
      if (compare) params.set('compare', 'true')

      const res = await fetch(`/api/analytics?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to load analytics')
      const data = await res.json()

      setKpis(data.kpis)
      setOrdersByStatus(data.ordersByStatus)
      setTopProducts(data.topProducts)
      setChannelBreakdown(data.channelBreakdown)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [range, channel, compare])

  const fetchTimeseries = useCallback(async () => {
    setTimeseriesLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('range', range)
      if (compare) params.set('compare', 'true')

      const res = await fetch(`/api/analytics/timeseries?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to load chart data')
      const data = await res.json()
      setTimeseries(data.timeseries)
    } catch {
      // Chart error is non-critical
    } finally {
      setTimeseriesLoading(false)
    }
  }, [range, compare])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  useEffect(() => {
    fetchTimeseries()
  }, [fetchTimeseries])

  const handleGenerateReport = async () => {
    setGeneratingReport(true)
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'sales_summary',
          parameters: { range, channel: channel !== 'all' ? channel : null },
        }),
      })
      if (!res.ok) throw new Error('Failed to create report')
      const report: ReportJob = await res.json()

      toast.success('Report generation started')

      // Poll for completion
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await fetch(`/api/reports/${report.id}`)
          if (statusRes.ok) {
            const updated: ReportJob = await statusRes.json()
            if (updated.status === 'completed') {
              clearInterval(pollInterval)
              setGeneratingReport(false)
              toast.success('Report ready for download', {
                action: {
                  label: 'Download',
                  onClick: () => {
                    toast.info('Report download initiated')
                  },
                },
              })
            } else if (updated.status === 'failed') {
              clearInterval(pollInterval)
              setGeneratingReport(false)
              toast.error('Report generation failed')
            }
          }
        } catch {
          clearInterval(pollInterval)
          setGeneratingReport(false)
        }
      }, 2000)

      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(pollInterval)
        setGeneratingReport(false)
      }, 30000)
    } catch (err) {
      setGeneratingReport(false)
      toast.error(err instanceof Error ? err.message : 'Failed to generate report')
    }
  }

  const handleExportCSV = () => {
    // Generate CSV from current data
    if (topProducts.length === 0) {
      toast.error('No data to export')
      return
    }

    const headers = ['Product', 'SKU', 'Units Sold', 'Revenue']
    const rows = topProducts.map((p) => [
      p.title,
      p.sku,
      String(p.totalSold),
      p.revenue.toFixed(2),
    ])

    const escapeCSV = (val: string) => {
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        return `"${val.replace(/"/g, '""')}"`
      }
      return val
    }
    const csv = [headers, ...rows].map((row) => row.map(escapeCSV).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-export-${range}d.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Export downloaded')
  }

  return (
    <div className="min-h-screen bg-gray-50/30">
      <Header
        title="Analytics"
        description="Store performance and insights"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              disabled={loading}
            >
              <Download className="h-4 w-4 mr-1" />
              Export CSV
            </Button>
            <Button
              size="sm"
              onClick={handleGenerateReport}
              disabled={generatingReport}
            >
              {generatingReport ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <FileText className="h-4 w-4 mr-1" />
              )}
              {generatingReport ? 'Generating...' : 'Generate Report'}
            </Button>
          </div>
        }
      />
      <div className="p-6 space-y-6">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-3">
          <Select value={range} onValueChange={(v) => setRange(v)}>
            <SelectTrigger className="w-[160px] h-9">
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Today</SelectItem>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Select value={channel} onValueChange={(v) => setChannel(v)}>
            <SelectTrigger className="w-[160px] h-9">
              <SelectValue placeholder="Channel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All channels</SelectItem>
              <SelectItem value="online_store">Online Store</SelectItem>
              <SelectItem value="pos">Point of Sale</SelectItem>
              <SelectItem value="wholesale">Wholesale</SelectItem>
              <SelectItem value="social">Social</SelectItem>
              <SelectItem value="marketplace">Marketplace</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant={compare ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCompare(!compare)}
            className="h-9"
          >
            Compare to previous period
          </Button>
        </div>

        <AnalyticsKPIs kpis={kpis} loading={loading} />

        <SalesChart data={timeseries} loading={timeseriesLoading} compare={compare} />

        <div className="grid gap-6 lg:grid-cols-2">
          <OrdersByStatus data={ordersByStatus} loading={loading} />
          <ChannelBreakdown data={channelBreakdown} loading={loading} />
        </div>

        <TopProducts products={topProducts} loading={loading} />
      </div>
    </div>
  )
}
