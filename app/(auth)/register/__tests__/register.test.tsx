import { render, screen, fireEvent, waitFor, act } from '@/test-utils'
import RegisterPage from '../page'

// Mock the auth action
jest.mock('@/app/actions/auth', () => ({
  registerUser: jest.fn(),
}))

const mockPush = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

const { registerUser } = require('@/app/actions/auth')

describe('Register Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders registration form with all required fields', () => {
    render(<RegisterPage />)
    
    expect(screen.getByText('Vibe Dieting')).toBeInTheDocument()
    expect(screen.getByText('Join Vibe Dieting')).toBeInTheDocument()
    expect(screen.getByLabelText('Username')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
    expect(screen.getByText(/already have an account/i)).toBeInTheDocument()
  })

  it('handles successful registration', async () => {
    registerUser.mockResolvedValue({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
    })

    render(<RegisterPage />)
    
    const usernameInput = screen.getByLabelText('Username')
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /create account/i })

    await act(async () => {
      fireEvent.change(usernameInput, { target: { value: 'testuser' } })
      fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'SecurePassword123' } })
      fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(registerUser).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'newuser@example.com',
        password: 'SecurePassword123',
      })
      expect(screen.getByText(/registration successful/i)).toBeInTheDocument()
    })
  })

  it('handles registration error - email already exists', async () => {
    registerUser.mockResolvedValue({
      success: false,
      error: 'User already registered',
    })

    render(<RegisterPage />)
    
    const usernameInput = screen.getByLabelText('Username')
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /create account/i })

    await act(async () => {
      fireEvent.change(usernameInput, { target: { value: 'testuser' } })
      fireEvent.change(emailInput, { target: { value: 'existing@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'SecurePassword123' } })
      fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(screen.getByText('User already registered')).toBeInTheDocument()
    })
  })

  it('validates password requirements', async () => {
    render(<RegisterPage />)
    
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /create account/i })

    await act(async () => {
      fireEvent.change(passwordInput, { target: { value: '123' } })
      fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(screen.getByText(/password must contain at least one uppercase letter/i)).toBeInTheDocument()
    })
  })

  it('validates email format', async () => {
    render(<RegisterPage />)
    
    const emailInput = screen.getByLabelText('Email')
    const submitButton = screen.getByRole('button', { name: /create account/i })

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'notanemail' } })
      fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
    })
  })

  it('validates username requirements', async () => {
    render(<RegisterPage />)
    
    const usernameInput = screen.getByLabelText('Username')
    const submitButton = screen.getByRole('button', { name: /create account/i })

    await act(async () => {
      fireEvent.change(usernameInput, { target: { value: 'ab' } })
      fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(screen.getByText(/username must be at least 3 characters/i)).toBeInTheDocument()
    })
  })

  it('disables submit button while loading', async () => {
    let resolveRegister: any
    const registerPromise = new Promise((resolve) => {
      resolveRegister = resolve
    })
    
    registerUser.mockReturnValue(registerPromise)

    render(<RegisterPage />)
    
    const usernameInput = screen.getByLabelText('Username')
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /create account/i })

    await act(async () => {
      fireEvent.change(usernameInput, { target: { value: 'testuser' } })
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'SecurePassword123' } })
      fireEvent.click(submitButton)
    })

    // Button should be disabled while loading
    expect(submitButton).toBeDisabled()

    // Resolve the promise
    await act(async () => {
      resolveRegister({
        success: true,
        message: 'Registration successful!',
      })
    })

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
    })
  })

  it('navigates to login page when clicking sign in link', () => {
    render(<RegisterPage />)
    
    const signInLink = screen.getByRole('link', { name: /sign in/i })
    expect(signInLink).toHaveAttribute('href', '/login')
  })
})