import { prisma } from '@/lib/prisma'

const BASE_URL = 'http://localhost:3000'

// These tests require the dev server to be running with seeded data.
// Run: npm run dev (in another terminal)
// Then: npx jest tests/api

describe('Orders API', () => {
  describe('GET /api/orders', () => {
    it('returns paginated orders', async () => {
      const res = await fetch(`${BASE_URL}/api/orders?page=1&pageSize=5`)
      expect(res.status).toBe(200)

      const data = await res.json()
      expect(data).toHaveProperty('orders')
      expect(data).toHaveProperty('total')
      expect(data).toHaveProperty('page', 1)
      expect(data).toHaveProperty('pageSize', 5)
      expect(data).toHaveProperty('totalPages')
      expect(Array.isArray(data.orders)).toBe(true)
      expect(data.orders.length).toBeLessThanOrEqual(5)
    })

    it('includes customer data with each order', async () => {
      const res = await fetch(`${BASE_URL}/api/orders?pageSize=1`)
      const data = await res.json()

      if (data.orders.length > 0) {
        const order = data.orders[0]
        expect(order).toHaveProperty('customer')
        expect(order.customer).toHaveProperty('firstName')
        expect(order.customer).toHaveProperty('email')
      }
    })

    it('returns X-Request-Id header', async () => {
      const res = await fetch(`${BASE_URL}/api/orders`)
      expect(res.headers.get('X-Request-Id')).toBeTruthy()
    })
  })

  describe('GET /api/orders/:id', () => {
    let orderId: string

    beforeAll(async () => {
      const res = await fetch(`${BASE_URL}/api/orders?pageSize=1`)
      const data = await res.json()
      orderId = data.orders[0]?.id
    })

    it('returns order detail with line items', async () => {
      if (!orderId) return

      const res = await fetch(`${BASE_URL}/api/orders/${orderId}`)
      expect(res.status).toBe(200)

      const order = await res.json()
      expect(order).toHaveProperty('id', orderId)
      expect(order).toHaveProperty('orderNumber')
      expect(order).toHaveProperty('customer')
      expect(order).toHaveProperty('lineItems')
      expect(Array.isArray(order.lineItems)).toBe(true)
    })

    it('returns 404 for non-existent order', async () => {
      const res = await fetch(`${BASE_URL}/api/orders/non-existent-id`)
      expect(res.status).toBe(404)

      const data = await res.json()
      expect(data).toHaveProperty('error')
    })
  })

  describe('POST /api/orders/:id/fulfill', () => {
    it('fulfills a paid unfulfilled order', async () => {
      // Find a paid, unfulfilled order
      const listRes = await fetch(`${BASE_URL}/api/orders?paymentStatus=paid&fulfillmentStatus=unfulfilled&pageSize=1`)
      const listData = await listRes.json()

      if (listData.orders.length === 0) {
        console.log('No paid unfulfilled orders available for fulfillment test')
        return
      }

      const order = listData.orders[0]
      const res = await fetch(`${BASE_URL}/api/orders/${order.id}/fulfill`, {
        method: 'POST',
      })

      expect(res.status).toBe(200)
      const fulfilled = await res.json()
      expect(fulfilled.fulfillmentStatus).toBe('fulfilled')
      expect(fulfilled.status).toBe('shipped')
    })

    it('returns 404 for non-existent order', async () => {
      const res = await fetch(`${BASE_URL}/api/orders/non-existent-id/fulfill`, {
        method: 'POST',
      })
      expect(res.status).toBe(404)
    })
  })

  describe('POST /api/orders/:id/cancel', () => {
    it('cancels a pending order', async () => {
      // Find a cancellable order (not fulfilled, not already cancelled)
      const listRes = await fetch(`${BASE_URL}/api/orders?status=pending&fulfillmentStatus=unfulfilled&pageSize=1`)
      const listData = await listRes.json()

      if (listData.orders.length === 0) {
        console.log('No cancellable orders available for cancel test')
        return
      }

      const order = listData.orders[0]
      const res = await fetch(`${BASE_URL}/api/orders/${order.id}/cancel`, {
        method: 'POST',
      })

      expect(res.status).toBe(200)
      const cancelled = await res.json()
      expect(cancelled.status).toBe('cancelled')
    })

    it('returns 404 for non-existent order', async () => {
      const res = await fetch(`${BASE_URL}/api/orders/non-existent-id/cancel`, {
        method: 'POST',
      })
      expect(res.status).toBe(404)
    })
  })
})
