import { render, screen, fireEvent, waitFor } from '@/test-utils'
import LoginPage from '../page'
import { supabase } from '@/lib/supabase'

// Mock the modules
jest.mock('@/lib/supabase')

const mockSupabase = supabase as jest.Mocked<typeof supabase>

// Get the mocked router functions
const mockNavigation = jest.requireMock('next/navigation')

describe('Login Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders login form with all required fields', () => {
    render(<LoginPage />)
    
    expect(screen.getByText('Vibe Dieting')).toBeInTheDocument()
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    render(<LoginPage />)
    
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    fireEvent.click(submitButton)

    // HTML5 validation should prevent submission with empty fields
    const emailInput = screen.getByLabelText('Email') as HTMLInputElement
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement
    
    expect(emailInput.validity.valid).toBe(false)
    expect(passwordInput.validity.valid).toBe(false)
  })

  it('handles successful login', async () => {
    mockSupabase.auth.signInWithPassword = jest.fn().mockResolvedValue({
      data: { user: { id: 'test-user' }, session: {} },
      error: null,
    })

    render(<LoginPage />)
    
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
      expect(mockNavigation.mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('handles login error - invalid credentials', async () => {
    mockSupabase.auth.signInWithPassword = jest.fn().mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials' },
    })

    render(<LoginPage />)
    
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Invalid login credentials')).toBeInTheDocument()
      expect(mockNavigation.mockPush).not.toHaveBeenCalled()
    })
  })

  it('handles network error', async () => {
    mockSupabase.auth.signInWithPassword = jest.fn().mockRejectedValue(
      new Error('Network error')
    )

    render(<LoginPage />)
    
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Failed to sign in')).toBeInTheDocument()
    })
  })

  it('disables submit button while loading', async () => {
    let resolveLogin: any
    const loginPromise = new Promise((resolve) => {
      resolveLogin = resolve
    })
    
    mockSupabase.auth.signInWithPassword = jest.fn().mockReturnValue(loginPromise)

    render(<LoginPage />)
    
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    // Button should be disabled while loading
    expect(submitButton).toBeDisabled()
    expect(screen.getByText('Signing in...')).toBeInTheDocument()

    // Resolve the promise
    resolveLogin({
      data: { user: { id: 'test-user' }, session: {} },
      error: null,
    })

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
    })
  })

  it('navigates to register page when clicking sign up link', () => {
    render(<LoginPage />)
    
    const signUpLink = screen.getByRole('link', { name: /sign up/i })
    expect(signUpLink).toHaveAttribute('href', '/register')
  })
})