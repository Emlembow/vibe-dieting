import { test, expect } from '@playwright/test'

test.describe('Simple E2E Test', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/')
    
    // Just check if page loads without errors
    await expect(page).toHaveTitle(/Macro Tracker|Vibe Dieting/)
  })

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/login')
    
    // Check if login page elements exist
    await expect(page.locator('text=Vibe Dieting')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })
})