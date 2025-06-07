import { registerUser } from '../auth'
import { createServerClient } from '@/lib/supabase'

jest.mock('@/lib/supabase')

const mockCreateServerClient = createServerClient as jest.Mock

describe('Auth Actions', () => {
  let mockSupabase: any

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockSupabase = {
      auth: {
        signUp: jest.fn(),
      },
    }
    
    mockCreateServerClient.mockReturnValue(mockSupabase)
  })

  describe('registerUser', () => {
    it('successfully registers a user with valid data', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' }
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', 'password123')
      formData.append('username', 'testuser')

      const result = await registerUser(formData)

      expect(result).toEqual({
        success: true,
        message: 'Account created successfully! Please check your email to verify your account.',
      })

      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: {
            username: 'testuser',
          },
        },
      })
    })

    it('returns error when email is missing', async () => {
      const formData = new FormData()
      formData.append('password', 'password123')
      formData.append('username', 'testuser')

      const result = await registerUser(formData)

      expect(result).toEqual({
        success: false,
        error: 'Email, password, and username are required',
      })

      expect(mockSupabase.auth.signUp).not.toHaveBeenCalled()
    })

    it('returns error when password is missing', async () => {
      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('username', 'testuser')

      const result = await registerUser(formData)

      expect(result).toEqual({
        success: false,
        error: 'Email, password, and username are required',
      })

      expect(mockSupabase.auth.signUp).not.toHaveBeenCalled()
    })

    it('returns error when username is missing', async () => {
      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', 'password123')

      const result = await registerUser(formData)

      expect(result).toEqual({
        success: false,
        error: 'Email, password, and username are required',
      })

      expect(mockSupabase.auth.signUp).not.toHaveBeenCalled()
    })

    it('returns error when password is too short', async () => {
      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', '123')
      formData.append('username', 'testuser')

      const result = await registerUser(formData)

      expect(result).toEqual({
        success: false,
        error: 'Password must be at least 6 characters',
      })

      expect(mockSupabase.auth.signUp).not.toHaveBeenCalled()
    })

    it('handles auth error from Supabase', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: null },
        error: { message: 'User already registered' },
      })

      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', 'password123')
      formData.append('username', 'testuser')

      const result = await registerUser(formData)

      expect(result).toEqual({
        success: false,
        error: 'User already registered',
      })
    })

    it('handles case where user creation fails', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', 'password123')
      formData.append('username', 'testuser')

      const result = await registerUser(formData)

      expect(result).toEqual({
        success: false,
        error: 'Failed to create user',
      })
    })

    it('handles unexpected errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      mockSupabase.auth.signUp.mockRejectedValue(new Error('Network error'))

      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', 'password123')
      formData.append('username', 'testuser')

      const result = await registerUser(formData)

      expect(result).toEqual({
        success: false,
        error: 'Network error',
      })

      expect(consoleSpy).toHaveBeenCalledWith('Registration error:', expect.any(Error))
      
      consoleSpy.mockRestore()
    })

    it('handles unexpected errors without message', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      mockSupabase.auth.signUp.mockRejectedValue({})

      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', 'password123')
      formData.append('username', 'testuser')

      const result = await registerUser(formData)

      expect(result).toEqual({
        success: false,
        error: 'An unexpected error occurred',
      })

      expect(consoleSpy).toHaveBeenCalled()
      
      consoleSpy.mockRestore()
    })

    it('accepts minimum valid password length', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' }
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', '123456') // Exactly 6 characters
      formData.append('username', 'testuser')

      const result = await registerUser(formData)

      expect(result.success).toBe(true)
      expect(mockSupabase.auth.signUp).toHaveBeenCalled()
    })
  })
})