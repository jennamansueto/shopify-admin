import { test, expect } from '@playwright/test'

// The analytics API can be slow (~8s) due to deeply nested product queries.
// Combined with dev server cold start, we need generous timeouts for data-dependent assertions.
const DATA_TIMEOUT = 30000

test.describe('Analytics Page', () => {
  test('page loads with KPI cards', async ({ page }) => {
    await page.goto('/analytics')

    await expect(page.getByRole('heading', { name: 'Analytics' })).toBeVisible({ timeout: 10000 })

    // Wait for loading to complete — KPI labels should appear
    await expect(page.getByText('Total Revenue')).toBeVisible({ timeout: DATA_TIMEOUT })
    await expect(page.getByText('Total Orders')).toBeVisible()
    await expect(page.getByText('Avg Order Value')).toBeVisible()
    await expect(page.getByText('Conversion Rate')).toBeVisible()
  })

  test('filter controls are present', async ({ page }) => {
    await page.goto('/analytics')

    // Date range selector (Radix Select trigger)
    await expect(page.getByRole('combobox').filter({ hasText: /Last 30 days/ })).toBeVisible({ timeout: 10000 })

    // Channel selector
    await expect(page.getByRole('combobox').filter({ hasText: /All channels/ })).toBeVisible()

    // Compare toggle button
    await expect(page.getByRole('button', { name: 'Compare to previous period' })).toBeVisible()
  })

  test('changing date range reloads data', async ({ page }) => {
    await page.goto('/analytics')

    // Wait for initial data load
    await expect(page.getByText('Total Revenue')).toBeVisible({ timeout: DATA_TIMEOUT })

    // Click the date range trigger to open dropdown
    await page.getByRole('combobox').filter({ hasText: /Last 30 days/ }).click()

    // Select "Last 7 days" from the dropdown
    await page.getByRole('option', { name: 'Last 7 days' }).click()

    // Verify KPI cards still render after data reloads
    await expect(page.getByText('Total Revenue')).toBeVisible({ timeout: DATA_TIMEOUT })
    await expect(page.getByText('Total Orders')).toBeVisible()
  })

  test('channel filter works', async ({ page }) => {
    await page.goto('/analytics')

    // Wait for initial data load
    await expect(page.getByText('Total Revenue')).toBeVisible({ timeout: DATA_TIMEOUT })

    // Click the channel trigger to open dropdown
    await page.getByRole('combobox').filter({ hasText: /All channels/ }).click()

    // Select "Online Store"
    await page.getByRole('option', { name: 'Online Store' }).click()

    // Verify KPI cards still render without error
    await expect(page.getByText('Total Revenue')).toBeVisible({ timeout: DATA_TIMEOUT })
    await expect(page.getByText('Total Orders')).toBeVisible()
  })

  test('top products section renders', async ({ page }) => {
    await page.goto('/analytics')

    await expect(page.getByRole('heading', { name: 'Top Products' })).toBeVisible({ timeout: 10000 })
  })

  test('orders by status section renders', async ({ page }) => {
    await page.goto('/analytics')

    await expect(page.getByRole('heading', { name: 'Orders by Status' })).toBeVisible({ timeout: 10000 })
  })

  test('channel breakdown section renders', async ({ page }) => {
    await page.goto('/analytics')

    await expect(page.getByRole('heading', { name: 'Sales by Channel' })).toBeVisible({ timeout: 10000 })
  })

  test('Export CSV button exists and is clickable', async ({ page }) => {
    await page.goto('/analytics')

    const exportButton = page.getByRole('button', { name: 'Export CSV' })
    await expect(exportButton).toBeVisible({ timeout: 10000 })

    // Wait for data to load before clicking (button is disabled while loading)
    await expect(page.getByText('Total Revenue')).toBeVisible({ timeout: DATA_TIMEOUT })

    await exportButton.click()

    // Verify success toast "Export downloaded" appears
    await expect(page.getByText('Export downloaded')).toBeVisible({ timeout: 5000 })
  })

  test('Generate Report button exists', async ({ page }) => {
    await page.goto('/analytics')

    const reportButton = page.getByRole('button', { name: 'Generate Report' })
    await expect(reportButton).toBeVisible({ timeout: 10000 })

    // Wait for data to load
    await expect(page.getByText('Total Revenue')).toBeVisible({ timeout: DATA_TIMEOUT })

    await reportButton.click()

    // Button text should change to "Generating..."
    await expect(page.getByRole('button', { name: 'Generating...' })).toBeVisible({ timeout: 5000 })

    // A toast "Report generation started" should appear
    await expect(page.getByText('Report generation started')).toBeVisible({ timeout: 5000 })
  })

  test('error state does not appear on normal load', async ({ page }) => {
    await page.goto('/analytics')

    // Wait for data to finish loading
    await expect(page.getByText('Total Revenue')).toBeVisible({ timeout: DATA_TIMEOUT })

    // The error div with border-red-200 should not be present
    await expect(page.locator('.border-red-200')).not.toBeVisible()
  })
})
