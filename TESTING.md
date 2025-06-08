# Testing Guide

This project has comprehensive testing coverage including unit tests, integration tests, and end-to-end tests to ensure reliability during refactoring and feature development.

## Test Structure

```
├── __tests__/                 # Basic setup tests
├── app/                      # Application code
│   ├── (auth)/
│   │   ├── login/__tests__/  # Login page tests
│   │   └── register/__tests__/ # Register page tests
│   └── (protected)/
│       ├── dashboard/__tests__/ # Dashboard tests
│       ├── add-food/__tests__/  # Food tracking tests
│       └── goals/__tests__/     # Goals management tests
├── e2e/                      # End-to-end tests
├── test-utils/               # Testing utilities and helpers
├── jest.config.js           # Jest configuration
├── jest.setup.js            # Jest setup file
└── playwright.config.ts     # Playwright configuration
```

## Test Types

### 1. Unit Tests (Jest + React Testing Library)
- Component rendering and behavior
- User interactions
- Form validation
- API error handling
- State management

### 2. Integration Tests
- Authentication flows
- Data fetching and display
- CRUD operations
- Component interactions

### 3. End-to-End Tests (Playwright)
- Complete user workflows
- Cross-browser compatibility
- Mobile responsiveness
- Performance validation

## Running Tests

### All Tests
```bash
# Run all unit and integration tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for CI (with coverage and no watch)
npm run test:ci
```

### End-to-End Tests
```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in specific browser
npx playwright test --browser=firefox

# Run E2E tests in headed mode (see browser)
npx playwright test --headed
```

### Specific Test Suites
```bash
# Run specific test file
npm test login.test.tsx

# Run tests matching pattern
npm test -- --testPathPattern="auth"

# Run tests for specific component
npm test -- --testPathPattern="dashboard"
```

## Test Coverage

The project applies test coverage based on component criticality and business value. Critical features and components that handle user data, authentication, or core business logic receive comprehensive test coverage, while utility components and UI elements are tested based on their complexity and risk profile.

### Viewing Coverage
```bash
# Generate and view coverage report
npm run test:coverage
open coverage/lcov-report/index.html
```

## Writing Tests

### Unit Test Example
```typescript
import { render, screen, fireEvent } from '@/test-utils'
import LoginPage from '../page'

describe('Login Page', () => {
  it('should handle successful login', async () => {
    render(<LoginPage />)
    
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })
})
```

### E2E Test Example
```typescript
import { test, expect } from '@playwright/test'

test('should add food entry', async ({ page }) => {
  await page.goto('/add-food')
  
  await page.fill('input[placeholder*="food name"]', 'Apple')
  await page.fill('input[placeholder*="calories"]', '95')
  await page.click('button:has-text("Add Entry")')
  
  await expect(page).toHaveURL(/.*\/dashboard/)
  await expect(page.locator('text=Apple')).toBeVisible()
})
```

## Test Utilities

### Custom Render Function
The `test-utils/index.tsx` provides a custom render function that wraps components with necessary providers:

```typescript
import { render, screen } from '@/test-utils'

// This automatically wraps your component with:
// - AuthProvider
// - Any other necessary providers
```

### Mock Data Generators
```typescript
import { createMockFoodEntry, createMockMacroGoal } from '@/test-utils'

const mockFood = createMockFoodEntry({
  food_name: 'Custom Food',
  calories: 200
})
```

## Mocking

### Supabase
Supabase client is automatically mocked in `jest.setup.js`:

```javascript
mockSupabase.from = jest.fn(() => ({
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockResolvedValue({ data: null, error: null }),
  // ... other methods
}))
```

### Next.js Router
Router functions are mocked for testing navigation:

```javascript
;(useRouter as jest.Mock).mockReturnValue({
  push: mockPush,
  replace: jest.fn(),
  back: jest.fn(),
})
```

### API Calls
Mock fetch for testing API interactions:

```javascript
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ calories: 200, protein: 25 })
})
```

## Continuous Integration

Tests run automatically on:
- Pull requests to `main` and `develop` branches
- Pushes to `main` and `develop` branches

### CI Pipeline Stages
1. **Lint and Type Check** - Code quality validation
2. **Unit Tests** - Component and logic testing
3. **E2E Tests** - Full application testing
4. **Security Scan** - Vulnerability detection
5. **Performance Tests** - Lighthouse audits
6. **Build and Deploy** - Production deployment

## Test Environment Setup

### Prerequisites
```bash
# Install dependencies
npm ci

# Install Playwright browsers (for E2E tests)
npx playwright install --with-deps
```

### Environment Variables
For E2E tests that require API access, set up test environment variables:

```bash
# .env.test.local
NEXT_PUBLIC_SUPABASE_URL=your_test_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_test_supabase_key
```

## Debugging Tests

### Jest Tests
```bash
# Run specific test with verbose output
npm test -- --testPathPattern="login" --verbose

# Debug with Node.js debugger
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Playwright Tests
```bash
# Run with browser visible
npx playwright test --headed

# Debug specific test
npx playwright test --debug auth.spec.ts

# Generate and view test report
npx playwright show-report
```

## Best Practices

1. **Test Naming**: Use descriptive test names that explain the expected behavior
2. **Arrange-Act-Assert**: Structure tests clearly with setup, action, and verification
3. **Mock External Dependencies**: Always mock API calls, external services, and navigation
4. **Test User Interactions**: Focus on testing what users actually do
5. **Avoid Implementation Details**: Test behavior, not internal implementation
6. **Use Semantic Queries**: Use `getByRole`, `getByLabelText` over `getByTestId`
7. **Test Error Cases**: Include tests for error states and edge cases
8. **Keep Tests Independent**: Each test should be able to run in isolation

## Troubleshooting

### Common Issues

#### Tests failing due to missing dependencies
```bash
npm install --save-dev @testing-library/dom
```

#### E2E tests timing out
```bash
# Increase timeout in playwright.config.ts
timeout: 60000
```

#### Mock issues
Check `jest.setup.js` for proper mock configuration.

#### Coverage not meeting threshold
Add tests for uncovered branches and functions.

## Performance

### Test Performance Tips
- Use `test.concurrent` for independent Playwright tests
- Mock heavy operations in unit tests
- Use `beforeAll` for expensive setup operations
- Consider test sharding for large test suites

### CI Optimization
- Cache dependencies between runs
- Run tests in parallel where possible
- Use appropriate worker counts for the CI environment