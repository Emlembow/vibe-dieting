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
  // Create a chainable mock that implements thenable pattern
  const createMockQueryBuilder = () => {
    const mockBuilder = {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      // Make it thenable for async/await
      then: jest.fn((resolve) => resolve({ data: null, error: null })),
      catch: jest.fn(),
    }
    
    return mockBuilder
  }

  return {
    supabase: {
      auth: {
        signInWithPassword: jest.fn().mockResolvedValue({ data: null, error: null }),
        signUp: jest.fn().mockResolvedValue({ data: null, error: null }),
        signOut: jest.fn().mockResolvedValue({ error: null }),
        getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
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
      args[0].includes('Warning: ReactDOM.render')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})