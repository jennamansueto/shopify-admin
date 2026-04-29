import { test, expect } from '@playwright/test'

test.describe('Analytics Page', () => {
  test('loads and displays KPI cards', async ({ page }) => {
    await page.goto('/analytics')

    // Wait for loading to complete
    await expect(page.getByRole('heading', { name: 'Analytics' })).toBeVisible({
      timeout: 10000,
    })

    // Verify all 4 KPI cards appear
    await expect(page.getByText('Total Revenue')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Total Orders')).toBeVisible()
    await expect(page.getByText('Avg Order Value')).toBeVisible()
    await expect(page.getByText('Conversion Rate')).toBeVisible()
  })

  test('date range filter updates data', async ({ page }) => {
    await page.goto('/analytics')
    await expect(page.getByText('Total Revenue')).toBeVisible({ timeout: 10000 })

    // Default is "Last 30 days" — click the date range selector
    await page.locator('button').filter({ hasText: 'Last 30 days' }).click()

    // Choose "Last 7 days"
    await page.getByRole('option', { name: 'Last 7 days' }).click()

    // KPI cards should still render after data reloads
    await expect(page.getByText('Total Revenue')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Total Orders')).toBeVisible()
  })

  test('channel filter updates data', async ({ page }) => {
    await page.goto('/analytics')
    await expect(page.getByText('Total Revenue')).toBeVisible({ timeout: 10000 })

    // Click the channel selector (default is "All channels")
    await page.locator('button').filter({ hasText: 'All channels' }).click()

    // Choose "Online Store"
    await page.getByRole('option', { name: 'Online Store' }).click()

    // KPI cards should still render after data reloads
    await expect(page.getByText('Total Revenue')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Total Orders')).toBeVisible()
  })

  test('compare toggle activates', async ({ page }) => {
    await page.goto('/analytics')
    await expect(page.getByText('Total Revenue')).toBeVisible({ timeout: 10000 })

    const compareButton = page.getByRole('button', { name: 'Compare to previous period' })
    await expect(compareButton).toBeVisible()

    // Click the compare toggle — button variant should change to 'default' (no longer outline)
    await compareButton.click()

    // After clicking, the button should not have the outline variant class
    await expect(compareButton).not.toHaveClass(/variant-outline/)
  })

  test('displays analytics sections after data loads', async ({ page }) => {
    await page.goto('/analytics')
    await expect(page.getByText('Total Revenue')).toBeVisible({ timeout: 10000 })

    // Verify the sales chart section is visible
    await expect(page.getByText('Sales Over Time')).toBeVisible({ timeout: 10000 })

    // Verify the "Orders by Status" section
    await expect(page.getByText('Orders by Status')).toBeVisible()

    // Verify the "Sales by Channel" section (rendered by ChannelBreakdown component)
    await expect(page.getByText('Sales by Channel')).toBeVisible()

    // Verify the "Top Products" section
    await expect(page.getByText('Top Products')).toBeVisible()
  })

  test('Export CSV button is visible and clickable', async ({ page }) => {
    await page.goto('/analytics')
    await expect(page.getByText('Total Revenue')).toBeVisible({ timeout: 10000 })

    const exportButton = page.getByRole('button', { name: 'Export CSV' })
    await expect(exportButton).toBeVisible()

    // Click Export CSV — verify no error toast appears
    await exportButton.click()

    // Wait briefly to ensure no error toast
    await page.waitForTimeout(1000)
    await expect(page.getByText('Failed')).not.toBeVisible()
  })

  test('Generate Report button triggers report generation', async ({ page }) => {
    await page.goto('/analytics')
    await expect(page.getByText('Total Revenue')).toBeVisible({ timeout: 10000 })

    const reportButton = page.getByRole('button', { name: 'Generate Report' })
    await expect(reportButton).toBeVisible()

    // Click Generate Report
    await reportButton.click()

    // Button text should change to "Generating..."
    await expect(page.getByRole('button', { name: 'Generating...' })).toBeVisible({
      timeout: 5000,
    })
  })
})
