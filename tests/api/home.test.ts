import { prisma } from '@/lib/prisma'

const BASE_URL = 'http://localhost:3000'

// These tests require the dev server to be running with seeded data.
// Run: npm run dev (in another terminal)
// Then: npx jest tests/api

describe('Home API', () => {
  describe('GET /api/home', () => {
    it('returns 200 with valid response shape', async () => {
      const res = await fetch(`${BASE_URL}/api/home`)
      expect(res.status).toBe(200)

      const data = await res.json()
      expect(data).toHaveProperty('kpis')
      expect(data).toHaveProperty('recentActivity')
      expect(data).toHaveProperty('alerts')
    })

    it('KPIs array has 4 items with correct structure', async () => {
      const res = await fetch(`${BASE_URL}/api/home`)
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

    it('KPI labels match expected values', async () => {
      const res = await fetch(`${BASE_URL}/api/home`)
      const data = await res.json()

      const labels = data.kpis.map((kpi: { label: string }) => kpi.label)
      expect(labels).toEqual([
        'Total Sales',
        'Orders',
        'Conversion Rate',
        'Avg Order Value',
      ])
    })

    it('recent activity is an array with correct structure', async () => {
      const res = await fetch(`${BASE_URL}/api/home`)
      const data = await res.json()

      expect(Array.isArray(data.recentActivity)).toBe(true)

      for (const item of data.recentActivity) {
        expect(item).toHaveProperty('type')
        expect(item).toHaveProperty('title')
        expect(item).toHaveProperty('description')
        expect(item).toHaveProperty('createdAt')
      }
    })

    it('alerts have correct structure', async () => {
      const res = await fetch(`${BASE_URL}/api/home`)
      const data = await res.json()

      expect(Array.isArray(data.alerts)).toBe(true)

      for (const alert of data.alerts) {
        expect(alert).toHaveProperty('id')
        expect(alert).toHaveProperty('type')
        expect(alert).toHaveProperty('title')
        expect(alert).toHaveProperty('description')
      }
    })

    it('returns X-Request-Id header', async () => {
      const res = await fetch(`${BASE_URL}/api/home`)
      expect(res.headers.get('X-Request-Id')).toBeTruthy()
    })
  })
})
