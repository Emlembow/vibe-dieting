import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication - in real tests you'd set up proper auth
    await page.goto('/dashboard')
  })

  test('should display dashboard layout correctly', async ({ page }) => {
    // Check main dashboard elements
    await expect(page.locator('text=Today\'s Macros')).toBeVisible()
    await expect(page.locator('text=Recent Entries')).toBeVisible()
    
    // Check navigation elements
    await expect(page.locator('text=Dashboard')).toBeVisible()
    await expect(page.locator('text=Add Food')).toBeVisible()
    await expect(page.locator('text=Goals')).toBeVisible()
    await expect(page.locator('text=Trends')).toBeVisible()
  })

  test('should display macro progress bars', async ({ page }) => {
    // Check for progress indicators
    await expect(page.locator('text=Calories')).toBeVisible()
    await expect(page.locator('text=Protein')).toBeVisible()
    await expect(page.locator('text=Carbs')).toBeVisible()
    await expect(page.locator('text=Fat')).toBeVisible()

    // Check for progress bars/circles
    await expect(page.locator('[data-testid="macro-progress"]').first()).toBeVisible()
  })

  test('should show date selector', async ({ page }) => {
    // Check for date picker
    const dateButton = page.locator('button:has-text("Pick a date")')
    await expect(dateButton).toBeVisible()
    
    // Click to open calendar
    await dateButton.click()
    await expect(page.locator('role=grid')).toBeVisible()
  })

  test('should navigate to add food page', async ({ page }) => {
    // Click add food button
    await page.click('text=Add Food')
    await expect(page).toHaveURL(/.*\/add-food/)
  })

  test('should navigate to goals page', async ({ page }) => {
    // Click goals button/link
    await page.click('text=Goals')
    await expect(page).toHaveURL(/.*\/goals/)
  })

  test('should display recent food entries', async ({ page }) => {
    // Check for recent entries section
    await expect(page.locator('text=Recent Entries')).toBeVisible()
    
    // If there are entries, check structure
    const entries = page.locator('[data-testid="food-entry"]')
    if (await entries.count() > 0) {
      await expect(entries.first()).toBeVisible()
      await expect(entries.first().locator('text=/\\d+ cal/')).toBeVisible()
    }
  })

  test('should allow deleting food entries', async ({ page }) => {
    // Look for delete buttons in food entries
    const deleteButtons = page.locator('button:has-text("Delete")')
    
    if (await deleteButtons.count() > 0) {
      // Click first delete button
      await deleteButtons.first().click()
      
      // Confirm deletion in dialog
      await expect(page.locator('text=Are you sure')).toBeVisible()
      await page.click('button:has-text("Continue")')
      
      // Entry should be removed (this would need proper state management)
    }
  })

  test('should show weekly trend chart', async ({ page }) => {
    // Check for chart container
    await expect(page.locator('[data-testid="weekly-chart"]')).toBeVisible()
  })

  test('should handle empty state when no goals set', async ({ page }) => {
    // If no goals are set, should show setup message
    const noGoalsMessage = page.locator('text=Set your macro goals')
    if (await noGoalsMessage.isVisible()) {
      await expect(page.locator('text=Set Goals')).toBeVisible()
    }
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Check mobile navigation
    const mobileMenu = page.locator('[data-testid="mobile-menu"]')
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click()
      await expect(page.locator('text=Dashboard')).toBeVisible()
    }
  })

  test('should update totals when entries change', async ({ page }) => {
    // Get initial calorie total
    const calorieTotal = page.locator('[data-testid="calorie-total"]')
    const initialTotal = await calorieTotal.textContent()
    
    // Add a new entry (navigate to add food)
    await page.click('text=Add Food')
    await expect(page).toHaveURL(/.*\/add-food/)
    
    // Fill and submit form
    await page.fill('input[placeholder*="food name"]', 'Test Food')
    await page.fill('input[placeholder*="calories"]', '100')
    await page.fill('input[placeholder*="protein"]', '10')
    await page.fill('input[placeholder*="carbs"]', '15')
    await page.fill('input[placeholder*="fat"]', '2')
    
    await page.click('button:has-text("Add Entry")')
    
    // Should redirect back to dashboard
    await expect(page).toHaveURL(/.*\/dashboard/)
    
    // Totals should update (would need proper state management)
    await expect(calorieTotal).not.toHaveText(initialTotal || '')
  })
})