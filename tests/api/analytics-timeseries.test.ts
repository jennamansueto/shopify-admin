const BASE_URL = 'http://localhost:3000'

// These tests require the dev server to be running with seeded data.
// Run: npm run dev (in another terminal)
// Then: npx jest tests/api/analytics-timeseries.test.ts

describe('Analytics Timeseries API', () => {
  describe('GET /api/analytics/timeseries', () => {
    it('returns 200 with default params', async () => {
      const res = await fetch(`${BASE_URL}/api/analytics/timeseries`)
      expect(res.status).toBe(200)

      const data = await res.json()
      expect(data).toHaveProperty('timeseries')
      expect(Array.isArray(data.timeseries)).toBe(true)
    })

    it('timeseries items have date, sales, orders', async () => {
      const res = await fetch(`${BASE_URL}/api/analytics/timeseries`)
      const data = await res.json()

      expect(data.timeseries.length).toBeGreaterThan(0)
      for (const item of data.timeseries) {
        expect(item).toHaveProperty('date')
        expect(item).toHaveProperty('sales')
        expect(item).toHaveProperty('orders')
        expect(typeof item.sales).toBe('number')
        expect(typeof item.orders).toBe('number')
      }
    })

    it('date values are in YYYY-MM-DD format', async () => {
      const res = await fetch(`${BASE_URL}/api/analytics/timeseries`)
      const data = await res.json()

      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      for (const item of data.timeseries) {
        expect(item.date).toMatch(dateRegex)
      }
    })

    it('respects range parameter', async () => {
      const [res30, res7] = await Promise.all([
        fetch(`${BASE_URL}/api/analytics/timeseries?range=30`),
        fetch(`${BASE_URL}/api/analytics/timeseries?range=7`),
      ])

      const data30 = await res30.json()
      const data7 = await res7.json()

      expect(res7.status).toBe(200)
      expect(data7.timeseries.length).toBeLessThan(data30.timeseries.length)
    })

    it('compare mode includes previous period data', async () => {
      const res = await fetch(`${BASE_URL}/api/analytics/timeseries?compare=true`)
      expect(res.status).toBe(200)

      const data = await res.json()
      expect(data.timeseries.length).toBeGreaterThan(0)

      const itemWithPrev = data.timeseries.find(
        (item: Record<string, unknown>) =>
          item.previousSales !== undefined && item.previousOrders !== undefined
      )
      expect(itemWithPrev).toBeDefined()
      expect(typeof itemWithPrev.previousSales).toBe('number')
      expect(typeof itemWithPrev.previousOrders).toBe('number')
    })

    it('without compare, no previous period fields', async () => {
      const res = await fetch(`${BASE_URL}/api/analytics/timeseries`)
      const data = await res.json()

      for (const item of data.timeseries) {
        expect(item.previousSales).toBeUndefined()
        expect(item.previousOrders).toBeUndefined()
      }
    })

    it('returns X-Request-Id header', async () => {
      const res = await fetch(`${BASE_URL}/api/analytics/timeseries`)
      expect(res.headers.get('X-Request-Id')).toBeTruthy()
    })
  })
})
