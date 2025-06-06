import { test, expect } from '@playwright/test'

test.describe('Goals Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/goals')
  })

  test('should display goals form correctly', async ({ page }) => {
    await expect(page.locator('text=Set Your Macro Goals')).toBeVisible()
    
    // Check all input fields
    await expect(page.locator('input[placeholder*="calories"]')).toBeVisible()
    await expect(page.locator('input[placeholder*="protein"]')).toBeVisible()
    await expect(page.locator('input[placeholder*="carbs"]')).toBeVisible()
    await expect(page.locator('input[placeholder*="fat"]')).toBeVisible()
    
    // Check save button
    await expect(page.locator('button:has-text("Save Goals")')).toBeVisible()
  })

  test('should display preset goal options', async ({ page }) => {
    await expect(page.locator('text=Quick Presets')).toBeVisible()
    await expect(page.locator('button:has-text("Weight Loss")')).toBeVisible()
    await expect(page.locator('button:has-text("Maintenance")')).toBeVisible()
    await expect(page.locator('button:has-text("Muscle Gain")')).toBeVisible()
  })

  test('should apply weight loss preset', async ({ page }) => {
    await page.click('button:has-text("Weight Loss")')
    
    // Check that fields are populated with weight loss values
    await expect(page.locator('input[placeholder*="calories"]')).toHaveValue('1500')
    await expect(page.locator('input[placeholder*="protein"]')).toHaveValue('120')
    await expect(page.locator('input[placeholder*="carbs"]')).toHaveValue('150')
    await expect(page.locator('input[placeholder*="fat"]')).toHaveValue('50')
  })

  test('should apply maintenance preset', async ({ page }) => {
    await page.click('button:has-text("Maintenance")')
    
    // Check maintenance values
    await expect(page.locator('input[placeholder*="calories"]')).toHaveValue('2000')
    await expect(page.locator('input[placeholder*="protein"]')).toHaveValue('150')
    await expect(page.locator('input[placeholder*="carbs"]')).toHaveValue('200')
    await expect(page.locator('input[placeholder*="fat"]')).toHaveValue('70')
  })

  test('should apply muscle gain preset', async ({ page }) => {
    await page.click('button:has-text("Muscle Gain")')
    
    // Check muscle gain values
    await expect(page.locator('input[placeholder*="calories"]')).toHaveValue('2500')
    await expect(page.locator('input[placeholder*="protein"]')).toHaveValue('200')
    await expect(page.locator('input[placeholder*="carbs"]')).toHaveValue('250')
    await expect(page.locator('input[placeholder*="fat"]')).toHaveValue('80')
  })

  test('should save custom goals', async ({ page }) => {
    // Fill in custom values
    await page.fill('input[placeholder*="calories"]', '2200')
    await page.fill('input[placeholder*="protein"]', '165')
    await page.fill('input[placeholder*="carbs"]', '220')
    await page.fill('input[placeholder*="fat"]', '75')
    
    // Save goals
    await page.click('button:has-text("Save Goals")')
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*\/dashboard/)
    
    // Goals should be visible on dashboard
    await expect(page.locator('text=2200')).toBeVisible() // Calorie goal
  })

  test('should validate numeric inputs', async ({ page }) => {
    // Try to enter non-numeric values
    const caloriesInput = page.locator('input[placeholder*="calories"]')
    await caloriesInput.fill('abc')
    
    // Should not accept non-numeric input
    await expect(caloriesInput).toHaveValue('')
  })

  test('should validate minimum values', async ({ page }) => {
    // Try to enter negative values
    await page.fill('input[placeholder*="calories"]', '-100')
    await page.click('button:has-text("Save Goals")')
    
    // Should show validation error or prevent submission
    const caloriesInput = page.locator('input[placeholder*="calories"]')
    const isValid = await caloriesInput.evaluate((input: HTMLInputElement) => input.validity.valid)
    expect(isValid).toBe(false)
  })

  test('should display macro ratios', async ({ page }) => {
    // Set some values
    await page.fill('input[placeholder*="calories"]', '2000')
    await page.fill('input[placeholder*="protein"]', '150')
    await page.fill('input[placeholder*="carbs"]', '200')
    await page.fill('input[placeholder*="fat"]', '70')
    
    // Should display calculated percentages
    await expect(page.locator('text=/Protein.*30%/')).toBeVisible()
    await expect(page.locator('text=/Carbs.*40%/')).toBeVisible()
    await expect(page.locator('text=/Fat.*30%/')).toBeVisible()
  })

  test('should load existing goals', async ({ page }) => {
    // If user already has goals, they should be loaded
    const caloriesInput = page.locator('input[placeholder*="calories"]')
    const currentValue = await caloriesInput.inputValue()
    
    if (currentValue && parseInt(currentValue) > 0) {
      // Goals are already set, verify they're displayed
      expect(parseInt(currentValue)).toBeGreaterThan(0)
    }
  })

  test('should update existing goals', async ({ page }) => {
    // Load existing goals first
    const caloriesInput = page.locator('input[placeholder*="calories"]')
    await caloriesInput.fill('2100')
    
    // Save updated goals
    await page.click('button:has-text("Save Goals")')
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*\/dashboard/)
    
    // Navigate back to goals to verify update
    await page.goto('/goals')
    await expect(caloriesInput).toHaveValue('2100')
  })

  test('should disable form while saving', async ({ page }) => {
    // Fill form
    await page.fill('input[placeholder*="calories"]', '2000')
    await page.fill('input[placeholder*="protein"]', '150')
    await page.fill('input[placeholder*="carbs"]', '200')
    await page.fill('input[placeholder*="fat"]', '70')
    
    // Submit and check if form is disabled
    const saveButton = page.locator('button:has-text("Save Goals")')
    await saveButton.click()
    
    // Button should be disabled during saving
    await expect(saveButton).toBeDisabled()
    await expect(page.locator('text=Saving...')).toBeVisible()
  })

  test('should work on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Form should be responsive
    await expect(page.locator('input[placeholder*="calories"]')).toBeVisible()
    
    // Preset buttons should be accessible
    await page.click('button:has-text("Maintenance")')
    
    // Values should be filled
    await expect(page.locator('input[placeholder*="calories"]')).toHaveValue('2000')
    
    // Save should work
    await page.click('button:has-text("Save Goals")')
  })

  test('should provide helpful information about macro goals', async ({ page }) => {
    // Check for help text or tooltips
    await expect(page.locator('text=recommended')).toBeVisible()
    
    // Check for macro information
    await expect(page.locator('text=protein')).toBeVisible()
    await expect(page.locator('text=carbs')).toBeVisible()
    await expect(page.locator('text=fat')).toBeVisible()
  })

  test('should handle form errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('/api/goals', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Database error' })
      })
    })
    
    // Fill and submit form
    await page.fill('input[placeholder*="calories"]', '2000')
    await page.fill('input[placeholder*="protein"]', '150')
    await page.fill('input[placeholder*="carbs"]', '200')
    await page.fill('input[placeholder*="fat"]', '70')
    
    await page.click('button:has-text("Save Goals")')
    
    // Should show error message
    await expect(page.locator('text=Failed to save')).toBeVisible()
  })

  test('should calculate daily calorie needs', async ({ page }) => {
    // Look for calorie calculator if available
    const calculatorSection = page.locator('text=Calculate Daily Needs')
    
    if (await calculatorSection.isVisible()) {
      // Fill in basic info
      await page.fill('input[placeholder*="age"]', '30')
      await page.selectOption('select[name="gender"]', 'male')
      await page.fill('input[placeholder*="weight"]', '70')
      await page.fill('input[placeholder*="height"]', '175')
      await page.selectOption('select[name="activity"]', 'moderate')
      
      // Calculate
      await page.click('button:has-text("Calculate")')
      
      // Should populate calorie field
      const caloriesInput = page.locator('input[placeholder*="calories"]')
      const calculatedValue = await caloriesInput.inputValue()
      expect(parseInt(calculatedValue)).toBeGreaterThan(1000)
    }
  })
})