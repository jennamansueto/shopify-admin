import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('sidebar displays all navigation links', async ({ page }) => {
    await page.goto('/')

    const sidebar = page.locator('aside')
    await expect(sidebar.getByRole('link', { name: 'Home' })).toBeVisible()
    await expect(sidebar.getByRole('link', { name: 'Orders' })).toBeVisible()
    await expect(sidebar.getByRole('link', { name: 'Products' })).toBeVisible()
    await expect(sidebar.getByRole('link', { name: 'Customers' })).toBeVisible()
    await expect(sidebar.getByRole('link', { name: 'Analytics' })).toBeVisible()
    await expect(sidebar.getByRole('link', { name: 'Reports' })).toBeVisible()
    await expect(sidebar.getByRole('link', { name: 'Settings' })).toBeVisible()
  })

  test('navigating to Orders page loads order table', async ({ page }) => {
    await page.goto('/')
    await page.locator('aside').getByRole('link', { name: 'Orders' }).click()

    await expect(page).toHaveURL('/orders')
    await expect(page.getByRole('heading', { name: 'Orders' })).toBeVisible()
  })

  test('navigating to Analytics page loads analytics dashboard', async ({ page }) => {
    await page.goto('/')
    await page.locator('aside').getByRole('link', { name: 'Analytics' }).click()

    await expect(page).toHaveURL('/analytics')
    await expect(page.getByRole('heading', { name: 'Analytics' })).toBeVisible()
  })

  test('store name is visible in sidebar header', async ({ page }) => {
    await page.goto('/')
    await expect(
      page.locator('aside').locator('span').filter({ hasText: 'Meridian Commerce' })
    ).toBeVisible()
  })
})
