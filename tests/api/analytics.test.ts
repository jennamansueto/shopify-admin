const BASE_URL = 'http://localhost:3000'

// These tests require the dev server to be running with seeded data.
// Run: npm run dev (in another terminal)
// Then: npx jest tests/api

describe('Analytics API', () => {
  describe('GET /api/analytics', () => {
    it('returns 200 with kpis, ordersByStatus, topProducts, channelBreakdown', async () => {
      const res = await fetch(`${BASE_URL}/api/analytics`)
      expect(res.status).toBe(200)

      const data = await res.json()
      expect(data).toHaveProperty('kpis')
      expect(data).toHaveProperty('ordersByStatus')
      expect(data).toHaveProperty('topProducts')
      expect(data).toHaveProperty('channelBreakdown')
    })

    it('returns kpis as an array of 4 items with correct properties', async () => {
      const res = await fetch(`${BASE_URL}/api/analytics`)
      const data = await res.json()

      expect(Array.isArray(data.kpis)).toBe(true)
      expect(data.kpis).toHaveLength(4)

      for (const kpi of data.kpis) {
        expect(kpi).toHaveProperty('label')
        expect(kpi).toHaveProperty('value')
        expect(kpi).toHaveProperty('change')
        expect(kpi).toHaveProperty('changeLabel')
        expect(kpi).toHaveProperty('trend')
      }
    })

    it('returns kpis with exact expected labels', async () => {
      const res = await fetch(`${BASE_URL}/api/analytics`)
      const data = await res.json()

      const labels = data.kpis.map((k: { label: string }) => k.label)
      expect(labels).toEqual([
        'Total Revenue',
        'Total Orders',
        'Avg Order Value',
        'Conversion Rate',
      ])
    })

    it('returns ordersByStatus where each item has status, count, percentage', async () => {
      const res = await fetch(`${BASE_URL}/api/analytics`)
      const data = await res.json()

      expect(Array.isArray(data.ordersByStatus)).toBe(true)
      for (const entry of data.ordersByStatus) {
        expect(entry).toHaveProperty('status')
        expect(entry).toHaveProperty('count')
        expect(entry).toHaveProperty('percentage')
      }
    })

    it('returns topProducts where each item has id, title, sku, totalSold, revenue', async () => {
      const res = await fetch(`${BASE_URL}/api/analytics`)
      const data = await res.json()

      expect(Array.isArray(data.topProducts)).toBe(true)
      for (const product of data.topProducts) {
        expect(product).toHaveProperty('id')
        expect(product).toHaveProperty('title')
        expect(product).toHaveProperty('sku')
        expect(product).toHaveProperty('totalSold')
        expect(product).toHaveProperty('revenue')
      }
    })

    it('returns channelBreakdown where each item has channel, sales, orders, percentage', async () => {
      const res = await fetch(`${BASE_URL}/api/analytics`)
      const data = await res.json()

      expect(Array.isArray(data.channelBreakdown)).toBe(true)
      for (const entry of data.channelBreakdown) {
        expect(entry).toHaveProperty('channel')
        expect(entry).toHaveProperty('sales')
        expect(entry).toHaveProperty('orders')
        expect(entry).toHaveProperty('percentage')
      }
    })

    it('returns 200 with same shape for ?range=7', async () => {
      const res = await fetch(`${BASE_URL}/api/analytics?range=7`)
      expect(res.status).toBe(200)

      const data = await res.json()
      expect(data).toHaveProperty('kpis')
      expect(data).toHaveProperty('ordersByStatus')
      expect(data).toHaveProperty('topProducts')
      expect(data).toHaveProperty('channelBreakdown')
    })

    it('returns 200 with same shape for ?range=90', async () => {
      const res = await fetch(`${BASE_URL}/api/analytics?range=90`)
      expect(res.status).toBe(200)

      const data = await res.json()
      expect(data).toHaveProperty('kpis')
      expect(data).toHaveProperty('ordersByStatus')
      expect(data).toHaveProperty('topProducts')
      expect(data).toHaveProperty('channelBreakdown')
    })

    it('filters channel breakdown by ?channel=online_store', async () => {
      const res = await fetch(`${BASE_URL}/api/analytics?channel=online_store`)
      expect(res.status).toBe(200)

      const data = await res.json()
      for (const entry of data.channelBreakdown) {
        expect(entry.channel).toBe('online_store')
      }
    })

    it('returns 200 with same shape for ?compare=true', async () => {
      const res = await fetch(`${BASE_URL}/api/analytics?compare=true`)
      expect(res.status).toBe(200)

      const data = await res.json()
      expect(data).toHaveProperty('kpis')
      expect(data).toHaveProperty('ordersByStatus')
      expect(data).toHaveProperty('topProducts')
      expect(data).toHaveProperty('channelBreakdown')
    })

    it('includes X-Request-Id header', async () => {
      const res = await fetch(`${BASE_URL}/api/analytics`)
      expect(res.headers.get('X-Request-Id')).toBeTruthy()
    })
  })

  describe('GET /api/analytics/timeseries', () => {
    it('returns 200 with timeseries array', async () => {
      const res = await fetch(`${BASE_URL}/api/analytics/timeseries`)
      expect(res.status).toBe(200)

      const data = await res.json()
      expect(data).toHaveProperty('timeseries')
      expect(Array.isArray(data.timeseries)).toBe(true)
    })

    it('returns timeseries points with date, sales, orders', async () => {
      const res = await fetch(`${BASE_URL}/api/analytics/timeseries`)
      const data = await res.json()

      for (const point of data.timeseries) {
        expect(point).toHaveProperty('date')
        expect(point).toHaveProperty('sales')
        expect(point).toHaveProperty('orders')
      }
    })

    it('returns fewer data points for ?range=7 than ?range=90', async () => {
      const [res7, res90] = await Promise.all([
        fetch(`${BASE_URL}/api/analytics/timeseries?range=7`),
        fetch(`${BASE_URL}/api/analytics/timeseries?range=90`),
      ])

      const data7 = await res7.json()
      const data90 = await res90.json()

      expect(data7.timeseries.length).toBeLessThan(data90.timeseries.length)
    })

    it('includes previousSales and previousOrders when ?compare=true', async () => {
      const res = await fetch(`${BASE_URL}/api/analytics/timeseries?compare=true`)
      const data = await res.json()

      if (data.timeseries.length > 0) {
        for (const point of data.timeseries) {
          expect(point).toHaveProperty('previousSales')
          expect(point).toHaveProperty('previousOrders')
        }
      }
    })

    it('does not include previousSales and previousOrders without ?compare=true', async () => {
      const res = await fetch(`${BASE_URL}/api/analytics/timeseries`)
      const data = await res.json()

      for (const point of data.timeseries) {
        expect(point.previousSales).toBeUndefined()
        expect(point.previousOrders).toBeUndefined()
      }
    })

    it('includes X-Request-Id header', async () => {
      const res = await fetch(`${BASE_URL}/api/analytics/timeseries`)
      expect(res.headers.get('X-Request-Id')).toBeTruthy()
    })
  })
})
