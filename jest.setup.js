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

// Mock Supabase client with basic structure
jest.mock('@/lib/supabase', () => {
  // Simple chainable mock that tests can override
  const createMockQueryBuilder = () => {
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
    mockBuilder.single = jest.fn(() => Promise.resolve({ data: null, error: null }))
    
    // Make it thenable for async/await
    mockBuilder.then = jest.fn((resolve) => {
      if (resolve) {
        return resolve({ data: [], error: null })
      }
      return Promise.resolve({ data: [], error: null })
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
      from: jest.fn(() => createMockQueryBuilder()),
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