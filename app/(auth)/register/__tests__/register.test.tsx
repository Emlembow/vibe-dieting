import { render, screen, fireEvent, waitFor } from '@/test-utils'
import RegisterPage from '../page'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

jest.mock('@/lib/supabase')
jest.mock('next/navigation')

const mockPush = jest.fn()
const mockSupabase = supabase as jest.Mocked<typeof supabase>

describe('Register Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
  })

  it('renders registration form with all required fields', () => {
    render(<RegisterPage />)
    
    expect(screen.getByText('Vibe Dieting')).toBeInTheDocument()
    expect(screen.getByText('Create your account')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
    expect(screen.getByText(/already have an account/i)).toBeInTheDocument()
  })

  it('handles successful registration', async () => {
    mockSupabase.auth.signUp = jest.fn().mockResolvedValue({
      data: { 
        user: { id: 'test-user', email: 'test@example.com' }, 
        session: {} 
      },
      error: null,
    })

    render(<RegisterPage />)
    
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /create account/i })

    fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'securepassword123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'securepassword123',
      })
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('handles registration error - email already exists', async () => {
    mockSupabase.auth.signUp = jest.fn().mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'User already registered' },
    })

    render(<RegisterPage />)
    
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /create account/i })

    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('User already registered')).toBeInTheDocument()
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  it('handles weak password error', async () => {
    mockSupabase.auth.signUp = jest.fn().mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Password should be at least 6 characters' },
    })

    render(<RegisterPage />)
    
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /create account/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: '123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Password should be at least 6 characters')).toBeInTheDocument()
    })
  })

  it('disables submit button while loading', async () => {
    let resolveSignUp: any
    const signUpPromise = new Promise((resolve) => {
      resolveSignUp = resolve
    })
    
    mockSupabase.auth.signUp = jest.fn().mockReturnValue(signUpPromise)

    render(<RegisterPage />)
    
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /create account/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    // Button should be disabled while loading
    expect(submitButton).toBeDisabled()
    expect(screen.getByText('Creating account...')).toBeInTheDocument()

    // Resolve the promise
    resolveSignUp({
      data: { user: { id: 'test-user' }, session: {} },
      error: null,
    })

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
    })
  })

  it('validates email format', async () => {
    render(<RegisterPage />)
    
    const emailInput = screen.getByLabelText('Email') as HTMLInputElement
    const submitButton = screen.getByRole('button', { name: /create account/i })

    // Invalid email
    fireEvent.change(emailInput, { target: { value: 'notanemail' } })
    fireEvent.click(submitButton)
    
    expect(emailInput.validity.valid).toBe(false)
  })

  it('navigates to login page when clicking sign in link', () => {
    render(<RegisterPage />)
    
    const signInLink = screen.getByRole('link', { name: /sign in/i })
    expect(signInLink).toHaveAttribute('href', '/login')
  })
})