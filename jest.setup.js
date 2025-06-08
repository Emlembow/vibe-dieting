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

// Mock Supabase client with working method chaining
jest.mock('@/lib/supabase', () => {
  // Create a proper chainable mock using a class-like approach
  function createMockQueryBuilder() {
    const builder = {
      // Chainable methods - these return the builder itself
      select: jest.fn(function() { return this }),
      insert: jest.fn(function() { return this }),
      update: jest.fn(function() { return this }),
      delete: jest.fn(function() { return this }),
      eq: jest.fn(function() { return this }),
      neq: jest.fn(function() { return this }),
      gt: jest.fn(function() { return this }),
      gte: jest.fn(function() { return this }),
      lt: jest.fn(function() { return this }),
      lte: jest.fn(function() { return this }),
      like: jest.fn(function() { return this }),
      ilike: jest.fn(function() { return this }),
      in: jest.fn(function() { return this }),
      is: jest.fn(function() { return this }),
      order: jest.fn(function() { return this }),
      limit: jest.fn(function() { return this }),
      range: jest.fn(function() { return this }),
      contains: jest.fn(function() { return this }),
      containedBy: jest.fn(function() { return this }),
      overlaps: jest.fn(function() { return this }),
      filter: jest.fn(function() { return this }),
      not: jest.fn(function() { return this }),
      
      // Terminal methods that return promises
      single: jest.fn(() => Promise.resolve({ 
        data: null, 
        error: { code: 'PGRST116', message: 'No rows found' }
      })),
      maybeSingle: jest.fn(() => Promise.resolve({ data: null, error: null })),
      
      // Make it thenable for async/await (for queries without .single())
      then: jest.fn((resolve) => {
        if (resolve) {
          return resolve({ data: [], error: null })
        }
        return Promise.resolve({ data: [], error: null })
      }),
      catch: jest.fn(() => Promise.resolve({ data: null, error: null })),
    }
    
    return builder
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
        getUser: jest.fn().mockResolvedValue({ 
          data: { user: { id: 'test-user-id' } }, 
          error: null 
        }),
      },
      from: jest.fn(() => createMockQueryBuilder()),
      rpc: jest.fn(() => createMockQueryBuilder()),
      storage: {
        from: jest.fn(() => ({
          upload: jest.fn().mockResolvedValue({ data: null, error: null }),
          download: jest.fn().mockResolvedValue({ data: null, error: null }),
          remove: jest.fn().mockResolvedValue({ data: null, error: null }),
          list: jest.fn().mockResolvedValue({ data: [], error: null }),
        })),
      },
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