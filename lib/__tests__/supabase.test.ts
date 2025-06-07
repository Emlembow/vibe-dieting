import { createClient } from '@supabase/supabase-js'

jest.mock('@supabase/supabase-js')

const mockCreateClient = createClient as jest.Mock

describe('Supabase Client', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    process.env = originalEnv
  })

  describe('supabase client', () => {
    it('creates client with valid environment variables', () => {
      // Set environment variables before importing
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

      mockCreateClient.mockReturnValue({ mock: 'client' })

      // Import the module fresh
      jest.resetModules()
      const { supabase } = require('../supabase')

      expect(mockCreateClient).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'test-anon-key'
      )
      expect(supabase).toEqual({ mock: 'client' })
    })

    it('returns null when URL is missing', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

      jest.resetModules()
      const { supabase } = require('../supabase')

      expect(mockCreateClient).not.toHaveBeenCalled()
      expect(supabase).toBeNull()
    })

    it('returns null when anon key is missing', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      jest.resetModules()
      const { supabase } = require('../supabase')

      expect(mockCreateClient).not.toHaveBeenCalled()
      expect(supabase).toBeNull()
    })

    it('returns null when URL is placeholder', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'your_supabase_project_url'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

      jest.resetModules()
      const { supabase } = require('../supabase')

      expect(mockCreateClient).not.toHaveBeenCalled()
      expect(supabase).toBeNull()
    })
  })

  describe('createServerClient', () => {
    beforeEach(() => {
      // Reset environment for server client tests
      process.env = { ...originalEnv }
    })

    it('creates server client with valid environment variables', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

      mockCreateClient.mockReturnValue({ mock: 'server-client' })

      jest.resetModules()
      const { createServerClient } = require('../supabase')
      const serverClient = createServerClient()

      expect(mockCreateClient).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'test-anon-key',
        {
          auth: {
            persistSession: false,
          },
        }
      )
      expect(serverClient).toEqual({ mock: 'server-client' })
    })

    it('throws error when URL is missing', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

      jest.resetModules()
      const { createServerClient } = require('../supabase')

      expect(() => createServerClient()).toThrow(
        'Missing or invalid Supabase environment variables'
      )

      expect(mockCreateClient).not.toHaveBeenCalled()
    })

    it('throws error when anon key is missing', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      jest.resetModules()
      const { createServerClient } = require('../supabase')

      expect(() => createServerClient()).toThrow(
        'Missing or invalid Supabase environment variables'
      )

      expect(mockCreateClient).not.toHaveBeenCalled()
    })

    it('throws error when URL is placeholder', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'your_supabase_project_url'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

      jest.resetModules()
      const { createServerClient } = require('../supabase')

      expect(() => createServerClient()).toThrow(
        'Missing or invalid Supabase environment variables'
      )

      expect(mockCreateClient).not.toHaveBeenCalled()
    })

    it('includes correct auth configuration for server client', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

      mockCreateClient.mockReturnValue({ mock: 'server-client' })

      jest.resetModules()
      const { createServerClient } = require('../supabase')
      createServerClient()

      expect(mockCreateClient).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({
          auth: expect.objectContaining({
            persistSession: false,
          }),
        })
      )
    })
  })
})