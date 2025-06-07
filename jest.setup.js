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
  const createMockQueryBuilder = (customResolvedValue) => {
    let resolvedValue = customResolvedValue || { data: null, error: null }
    
    const mockBuilder = {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockReturnThis(),
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
      overlaps: jest.fn().mockReturnThis(),
      textSearch: jest.fn().mockReturnThis(),
      match: jest.fn().mockReturnThis(),
      not: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      filter: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      abortSignal: jest.fn().mockReturnThis(),
      single: jest.fn(() => {
        return Promise.resolve(resolvedValue)
      }),
      maybeSingle: jest.fn(() => Promise.resolve(resolvedValue)),
      csv: jest.fn(() => Promise.resolve(resolvedValue)),
      geojson: jest.fn(() => Promise.resolve(resolvedValue)),
      explain: jest.fn(() => Promise.resolve(resolvedValue)),
      rollback: jest.fn(() => Promise.resolve(resolvedValue)),
      returns: jest.fn().mockReturnThis(),
      // Make it thenable for async/await - this is the critical part
      then: jest.fn((onFulfilled, onRejected) => {
        try {
          return Promise.resolve(resolvedValue).then(onFulfilled, onRejected)
        } catch (error) {
          return Promise.reject(error)
        }
      }),
      catch: jest.fn((onRejected) => Promise.resolve(resolvedValue).catch(onRejected)),
      finally: jest.fn((onFinally) => Promise.resolve(resolvedValue).finally(onFinally)),
      // Allow setting custom resolved value for specific tests
      __setResolvedValue: (value) => {
        resolvedValue = value
      }
    }
    
    return mockBuilder
  }

  // Create a global mock that can be shared
  const globalCreateMockQueryBuilder = createMockQueryBuilder

  return {
    supabase: {
      auth: {
        signInWithPassword: jest.fn().mockResolvedValue({ data: null, error: null }),
        signUp: jest.fn().mockResolvedValue({ data: null, error: null }),
        signOut: jest.fn().mockResolvedValue({ error: null }),
        getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
        getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
        onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
        setSession: jest.fn().mockResolvedValue({ data: null, error: null }),
        refreshSession: jest.fn().mockResolvedValue({ data: null, error: null }),
        updateUser: jest.fn().mockResolvedValue({ data: null, error: null }),
        resetPasswordForEmail: jest.fn().mockResolvedValue({ data: null, error: null }),
        verifyOtp: jest.fn().mockResolvedValue({ data: null, error: null }),
      },
      from: jest.fn(() => globalCreateMockQueryBuilder()),
      storage: {
        from: jest.fn(() => ({
          upload: jest.fn().mockResolvedValue({ data: null, error: null }),
          download: jest.fn().mockResolvedValue({ data: null, error: null }),
          remove: jest.fn().mockResolvedValue({ data: null, error: null }),
          list: jest.fn().mockResolvedValue({ data: [], error: null }),
          getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'mock-url' } }),
        })),
      },
      rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
      channel: jest.fn(() => ({
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn().mockReturnThis(),
        unsubscribe: jest.fn().mockReturnThis(),
      })),
    },
    createServerClient: jest.fn(() => ({
      auth: {
        signInWithPassword: jest.fn().mockResolvedValue({ data: null, error: null }),
        signUp: jest.fn().mockResolvedValue({ data: null, error: null }),
        signOut: jest.fn().mockResolvedValue({ error: null }),
        getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
        getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
        onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
        setSession: jest.fn().mockResolvedValue({ data: null, error: null }),
        refreshSession: jest.fn().mockResolvedValue({ data: null, error: null }),
        updateUser: jest.fn().mockResolvedValue({ data: null, error: null }),
        resetPasswordForEmail: jest.fn().mockResolvedValue({ data: null, error: null }),
        verifyOtp: jest.fn().mockResolvedValue({ data: null, error: null }),
      },
      from: jest.fn(() => globalCreateMockQueryBuilder()),
      storage: {
        from: jest.fn(() => ({
          upload: jest.fn().mockResolvedValue({ data: null, error: null }),
          download: jest.fn().mockResolvedValue({ data: null, error: null }),
          remove: jest.fn().mockResolvedValue({ data: null, error: null }),
          list: jest.fn().mockResolvedValue({ data: [], error: null }),
          getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'mock-url' } }),
        })),
      },
      rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
      channel: jest.fn(() => ({
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn().mockReturnThis(),
        unsubscribe: jest.fn().mockReturnThis(),
      })),
    })),
    // Export the helper for tests that need to create custom mocks
    createMockQueryBuilder: globalCreateMockQueryBuilder,
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

// Mock ResizeObserver for Recharts
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback
  }
  observe() {}
  unobserve() {}
  disconnect() {}
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