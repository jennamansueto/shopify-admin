import { test, expect, type Page } from '@playwright/test'

const LOAD_TIMEOUT = { timeout: 10000 }

async function navigateAndWaitForData(page: Page) {
  await page.goto('/analytics')
  await expect(page.getByText('Total Revenue')).toBeVisible(LOAD_TIMEOUT)
}

test.describe('Analytics Page', () => {
  test('loads and displays KPI cards', async ({ page }) => {
    await page.goto('/analytics')

    await expect(page.getByRole('heading', { name: 'Analytics' })).toBeVisible(LOAD_TIMEOUT)

    await expect(page.getByText('Total Revenue')).toBeVisible(LOAD_TIMEOUT)
    await expect(page.getByText('Total Orders')).toBeVisible()
    await expect(page.getByText('Avg Order Value')).toBeVisible()
    await expect(page.getByText('Conversion Rate')).toBeVisible()
  })

  test('date range filter updates data', async ({ page }) => {
    await navigateAndWaitForData(page)

    await page.locator('button').filter({ hasText: 'Last 30 days' }).click()
    await page.getByRole('option', { name: 'Last 7 days' }).click()

    await expect(page.getByText('Total Revenue')).toBeVisible(LOAD_TIMEOUT)
    await expect(page.getByText('Total Orders')).toBeVisible()
  })

  test('channel filter updates data', async ({ page }) => {
    await navigateAndWaitForData(page)

    await page.locator('button').filter({ hasText: 'All channels' }).click()
    await page.getByRole('option', { name: 'Online Store' }).click()

    await expect(page.getByText('Total Revenue')).toBeVisible(LOAD_TIMEOUT)
    await expect(page.getByText('Total Orders')).toBeVisible()
  })

  test('compare toggle activates', async ({ page }) => {
    await navigateAndWaitForData(page)

    const compareButton = page.getByRole('button', { name: 'Compare to previous period' })
    await expect(compareButton).toBeVisible()

    // Before clicking, the button has the outline variant (border + bg-background)
    await expect(compareButton).toHaveClass(/border/)
    await expect(compareButton).toHaveClass(/bg-background/)

    await compareButton.click()

    // After clicking, the button switches to the default variant (bg-primary)
    await expect(compareButton).toHaveClass(/bg-primary/)
  })

  test('displays analytics sections after data loads', async ({ page }) => {
    await navigateAndWaitForData(page)

    await expect(page.getByText('Sales Over Time')).toBeVisible(LOAD_TIMEOUT)
    await expect(page.getByText('Orders by Status')).toBeVisible()
    await expect(page.getByText('Sales by Channel')).toBeVisible()
    await expect(page.getByText('Top Products')).toBeVisible()
  })

  test('Export CSV button is visible and clickable', async ({ page }) => {
    await navigateAndWaitForData(page)

    const exportButton = page.getByRole('button', { name: 'Export CSV' })
    await expect(exportButton).toBeVisible()

    await exportButton.click()

    await page.waitForTimeout(1000)
    await expect(page.getByText('Failed')).not.toBeVisible()
  })

  test('Generate Report button triggers report generation', async ({ page }) => {
    await navigateAndWaitForData(page)

    const reportButton = page.getByRole('button', { name: 'Generate Report' })
    await expect(reportButton).toBeVisible()

    await reportButton.click()

    await expect(page.getByRole('button', { name: 'Generating...' })).toBeVisible({
      timeout: 5000,
    })
  })
})
