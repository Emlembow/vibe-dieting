// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => {
  const mockPush = jest.fn()
  const mockReplace = jest.fn()
  const mockBack = jest.fn()
  const mockPrefetch = jest.fn()
  const mockRefresh = jest.fn()
  
  return {
    useRouter: jest.fn(() => ({
      push: mockPush,
      replace: mockReplace,
      back: mockBack,
      prefetch: mockPrefetch,
      refresh: mockRefresh,
    })),
    usePathname: jest.fn(() => ''),
    useSearchParams: jest.fn(() => new URLSearchParams()),
    mockPush,
    mockReplace,
    mockBack,
    mockPrefetch,
    mockRefresh,
  }
})

// Mock Supabase client with proper promise returns
jest.mock('@/lib/supabase', () => {
  // Mock data for different tables
  const mockMacroGoal = {
    id: 'goal-1',
    user_id: 'test-user-id',
    daily_calorie_goal: 2000,
    protein_goal: 150,
    carb_goal: 200,
    fat_goal: 70,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const mockFoodEntries = [
    {
      id: 'food-1',
      user_id: 'test-user-id',
      food_name: 'Chicken Breast',
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
      quantity: 1,
      unit: 'serving',
      date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ]

  // Create a chainable mock that implements thenable pattern
  const createMockQueryBuilder = (tableName = '') => {
    let currentTable = tableName
    let currentData = null
    
    // Determine what data to return based on table
    if (tableName === 'macro_goals') {
      currentData = mockMacroGoal
    } else if (tableName === 'food_entries') {
      currentData = mockFoodEntries
    } else if (tableName === 'yolo_days') {
      currentData = null // No YOLO day by default
    }

    const mockBuilder = {}
    
    // Add methods that return the builder for chaining
    mockBuilder.select = jest.fn(() => mockBuilder)
    mockBuilder.insert = jest.fn(() => mockBuilder)
    mockBuilder.update = jest.fn(() => mockBuilder)
    mockBuilder.delete = jest.fn(() => mockBuilder)
    mockBuilder.eq = jest.fn(() => mockBuilder)
    mockBuilder.order = jest.fn(() => mockBuilder)
    mockBuilder.limit = jest.fn(() => mockBuilder)
    mockBuilder.gte = jest.fn(() => mockBuilder)
    mockBuilder.lte = jest.fn(() => mockBuilder)
    mockBuilder.catch = jest.fn(() => mockBuilder)
    
    // Terminal methods that return promises
    mockBuilder.single = jest.fn(() => Promise.resolve({ 
      data: currentData, 
      error: currentData ? null : { code: 'PGRST116', message: 'No rows found' }
    }))
    
    // Make it thenable for async/await
    mockBuilder.then = jest.fn((resolve) => {
      const result = { 
        data: Array.isArray(currentData) ? currentData : (currentData ? [currentData] : []), 
        error: null 
      }
      if (resolve) {
        return resolve(result)
      }
      return Promise.resolve(result)
    })
    
    return mockBuilder
  }

  return {
    supabase: {
      auth: {
        signInWithPassword: jest.fn().mockResolvedValue({ 
          data: { user: { id: 'test-user-id' }, session: null }, 
          error: null 
        }),
        signUp: jest.fn().mockResolvedValue({ data: null, error: null }),
        signOut: jest.fn().mockResolvedValue({ error: null }),
        getSession: jest.fn().mockResolvedValue({ 
          data: { session: { user: { id: 'test-user-id' } } }, 
          error: null 
        }),
        onAuthStateChange: jest.fn(),
      },
      from: jest.fn((tableName) => createMockQueryBuilder(tableName)),
    },
  }
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Suppress console errors in tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render') ||
       args[0].includes('Warning: An update to') ||
       args[0].includes('act(...)'))
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})