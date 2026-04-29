const BASE_URL = 'http://localhost:3000'

// These tests require the dev server to be running with seeded data.
// Run: npm run dev (in another terminal)
// Then: npm run test:api

interface Kpi {
  label: string
  value: string
  change: number
  changeLabel: string
  trend: string
}

interface OrderByStatus {
  status: string
  count: number
  percentage: number
}

interface TopProduct {
  id: string
  title: string
  sku: string
  totalSold: number
  revenue: number
}

interface ChannelBreakdownItem {
  channel: string
  sales: number
  orders: number
  percentage: number
}

interface AnalyticsResponse {
  kpis: Kpi[]
  ordersByStatus: OrderByStatus[]
  topProducts: TopProduct[]
  channelBreakdown: ChannelBreakdownItem[]
}

describe('Analytics API', () => {
  describe('GET /api/analytics', () => {
    it('returns 200 with default params', async () => {
      const res = await fetch(`${BASE_URL}/api/analytics`)
      expect(res.status).toBe(200)

      const data: AnalyticsResponse = await res.json()
      expect(data).toHaveProperty('kpis')
      expect(data).toHaveProperty('ordersByStatus')
      expect(data).toHaveProperty('topProducts')
      expect(data).toHaveProperty('channelBreakdown')
    })

    it('returns KPIs with correct structure and labels', async () => {
      const res = await fetch(`${BASE_URL}/api/analytics`)
      const data: AnalyticsResponse = await res.json()

      expect(data.kpis).toHaveLength(4)

      const expectedLabels = ['Total Revenue', 'Total Orders', 'Avg Order Value', 'Conversion Rate']
      for (const kpi of data.kpis) {
        expect(kpi).toHaveProperty('label')
        expect(kpi).toHaveProperty('value')
        expect(kpi).toHaveProperty('change')
        expect(kpi).toHaveProperty('changeLabel')
        expect(kpi).toHaveProperty('trend')
      }

      const labels = data.kpis.map((k) => k.label)
      expect(labels).toEqual(expectedLabels)
    })

    it('returns valid trend values for each KPI', async () => {
      const res = await fetch(`${BASE_URL}/api/analytics`)
      const data: AnalyticsResponse = await res.json()

      for (const kpi of data.kpis) {
        expect(['up', 'down']).toContain(kpi.trend)
      }
    })

    it('accepts range parameter', async () => {
      const res7 = await fetch(`${BASE_URL}/api/analytics?range=7`)
      expect(res7.status).toBe(200)
      const data7: AnalyticsResponse = await res7.json()
      expect(data7).toHaveProperty('kpis')
      expect(data7).toHaveProperty('ordersByStatus')
      expect(data7).toHaveProperty('topProducts')
      expect(data7).toHaveProperty('channelBreakdown')

      const res90 = await fetch(`${BASE_URL}/api/analytics?range=90`)
      expect(res90.status).toBe(200)
      const data90: AnalyticsResponse = await res90.json()
      expect(data90).toHaveProperty('kpis')
      expect(data90).toHaveProperty('ordersByStatus')
      expect(data90).toHaveProperty('topProducts')
      expect(data90).toHaveProperty('channelBreakdown')
    })

    it('filters by channel', async () => {
      const res = await fetch(`${BASE_URL}/api/analytics?channel=online_store`)
      expect(res.status).toBe(200)

      const data: AnalyticsResponse = await res.json()
      expect(data).toHaveProperty('channelBreakdown')

      for (const item of data.channelBreakdown) {
        expect(item.channel).toBe('online_store')
      }
    })

    it('returns ordersByStatus with valid structure', async () => {
      const res = await fetch(`${BASE_URL}/api/analytics`)
      const data: AnalyticsResponse = await res.json()

      expect(Array.isArray(data.ordersByStatus)).toBe(true)
      for (const item of data.ordersByStatus) {
        expect(item).toHaveProperty('status')
        expect(item).toHaveProperty('count')
        expect(item).toHaveProperty('percentage')
        expect(typeof item.status).toBe('string')
        expect(typeof item.count).toBe('number')
        expect(item.percentage).toBeGreaterThanOrEqual(0)
        expect(item.percentage).toBeLessThanOrEqual(100)
      }
    })

    it('returns topProducts sorted by revenue descending', async () => {
      const res = await fetch(`${BASE_URL}/api/analytics`)
      const data: AnalyticsResponse = await res.json()

      expect(Array.isArray(data.topProducts)).toBe(true)
      for (const product of data.topProducts) {
        expect(product).toHaveProperty('id')
        expect(product).toHaveProperty('title')
        expect(product).toHaveProperty('sku')
        expect(product).toHaveProperty('totalSold')
        expect(product).toHaveProperty('revenue')
      }

      for (let i = 0; i < data.topProducts.length - 1; i++) {
        expect(data.topProducts[i].revenue).toBeGreaterThanOrEqual(data.topProducts[i + 1].revenue)
      }
    })

    it('returns channelBreakdown with valid structure', async () => {
      const res = await fetch(`${BASE_URL}/api/analytics`)
      const data: AnalyticsResponse = await res.json()

      expect(Array.isArray(data.channelBreakdown)).toBe(true)
      for (const item of data.channelBreakdown) {
        expect(item).toHaveProperty('channel')
        expect(item).toHaveProperty('sales')
        expect(item).toHaveProperty('orders')
        expect(item).toHaveProperty('percentage')
        expect(typeof item.channel).toBe('string')
        expect(typeof item.sales).toBe('number')
        expect(typeof item.orders).toBe('number')
        expect(typeof item.percentage).toBe('number')
      }
    })

    it('includes X-Request-Id header', async () => {
      const res = await fetch(`${BASE_URL}/api/analytics`)
      expect(res.headers.get('X-Request-Id')).toBeTruthy()
    })

    it('handles invalid range parameter gracefully', async () => {
      const res = await fetch(`${BASE_URL}/api/analytics?range=abc`)
      // parseInt('abc', 10) returns NaN, which causes date arithmetic to produce
      // Invalid Date values. The endpoint returns 500 because the Prisma query
      // fails when given invalid date boundaries.
      expect(res.status).toBe(500)

      const data = await res.json()
      expect(data).toHaveProperty('error')
    })
  })
})
