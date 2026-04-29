const BASE_URL = 'http://localhost:3000'

// These tests require the dev server to be running with seeded data.
// Run: npm run dev (in another terminal)
// Then: npx jest tests/api/analytics.test.ts

describe('Analytics API', () => {
  describe('GET /api/analytics', () => {
    it('returns 200 with default params', async () => {
      const res = await fetch(`${BASE_URL}/api/analytics`)
      expect(res.status).toBe(200)

      const data = await res.json()
      expect(data).toHaveProperty('kpis')
      expect(data).toHaveProperty('ordersByStatus')
      expect(data).toHaveProperty('topProducts')
      expect(data).toHaveProperty('channelBreakdown')
    })

    it('KPIs array has 4 items with correct labels', async () => {
      const res = await fetch(`${BASE_URL}/api/analytics`)
      const data = await res.json()

      expect(data.kpis).toHaveLength(4)
      const labels = data.kpis.map((k: { label: string }) => k.label)
      expect(labels).toEqual([
        'Total Revenue',
        'Total Orders',
        'Avg Order Value',
        'Conversion Rate',
      ])
    })

    it('each KPI has required fields', async () => {
      const res = await fetch(`${BASE_URL}/api/analytics`)
      const data = await res.json()

      for (const kpi of data.kpis) {
        expect(kpi).toHaveProperty('label')
        expect(kpi).toHaveProperty('value')
        expect(kpi).toHaveProperty('change')
        expect(kpi).toHaveProperty('changeLabel')
        expect(kpi).toHaveProperty('trend')
      }
    })

    it('ordersByStatus items have status, count, percentage', async () => {
      const res = await fetch(`${BASE_URL}/api/analytics`)
      const data = await res.json()

      expect(Array.isArray(data.ordersByStatus)).toBe(true)
      for (const item of data.ordersByStatus) {
        expect(item).toHaveProperty('status')
        expect(item).toHaveProperty('count')
        expect(item).toHaveProperty('percentage')
      }
    })

    it('topProducts items have id, title, sku, totalSold, revenue', async () => {
      const res = await fetch(`${BASE_URL}/api/analytics`)
      const data = await res.json()

      expect(Array.isArray(data.topProducts)).toBe(true)
      if (data.topProducts.length > 0) {
        for (const product of data.topProducts) {
          expect(product).toHaveProperty('id')
          expect(product).toHaveProperty('title')
          expect(product).toHaveProperty('sku')
          expect(product).toHaveProperty('totalSold')
          expect(product).toHaveProperty('revenue')
        }
      }
    })

    it('channelBreakdown items have channel, sales, orders, percentage', async () => {
      const res = await fetch(`${BASE_URL}/api/analytics`)
      const data = await res.json()

      expect(Array.isArray(data.channelBreakdown)).toBe(true)
      for (const item of data.channelBreakdown) {
        expect(item).toHaveProperty('channel')
        expect(item).toHaveProperty('sales')
        expect(item).toHaveProperty('orders')
        expect(item).toHaveProperty('percentage')
      }
    })

    it('respects range parameter', async () => {
      const res = await fetch(`${BASE_URL}/api/analytics?range=7`)
      expect(res.status).toBe(200)

      const data = await res.json()
      expect(data).toHaveProperty('kpis')
      expect(data).toHaveProperty('ordersByStatus')
      expect(data).toHaveProperty('topProducts')
      expect(data).toHaveProperty('channelBreakdown')
    })

    it('respects channel filter', async () => {
      const res = await fetch(`${BASE_URL}/api/analytics?channel=online_store`)
      expect(res.status).toBe(200)

      const data = await res.json()
      expect(data).toHaveProperty('kpis')
      expect(data).toHaveProperty('ordersByStatus')
      expect(data).toHaveProperty('topProducts')
      expect(data).toHaveProperty('channelBreakdown')
    })

    it('returns X-Request-Id header', async () => {
      const res = await fetch(`${BASE_URL}/api/analytics`)
      expect(res.headers.get('X-Request-Id')).toBeTruthy()
    })
  })
})
