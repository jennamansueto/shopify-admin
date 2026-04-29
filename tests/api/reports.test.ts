const BASE_URL = 'http://localhost:3000'

// These tests require the dev server to be running with seeded data.
// Run: npm run dev (in another terminal)
// Then: npx jest tests/api/reports.test.ts --forceExit --testTimeout=30000

describe('Reports API', () => {
  describe('GET /api/reports', () => {
    it('returns 200 with reports array', async () => {
      const res = await fetch(`${BASE_URL}/api/reports`)
      expect(res.status).toBe(200)

      const data = await res.json()
      expect(data).toHaveProperty('reports')
      expect(Array.isArray(data.reports)).toBe(true)
    })

    it('returns X-Request-Id header', async () => {
      const res = await fetch(`${BASE_URL}/api/reports`)
      expect(res.headers.get('X-Request-Id')).toBeTruthy()
    })
  })

  describe('POST /api/reports', () => {
    it('creates a report job', async () => {
      const res = await fetch(`${BASE_URL}/api/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'sales_summary', parameters: { range: '30' } }),
      })
      expect(res.status).toBe(201)

      const report = await res.json()
      expect(report).toHaveProperty('id')
      expect(report).toHaveProperty('type')
      expect(report).toHaveProperty('status', 'pending')
    })

    it('created report has correct type', async () => {
      const res = await fetch(`${BASE_URL}/api/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'sales_summary', parameters: { range: '30' } }),
      })
      const report = await res.json()
      expect(report.type).toBe('sales_summary')
    })

    it('returns X-Request-Id header', async () => {
      const res = await fetch(`${BASE_URL}/api/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'sales_summary' }),
      })
      expect(res.headers.get('X-Request-Id')).toBeTruthy()
    })
  })

  describe('GET /api/reports/:id', () => {
    let reportId: string

    beforeAll(async () => {
      const res = await fetch(`${BASE_URL}/api/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'sales_summary', parameters: { range: '7' } }),
      })
      const report = await res.json()
      reportId = report.id
    })

    it('returns the created report', async () => {
      const res = await fetch(`${BASE_URL}/api/reports/${reportId}`)
      expect(res.status).toBe(200)

      const report = await res.json()
      expect(report).toHaveProperty('id', reportId)
      expect(report).toHaveProperty('type', 'sales_summary')
    })

    it('returns 404 for non-existent report', async () => {
      const res = await fetch(`${BASE_URL}/api/reports/non-existent-id`)
      expect(res.status).toBe(404)

      const data = await res.json()
      expect(data).toHaveProperty('error')
    })
  })

  describe('Report status progression', () => {
    it('report status progresses from pending', async () => {
      const createRes = await fetch(`${BASE_URL}/api/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'sales_summary', parameters: { range: '7' } }),
      })
      const created = await createRes.json()
      expect(created.status).toBe('pending')

      let changed = false

      // Poll a few times with short delays to observe status transitions
      for (let i = 0; i < 10; i++) {
        await new Promise((resolve) => setTimeout(resolve, 1500))
        const pollRes = await fetch(`${BASE_URL}/api/reports/${created.id}`)
        const polled = await pollRes.json()

        if (polled.status !== 'pending') {
          changed = true
          expect(['processing', 'completed']).toContain(polled.status)
          break
        }
      }

      expect(changed).toBe(true)
    })
  })
})
