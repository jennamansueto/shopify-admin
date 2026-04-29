import { test, expect } from '@playwright/test'

test.describe('Home Dashboard', () => {
  test('displays KPI cards after loading', async ({ page }) => {
    await page.goto('/')

    // Wait for loading to complete — KPI values should appear
    await expect(page.getByText('Total Sales')).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('heading', { name: 'Orders' })).toBeVisible()
    await expect(page.getByText('Conversion Rate')).toBeVisible()
    await expect(page.getByText('Avg Order Value')).toBeVisible()
  })

  test('displays quick action links', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByText('Quick Actions')).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('link', { name: /View all orders/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /View analytics/i })).toBeVisible()
  })
})
