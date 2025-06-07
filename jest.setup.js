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
    let resolvedValue = { data: null, error: null }
    
    const mockBuilder = {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      neq: jest.fn().mockReturnThis(),
      gt: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lt: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      like: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      contains: jest.fn().mockReturnThis(),
      containedBy: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn(() => {
        resolvedValue = { data: null, error: null }
        return Promise.resolve(resolvedValue)
      }),
      maybeSingle: jest.fn(() => Promise.resolve(resolvedValue)),
      // Make it thenable for async/await
      then: jest.fn((onFulfilled) => Promise.resolve(resolvedValue).then(onFulfilled)),
      catch: jest.fn((onRejected) => Promise.resolve(resolvedValue).catch(onRejected)),
      finally: jest.fn((onFinally) => Promise.resolve(resolvedValue).finally(onFinally)),
    }
    
    return mockBuilder
  }

  return {
    supabase: {
      auth: {
        signInWithPassword: jest.fn().mockResolvedValue({ data: null, error: null }),
        signUp: jest.fn().mockResolvedValue({ data: null, error: null }),
        signOut: jest.fn().mockResolvedValue({ error: null }),
        getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
        getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
        onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
      },
      from: jest.fn(() => createMockQueryBuilder()),
    },
    createServerClient: jest.fn(() => ({
      auth: {
        signInWithPassword: jest.fn().mockResolvedValue({ data: null, error: null }),
        signUp: jest.fn().mockResolvedValue({ data: null, error: null }),
        signOut: jest.fn().mockResolvedValue({ error: null }),
        getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
        getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
        onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
      },
      from: jest.fn(() => createMockQueryBuilder()),
    })),
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