import { GET } from '../route'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

jest.mock('@supabase/supabase-js')
jest.mock('next/server', () => ({
  NextResponse: {
    redirect: jest.fn((url: URL) => ({ url: url.toString() }))
  }
}))

const mockCreateClient = createClient as jest.Mock
const mockRedirect = NextResponse.redirect as jest.Mock

describe('Auth Callback Route', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = { ...originalEnv }
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('redirects to dashboard after successful code exchange', async () => {
    const mockExchangeCodeForSession = jest.fn().mockResolvedValue({ error: null })
    mockCreateClient.mockReturnValue({
      auth: {
        exchangeCodeForSession: mockExchangeCodeForSession
      }
    })

    const request = new Request('http://localhost:3000/auth/callback?code=test-code')
    await GET(request)

    expect(mockCreateClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'test-anon-key'
    )
    expect(mockExchangeCodeForSession).toHaveBeenCalledWith('test-code')
    expect(mockRedirect).toHaveBeenCalledWith(
      new URL('http://localhost:3000/dashboard')
    )
  })

  it('redirects to custom next path after successful code exchange', async () => {
    const mockExchangeCodeForSession = jest.fn().mockResolvedValue({ error: null })
    mockCreateClient.mockReturnValue({
      auth: {
        exchangeCodeForSession: mockExchangeCodeForSession
      }
    })

    const request = new Request('http://localhost:3000/auth/callback?code=test-code&next=/goals')
    await GET(request)

    expect(mockRedirect).toHaveBeenCalledWith(
      new URL('http://localhost:3000/goals')
    )
  })

  it('redirects to login with error when code exchange fails', async () => {
    const mockExchangeCodeForSession = jest.fn().mockResolvedValue({ 
      error: { message: 'Invalid code' } 
    })
    mockCreateClient.mockReturnValue({
      auth: {
        exchangeCodeForSession: mockExchangeCodeForSession
      }
    })

    const request = new Request('http://localhost:3000/auth/callback?code=invalid-code')
    await GET(request)

    expect(mockRedirect).toHaveBeenCalledWith(
      new URL('http://localhost:3000/login?error=Unable to verify email')
    )
  })

  it('redirects to login with error when environment variables are missing', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL

    const request = new Request('http://localhost:3000/auth/callback?code=test-code')
    await GET(request)

    expect(mockCreateClient).not.toHaveBeenCalled()
    expect(mockRedirect).toHaveBeenCalledWith(
      new URL('http://localhost:3000/login?error=Configuration error')
    )
  })

  it('handles hash-based tokens for email confirmation', async () => {
    const request = new Request('http://localhost:3000/auth/callback#access_token=test-token&type=email')
    await GET(request)

    expect(mockRedirect).toHaveBeenCalledWith(
      new URL('http://localhost:3000/?access_token=test-token&type=email')
    )
  })

  it('redirects to login with error when no code or hash is provided', async () => {
    const request = new Request('http://localhost:3000/auth/callback')
    await GET(request)

    expect(mockRedirect).toHaveBeenCalledWith(
      new URL('http://localhost:3000/login?error=Unable to verify email')
    )
  })
})