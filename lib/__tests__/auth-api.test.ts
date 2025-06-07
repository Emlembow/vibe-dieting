import { authenticateRequest, unauthorizedResponse } from '../auth-api'
import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Mock the global Request and Response
global.Request = class Request {} as any
global.Response = class Response {} as any

jest.mock('@supabase/supabase-js')

const mockCreateClient = createClient as jest.Mock

describe('Auth API Utils', () => {
  let mockRequest: Partial<NextRequest>
  let mockSupabase: any

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
    }
    
    mockCreateClient.mockReturnValue(mockSupabase)
    
    mockRequest = {
      headers: new Map(),
    }

    // Set environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
  })

  describe('authenticateRequest', () => {
    it('returns error when authorization header is missing', async () => {
      mockRequest.headers = {
        get: jest.fn().mockReturnValue(null),
      } as any

      const result = await authenticateRequest(mockRequest as NextRequest)

      expect(result).toEqual({
        user: null,
        error: 'Missing or invalid authorization header',
      })

      expect(mockCreateClient).not.toHaveBeenCalled()
    })

    it('returns error when authorization header does not start with Bearer', async () => {
      mockRequest.headers = {
        get: jest.fn().mockReturnValue('Basic abc123'),
      } as any

      const result = await authenticateRequest(mockRequest as NextRequest)

      expect(result).toEqual({
        user: null,
        error: 'Missing or invalid authorization header',
      })

      expect(mockCreateClient).not.toHaveBeenCalled()
    })

    it('successfully authenticates user with valid token', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' }

      mockRequest.headers = {
        get: jest.fn().mockReturnValue('Bearer valid-token'),
      } as any

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const result = await authenticateRequest(mockRequest as NextRequest)

      expect(result).toEqual({
        user: mockUser,
        error: null,
      })

      expect(mockCreateClient).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'test-anon-key',
        {
          auth: {
            persistSession: false,
          },
          global: {
            headers: {
              Authorization: 'Bearer valid-token',
            },
          },
        }
      )

      expect(mockSupabase.auth.getUser).toHaveBeenCalled()
    })

    it('returns error when Supabase returns auth error', async () => {
      mockRequest.headers = {
        get: jest.fn().mockReturnValue('Bearer invalid-token'),
      } as any

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid JWT' },
      })

      const result = await authenticateRequest(mockRequest as NextRequest)

      expect(result).toEqual({
        user: null,
        error: 'Invalid JWT',
      })
    })

    it('returns error when Supabase returns no user', async () => {
      mockRequest.headers = {
        get: jest.fn().mockReturnValue('Bearer valid-token'),
      } as any

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await authenticateRequest(mockRequest as NextRequest)

      expect(result).toEqual({
        user: null,
        error: 'Invalid or expired token',
      })
    })

    it('handles unexpected errors gracefully', async () => {
      mockRequest.headers = {
        get: jest.fn().mockReturnValue('Bearer valid-token'),
      } as any

      mockSupabase.auth.getUser.mockRejectedValue(new Error('Network error'))

      const result = await authenticateRequest(mockRequest as NextRequest)

      expect(result).toEqual({
        user: null,
        error: 'Authentication failed',
      })
    })

    it('extracts token correctly from Bearer header', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' }

      mockRequest.headers = {
        get: jest.fn().mockReturnValue('Bearer my-secret-token-123'),
      } as any

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      await authenticateRequest(mockRequest as NextRequest)

      expect(mockCreateClient).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({
          global: {
            headers: {
              Authorization: 'Bearer my-secret-token-123',
            },
          },
        })
      )
    })

    it('handles createClient errors', async () => {
      mockRequest.headers = {
        get: jest.fn().mockReturnValue('Bearer valid-token'),
      } as any

      mockCreateClient.mockImplementation(() => {
        throw new Error('Supabase initialization failed')
      })

      const result = await authenticateRequest(mockRequest as NextRequest)

      expect(result).toEqual({
        user: null,
        error: 'Authentication failed',
      })
    })
  })

  describe('unauthorizedResponse', () => {
    it('returns default unauthorized response', () => {
      const response = unauthorizedResponse()

      expect(response.status).toBe(401)
      
      // Test the response body
      response.json().then(body => {
        expect(body).toEqual({ error: 'Unauthorized' })
      })
    })

    it('returns custom unauthorized response message', () => {
      const customMessage = 'Custom unauthorized message'
      const response = unauthorizedResponse(customMessage)

      expect(response.status).toBe(401)
      
      response.json().then(body => {
        expect(body).toEqual({ error: customMessage })
      })
    })

    it('returns NextResponse with correct status and content type', () => {
      const response = unauthorizedResponse()

      expect(response.status).toBe(401)
      expect(response.headers.get('content-type')).toBe('application/json')
    })
  })
})