const BASE_URL = 'http://localhost:3000'

// These tests require the dev server to be running with seeded data.
// Run: npm run dev (in another terminal)
// Then: npx jest tests/api/analytics.test.ts

describe('Analytics API', () => {
  describe('GET /api/analytics', () => {
    it('returns 200 with default parameters', async () => {
      const res = await fetch(`${BASE_URL}/api/analytics`)
      expect(res.status).toBe(200)

      const data = await res.json()
      expect(data).toHaveProperty('kpis')
      expect(data).toHaveProperty('ordersByStatus')
      expect(data).toHaveProperty('topProducts')
      expect(data).toHaveProperty('channelBreakdown')
      expect(Array.isArray(data.kpis)).toBe(true)
      expect(Array.isArray(data.ordersByStatus)).toBe(true)
      expect(Array.isArray(data.topProducts)).toBe(true)
      expect(Array.isArray(data.channelBreakdown)).toBe(true)
    })

    it('has correct KPIs structure with expected labels', async () => {
      const res = await fetch(`${BASE_URL}/api/analytics`)
      const data = await res.json()

      expect(data.kpis).toHaveLength(4)

      const expectedLabels = ['Total Revenue', 'Total Orders', 'Avg Order Value', 'Conversion Rate']
      const labels = data.kpis.map((k: { label: string }) => k.label)
      expect(labels).toEqual(expectedLabels)

      for (const kpi of data.kpis) {
        expect(kpi).toHaveProperty('label')
        expect(kpi).toHaveProperty('value')
        expect(kpi).toHaveProperty('change')
        expect(kpi).toHaveProperty('changeLabel')
        expect(kpi).toHaveProperty('trend')
        expect(['up', 'down']).toContain(kpi.trend)
      }
    })

    it('accepts range=7 parameter', async () => {
      const res = await fetch(`${BASE_URL}/api/analytics?range=7`)
      expect(res.status).toBe(200)

      const data = await res.json()
      expect(data).toHaveProperty('kpis')
      expect(data).toHaveProperty('ordersByStatus')
      expect(data).toHaveProperty('topProducts')
      expect(data).toHaveProperty('channelBreakdown')
    })

    it('accepts range=90 parameter', async () => {
      const res = await fetch(`${BASE_URL}/api/analytics?range=90`)
      expect(res.status).toBe(200)

      const data = await res.json()
      expect(data).toHaveProperty('kpis')
      expect(data).toHaveProperty('ordersByStatus')
      expect(data).toHaveProperty('topProducts')
      expect(data).toHaveProperty('channelBreakdown')
    })

    it('filters by channel', async () => {
      const res = await fetch(`${BASE_URL}/api/analytics?channel=online_store`)
      expect(res.status).toBe(200)

      const data = await res.json()
      for (const ch of data.channelBreakdown) {
        expect(ch.channel).toBe('online_store')
      }
    })

    it('accepts compare=true parameter', async () => {
      const res = await fetch(`${BASE_URL}/api/analytics?compare=true`)
      expect(res.status).toBe(200)

      const data = await res.json()
      expect(data).toHaveProperty('kpis')
      expect(data.kpis).toHaveLength(4)
      for (const kpi of data.kpis) {
        expect(kpi).toHaveProperty('change')
        expect(kpi).toHaveProperty('changeLabel')
        expect(kpi).toHaveProperty('trend')
      }
    })

    it('has correct ordersByStatus structure with percentages summing to ~100', async () => {
      const res = await fetch(`${BASE_URL}/api/analytics`)
      const data = await res.json()

      for (const item of data.ordersByStatus) {
        expect(item).toHaveProperty('status')
        expect(item).toHaveProperty('count')
        expect(item).toHaveProperty('percentage')
        expect(typeof item.status).toBe('string')
        expect(typeof item.count).toBe('number')
        expect(typeof item.percentage).toBe('number')
      }

      if (data.ordersByStatus.length > 0) {
        const totalPercentage = data.ordersByStatus.reduce(
          (sum: number, item: { percentage: number }) => sum + item.percentage,
          0,
        )
        expect(totalPercentage).toBeGreaterThanOrEqual(99)
        expect(totalPercentage).toBeLessThanOrEqual(101)
      }
    })

    it('has correct topProducts structure sorted by revenue descending', async () => {
      const res = await fetch(`${BASE_URL}/api/analytics`)
      const data = await res.json()

      expect(data.topProducts.length).toBeLessThanOrEqual(10)

      for (const product of data.topProducts) {
        expect(product).toHaveProperty('id')
        expect(product).toHaveProperty('title')
        expect(product).toHaveProperty('sku')
        expect(product).toHaveProperty('totalSold')
        expect(product).toHaveProperty('revenue')
      }

      for (let i = 1; i < data.topProducts.length; i++) {
        expect(data.topProducts[i - 1].revenue).toBeGreaterThanOrEqual(
          data.topProducts[i].revenue,
        )
      }
    })

    it('has correct channelBreakdown structure', async () => {
      const res = await fetch(`${BASE_URL}/api/analytics`)
      const data = await res.json()

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

    it('returns X-Request-Id header', async () => {
      const res = await fetch(`${BASE_URL}/api/analytics`)
      expect(res.headers.get('X-Request-Id')).toBeTruthy()
    })

    it('handles invalid range parameter', async () => {
      const res = await fetch(`${BASE_URL}/api/analytics?range=abc`)
      // parseInt('abc') returns NaN, which causes the date math to produce
      // an Invalid Date. The route still returns a response (no explicit
      // validation), so we document the actual behavior here.
      // NaN days results in an invalid periodStart, so Prisma queries may
      // return all or no records depending on how the DB handles the date.
      const data = await res.json()
      if (res.status === 200) {
        expect(data).toHaveProperty('kpis')
      } else {
        // If the server returns 500 due to invalid date handling
        expect(data).toHaveProperty('error')
      }
    })
  })

  describe('GET /api/analytics/timeseries', () => {
    it('returns 200 with default parameters', async () => {
      const res = await fetch(`${BASE_URL}/api/analytics/timeseries`)
      expect(res.status).toBe(200)

      const data = await res.json()
      expect(data).toHaveProperty('timeseries')
      expect(Array.isArray(data.timeseries)).toBe(true)
    })

    it('has correct timeseries point structure with YYYY-MM-DD dates', async () => {
      const res = await fetch(`${BASE_URL}/api/analytics/timeseries`)
      const data = await res.json()

      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      for (const point of data.timeseries) {
        expect(point).toHaveProperty('date')
        expect(point).toHaveProperty('sales')
        expect(point).toHaveProperty('orders')
        expect(point.date).toMatch(dateRegex)
        expect(typeof point.sales).toBe('number')
        expect(typeof point.orders).toBe('number')
      }
    })

    it('includes previous period data when compare=true', async () => {
      const res = await fetch(`${BASE_URL}/api/analytics/timeseries?compare=true`)
      expect(res.status).toBe(200)

      const data = await res.json()
      for (const point of data.timeseries) {
        expect(point).toHaveProperty('previousSales')
        expect(point).toHaveProperty('previousOrders')
      }
    })

    it('does not include previous period data without compare', async () => {
      const res = await fetch(`${BASE_URL}/api/analytics/timeseries`)
      const data = await res.json()

      for (const point of data.timeseries) {
        expect(point.previousSales).toBeUndefined()
        expect(point.previousOrders).toBeUndefined()
      }
    })

    it('returns approximately correct number of points for range=7', async () => {
      const res = await fetch(`${BASE_URL}/api/analytics/timeseries?range=7`)
      expect(res.status).toBe(200)

      const data = await res.json()
      // Seeded data may not have all 7 days, but should be in the right ballpark
      expect(data.timeseries.length).toBeLessThanOrEqual(8)
    })

    it('returns X-Request-Id header', async () => {
      const res = await fetch(`${BASE_URL}/api/analytics/timeseries`)
      expect(res.headers.get('X-Request-Id')).toBeTruthy()
    })
  })
})
