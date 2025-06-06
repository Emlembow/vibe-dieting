import { test, expect } from '@playwright/test'

test.describe('Food Tracking', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to add food page
    await page.goto('/add-food')
  })

  test('should display add food form correctly', async ({ page }) => {
    await expect(page.locator('text=Add Food Entry')).toBeVisible()
    
    // Check all form fields are present
    await expect(page.locator('input[placeholder*="food name"]')).toBeVisible()
    await expect(page.locator('input[placeholder*="quantity"]')).toBeVisible()
    await expect(page.locator('select, input[placeholder*="unit"]')).toBeVisible()
    await expect(page.locator('input[placeholder*="calories"]')).toBeVisible()
    await expect(page.locator('input[placeholder*="protein"]')).toBeVisible()
    await expect(page.locator('input[placeholder*="carbs"]')).toBeVisible()
    await expect(page.locator('input[placeholder*="fat"]')).toBeVisible()
    
    // Check submit button
    await expect(page.locator('button:has-text("Add Entry")')).toBeVisible()
  })

  test('should validate required fields', async ({ page }) => {
    // Try to submit empty form
    await page.click('button:has-text("Add Entry")')
    
    // Check HTML5 validation
    const foodNameInput = page.locator('input[placeholder*="food name"]')
    await expect(foodNameInput).toHaveAttribute('required')
  })

  test('should add food entry manually', async ({ page }) => {
    // Fill in all fields
    await page.fill('input[placeholder*="food name"]', 'Grilled Chicken Breast')
    await page.fill('input[placeholder*="quantity"]', '1')
    await page.selectOption('select', 'serving')
    await page.fill('input[placeholder*="calories"]', '231')
    await page.fill('input[placeholder*="protein"]', '43.5')
    await page.fill('input[placeholder*="carbs"]', '0')
    await page.fill('input[placeholder*="fat"]', '5')
    
    // Submit form
    await page.click('button:has-text("Add Entry")')
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*\/dashboard/)
    
    // Should show success message or the entry in the list
    await expect(page.locator('text=Grilled Chicken Breast')).toBeVisible()
  })

  test('should use AI nutrition estimation', async ({ page }) => {
    // Fill food name
    await page.fill('input[placeholder*="food name"]', 'Large apple with peanut butter')
    
    // Click estimate button
    const estimateButton = page.locator('button:has-text("Estimate Nutrition")')
    await estimateButton.click()
    
    // Should show loading state
    await expect(page.locator('text=Estimating...')).toBeVisible()
    
    // Should populate nutrition fields (would need API mocking)
    await page.waitForSelector('input[placeholder*="calories"]:not([value=""])', { timeout: 10000 })
    
    // Check that values were filled
    const caloriesInput = page.locator('input[placeholder*="calories"]')
    const caloriesValue = await caloriesInput.inputValue()
    expect(parseInt(caloriesValue)).toBeGreaterThan(0)
  })

  test('should display recent foods', async ({ page }) => {
    // Check for recent foods section
    await expect(page.locator('text=Recent Foods')).toBeVisible()
    
    // If there are recent foods, check their structure
    const recentFoods = page.locator('[data-testid="recent-food"]')
    if (await recentFoods.count() > 0) {
      await expect(recentFoods.first()).toBeVisible()
      await expect(recentFoods.first().locator('text=/\\d+ cal/')).toBeVisible()
    }
  })

  test('should select from recent foods', async ({ page }) => {
    // Look for recent food items
    const recentFoods = page.locator('[data-testid="recent-food"]')
    
    if (await recentFoods.count() > 0) {
      // Get the name of the first recent food
      const foodName = await recentFoods.first().locator('[data-testid="food-name"]').textContent()
      
      // Click on it
      await recentFoods.first().click()
      
      // Form should be populated
      const foodNameInput = page.locator('input[placeholder*="food name"]')
      await expect(foodNameInput).toHaveValue(foodName || '')
    }
  })

  test('should show smart suggestions while typing', async ({ page }) => {
    // Start typing food name
    const foodNameInput = page.locator('input[placeholder*="food name"]')
    await foodNameInput.fill('chick')
    
    // Wait for suggestions to appear
    await page.waitForSelector('[data-testid="food-suggestions"]', { timeout: 5000 })
    
    // Check suggestions are visible
    await expect(page.locator('[data-testid="food-suggestions"]')).toBeVisible()
    
    // Click on a suggestion
    const suggestions = page.locator('[data-testid="suggestion-item"]')
    if (await suggestions.count() > 0) {
      await suggestions.first().click()
      
      // Input should be filled with suggestion
      const suggestionText = await suggestions.first().textContent()
      await expect(foodNameInput).toHaveValue(suggestionText || '')
    }
  })

  test('should handle AI estimation errors gracefully', async ({ page }) => {
    // Mock a network error by intercepting the API call
    await page.route('/api/nutrition', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Service unavailable' })
      })
    })
    
    // Fill food name and try estimation
    await page.fill('input[placeholder*="food name"]', 'Some food item')
    await page.click('button:has-text("Estimate Nutrition")')
    
    // Should show error message
    await expect(page.locator('text=Failed to estimate')).toBeVisible()
  })

  test('should validate numeric inputs', async ({ page }) => {
    // Try to enter non-numeric values
    const caloriesInput = page.locator('input[placeholder*="calories"]')
    await caloriesInput.fill('abc')
    
    // Should not accept non-numeric input
    await expect(caloriesInput).toHaveValue('')
  })

  test('should disable form while submitting', async ({ page }) => {
    // Fill form
    await page.fill('input[placeholder*="food name"]', 'Test Food')
    await page.fill('input[placeholder*="calories"]', '100')
    await page.fill('input[placeholder*="protein"]', '10')
    await page.fill('input[placeholder*="carbs"]', '15')
    await page.fill('input[placeholder*="fat"]', '2')
    
    // Submit and check if form is disabled
    const submitButton = page.locator('button:has-text("Add Entry")')
    await submitButton.click()
    
    // Button should be disabled during submission
    await expect(submitButton).toBeDisabled()
    await expect(page.locator('text=Adding...')).toBeVisible()
  })

  test('should work on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Form should be responsive
    await expect(page.locator('input[placeholder*="food name"]')).toBeVisible()
    
    // All fields should be accessible
    await page.fill('input[placeholder*="food name"]', 'Mobile Test Food')
    await page.fill('input[placeholder*="calories"]', '150')
    
    // Submit should work
    await page.click('button:has-text("Add Entry")')
  })

  test('should edit existing food entry', async ({ page }) => {
    // Navigate to dashboard first to find an entry to edit
    await page.goto('/dashboard')
    
    // Look for edit buttons
    const editButtons = page.locator('button:has-text("Edit")')
    
    if (await editButtons.count() > 0) {
      // Click first edit button
      await editButtons.first().click()
      
      // Should open edit dialog or navigate to edit page
      await expect(page.locator('text=Edit Food Entry')).toBeVisible()
      
      // Modify some values
      await page.fill('input[placeholder*="calories"]', '250')
      
      // Save changes
      await page.click('button:has-text("Save")')
      
      // Should update the entry
      await expect(page.locator('text=250 cal')).toBeVisible()
    }
  })
})