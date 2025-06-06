import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the home page
    await page.goto('/')
  })

  test('should redirect unauthenticated users to login', async ({ page }) => {
    // Try to access protected route
    await page.goto('/dashboard')
    
    // Should be redirected to login
    await expect(page).toHaveURL(/.*\/login/)
    await expect(page.locator('h1')).toContainText('Vibe Dieting')
    await expect(page.locator('text=Sign in to your account')).toBeVisible()
  })

  test('should allow user to register successfully', async ({ page }) => {
    await page.goto('/register')

    // Fill in registration form
    await page.fill('input[type="email"]', 'testuser@example.com')
    await page.fill('input[type="password"]', 'securepassword123')

    // Submit form
    await page.click('button[type="submit"]')

    // Should redirect to dashboard or show success message
    // Note: This would need real Supabase setup or mocking
    await expect(page).toHaveURL(/.*\/(dashboard|login)/)
  })

  test('should allow user to login successfully', async ({ page }) => {
    await page.goto('/login')

    // Fill in login form
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')

    // Submit form
    await page.click('button[type="submit"]')

    // Should redirect to dashboard
    // Note: This would need real authentication or mocking
    await expect(page).toHaveURL(/.*\/dashboard/)
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login')

    // Fill in invalid credentials
    await page.fill('input[type="email"]', 'invalid@example.com')
    await page.fill('input[type="password"]', 'wrongpassword')

    // Submit form
    await page.click('button[type="submit"]')

    // Should show error message
    await expect(page.locator('text=Invalid login credentials')).toBeVisible()
  })

  test('should validate form fields', async ({ page }) => {
    await page.goto('/login')

    // Try to submit empty form
    await page.click('button[type="submit"]')

    // Check HTML5 validation
    const emailInput = page.locator('input[type="email"]')
    const passwordInput = page.locator('input[type="password"]')
    
    await expect(emailInput).toHaveAttribute('required')
    await expect(passwordInput).toHaveAttribute('required')
  })

  test('should navigate between login and register pages', async ({ page }) => {
    await page.goto('/login')

    // Click sign up link
    await page.click('text=Sign up')
    await expect(page).toHaveURL(/.*\/register/)

    // Click sign in link
    await page.click('text=Sign in')
    await expect(page).toHaveURL(/.*\/login/)
  })

  test('should disable submit button while loading', async ({ page }) => {
    await page.goto('/login')

    // Fill form
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')

    // Submit and check if button is disabled
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()
    
    // Button should be disabled temporarily
    await expect(submitButton).toBeDisabled()
  })
})