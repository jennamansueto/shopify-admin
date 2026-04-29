import { test, expect } from '@playwright/test'

test.describe('Orders Page', () => {
  test('loads and displays the orders table', async ({ page }) => {
    await page.goto('/orders')

    // Wait for the table to load
    await expect(page.locator('table')).toBeVisible({ timeout: 10000 })

    // Table should have header columns — use exact column header buttons/text
    await expect(page.locator('thead').getByText('Customer')).toBeVisible()
    await expect(page.locator('thead').getByText('Payment')).toBeVisible()
    await expect(page.locator('thead').getByText('Fulfillment')).toBeVisible()
  })

  test('clicking an order navigates to order detail', async ({ page }) => {
    await page.goto('/orders')

    // Wait for table to load
    await expect(page.locator('table')).toBeVisible({ timeout: 10000 })

    // Click the first order link in the table
    const firstOrderLink = page.locator('table tbody tr a').first()
    await firstOrderLink.click()

    // Should navigate to an order detail page
    await expect(page).toHaveURL(/\/orders\//)
    await expect(page.getByText(/Order #\d+/)).toBeVisible({ timeout: 10000 })
  })

  test('order detail page shows order information', async ({ page }) => {
    await page.goto('/orders')

    await expect(page.locator('table')).toBeVisible({ timeout: 10000 })

    const firstOrderLink = page.locator('table tbody tr a').first()
    await firstOrderLink.click()

    await expect(page).toHaveURL(/\/orders\//)

    // Order detail should show key sections
    await expect(page.getByText(/Order #\d+/)).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Items')).toBeVisible()
  })
})
