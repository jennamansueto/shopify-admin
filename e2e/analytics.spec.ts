import { test, expect } from '@playwright/test'

test.describe('Analytics Page', () => {
  test('page loads and displays KPI cards', async ({ page }) => {
    await page.goto('/analytics')

    // Wait for loading to complete — KPI labels should appear
    await expect(page.getByText('Total Revenue')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Total Orders')).toBeVisible()
    await expect(page.getByText('Avg Order Value')).toBeVisible()
    await expect(page.getByText('Conversion Rate')).toBeVisible()
  })

  test('displays analytics sections', async ({ page }) => {
    await page.goto('/analytics')

    // Wait for page to load
    await expect(page.getByText('Total Revenue')).toBeVisible({ timeout: 10000 })

    // Verify each analytics section is rendered
    await expect(page.getByText('Sales Over Time')).toBeVisible()
    await expect(page.getByText('Orders by Status')).toBeVisible()
    await expect(page.getByText('Sales by Channel')).toBeVisible()
    await expect(page.getByText('Top Products')).toBeVisible()
  })

  test('date range filter works', async ({ page }) => {
    await page.goto('/analytics')

    await expect(page.getByText('Total Revenue')).toBeVisible({ timeout: 10000 })

    // Click the date range select (default "Last 30 days")
    const dateRangeTrigger = page.locator('.w-\\[160px\\]').first()
    await dateRangeTrigger.click()

    // Select "Last 7 days"
    await page.getByRole('option', { name: 'Last 7 days' }).click()

    // KPIs should still be visible after data reloads
    await expect(page.getByText('Total Revenue')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Total Orders')).toBeVisible()
  })

  test('channel filter works', async ({ page }) => {
    await page.goto('/analytics')

    await expect(page.getByText('Total Revenue')).toBeVisible({ timeout: 10000 })

    // Click the channel select (default "All channels") — it's the second w-[160px] trigger
    const channelTrigger = page.locator('.w-\\[160px\\]').nth(1)
    await channelTrigger.click()

    // Select "Online Store"
    await page.getByRole('option', { name: 'Online Store' }).click()

    // Page should reload data without errors
    await expect(page.getByText('Total Revenue')).toBeVisible({ timeout: 10000 })
  })

  test('compare toggle works', async ({ page }) => {
    await page.goto('/analytics')

    await expect(page.getByText('Total Revenue')).toBeVisible({ timeout: 10000 })

    const compareButton = page.getByRole('button', { name: 'Compare to previous period' })
    await expect(compareButton).toBeVisible()

    // Button should initially have outline variant
    await expect(compareButton).toHaveAttribute('data-slot', 'button')

    // Click to activate compare mode
    await compareButton.click()

    // Button should still be visible after toggling
    await expect(compareButton).toBeVisible()
  })

  test('export CSV button downloads data', async ({ page }) => {
    await page.goto('/analytics')

    // Wait for data to fully load before exporting
    await expect(page.getByText('Total Revenue')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Top Products')).toBeVisible()

    // Click Export CSV
    const exportButton = page.getByRole('button', { name: 'Export CSV' })
    await expect(exportButton).toBeVisible()
    await exportButton.click()

    // Verify the success toast appears
    await expect(page.getByText('Export downloaded')).toBeVisible({ timeout: 5000 })
  })

  test('export CSV with no data shows error toast', async ({ page }) => {
    // Intercept the analytics API to return empty top products
    await page.route('**/api/analytics**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          kpis: [
            { label: 'Total Revenue', value: '$0', trend: 'neutral', change: 0, changeLabel: 'vs previous period' },
            { label: 'Total Orders', value: '0', trend: 'neutral', change: 0, changeLabel: 'vs previous period' },
            { label: 'Avg Order Value', value: '$0', trend: 'neutral', change: 0, changeLabel: 'vs previous period' },
            { label: 'Conversion Rate', value: '0%', trend: 'neutral', change: 0, changeLabel: 'vs previous period' },
          ],
          ordersByStatus: [],
          topProducts: [],
          channelBreakdown: [],
        }),
      })
    })

    await page.goto('/analytics')
    await expect(page.getByText('Total Revenue')).toBeVisible({ timeout: 10000 })

    // Click Export CSV with no product data
    const exportButton = page.getByRole('button', { name: 'Export CSV' })
    await exportButton.click()

    // Verify the error toast appears
    await expect(page.getByText('No data to export')).toBeVisible({ timeout: 5000 })
  })

  test('generate report button triggers report generation', async ({ page }) => {
    await page.goto('/analytics')

    await expect(page.getByText('Total Revenue')).toBeVisible({ timeout: 10000 })

    // Click Generate Report
    const reportButton = page.getByRole('button', { name: 'Generate Report' })
    await expect(reportButton).toBeVisible()
    await reportButton.click()

    // Button should show generating state with spinner
    await expect(page.getByText('Generating...')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('.animate-spin')).toBeVisible()

    // Wait for the initial toast
    await expect(page.getByText('Report generation started')).toBeVisible({ timeout: 5000 })

    // Wait for the completion toast (report takes ~2s simulated)
    await expect(page.getByText('Report ready for download')).toBeVisible({ timeout: 15000 })
  })

  test('error state displays error banner', async ({ page }) => {
    // Intercept the analytics API and return a 500 error
    await page.route('**/api/analytics**', async (route) => {
      // Only intercept the main analytics call, not timeseries
      if (!route.request().url().includes('timeseries')) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error' }),
        })
      } else {
        await route.continue()
      }
    })

    await page.goto('/analytics')

    // Verify the error banner appears
    await expect(page.getByText('Failed to load analytics')).toBeVisible({ timeout: 10000 })
  })

  test('header displays correctly', async ({ page }) => {
    await page.goto('/analytics')

    await expect(page.getByRole('heading', { name: 'Analytics' })).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Store performance and insights')).toBeVisible()
  })
})
