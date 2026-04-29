import { test, expect, type Page } from '@playwright/test'

const LOAD_TIMEOUT = { timeout: 10000 }

async function navigateAndWaitForData(page: Page) {
  await page.goto('/analytics')
  await expect(page.getByText('Total Revenue')).toBeVisible(LOAD_TIMEOUT)
}

async function expectKPIsVisible(page: Page) {
  await expect(page.getByText('Total Revenue')).toBeVisible(LOAD_TIMEOUT)
  await expect(page.getByText('Total Orders')).toBeVisible()
  await expect(page.getByText('Avg Order Value')).toBeVisible()
  await expect(page.getByText('Conversion Rate')).toBeVisible()
}

async function selectDropdownOption(page: Page, triggerText: string, optionName: string) {
  await page.locator('button').filter({ hasText: triggerText }).click()
  await page.getByRole('option', { name: optionName }).click()
}

test.describe('Analytics Page', () => {
  test('loads and displays KPI cards', async ({ page }) => {
    await page.goto('/analytics')
    await expect(page.getByRole('heading', { name: 'Analytics' })).toBeVisible(LOAD_TIMEOUT)
    await expectKPIsVisible(page)
  })

  test('date range filter updates data', async ({ page }) => {
    await navigateAndWaitForData(page)
    await selectDropdownOption(page, 'Last 30 days', 'Last 7 days')
    await expectKPIsVisible(page)
  })

  test('channel filter updates data', async ({ page }) => {
    await navigateAndWaitForData(page)
    await selectDropdownOption(page, 'All channels', 'Online Store')
    await expectKPIsVisible(page)
  })

  test('compare toggle activates', async ({ page }) => {
    await navigateAndWaitForData(page)

    const compareButton = page.getByRole('button', { name: 'Compare to previous period' })
    await expect(compareButton).toBeVisible()
    await expect(compareButton).toHaveClass(/bg-background/)

    await compareButton.click()
    await expect(compareButton).toHaveClass(/bg-primary/)
  })

  test('displays analytics sections after data loads', async ({ page }) => {
    await navigateAndWaitForData(page)

    for (const heading of ['Sales Over Time', 'Orders by Status', 'Sales by Channel', 'Top Products']) {
      await expect(page.getByText(heading)).toBeVisible(LOAD_TIMEOUT)
    }
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
