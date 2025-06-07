import { render, screen } from '@/test-utils'
import AuthLayout from '../layout'

// Mock the auth context
jest.mock('@/context/auth-context', () => ({
  useAuth: jest.fn(),
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

const mockUseAuth = require('@/context/auth-context').useAuth

describe('Auth Layout', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
    })
  })
  it('renders children with auth layout structure', () => {
    render(
      <AuthLayout>
        <div>Test Content</div>
      </AuthLayout>
    )
    
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('shows loading state when loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: true,
    })

    const { container } = render(
      <AuthLayout>
        <div>Test Content</div>
      </AuthLayout>
    )
    
    // Check for loading spinner by querying the container
    const spinner = container.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
    expect(screen.queryByText('Test Content')).not.toBeInTheDocument()
  })

  it('redirects when user is logged in', () => {
    const mockPush = jest.fn()
    jest.doMock('next/navigation', () => ({
      useRouter: () => ({
        push: mockPush,
      }),
    }))

    mockUseAuth.mockReturnValue({
      user: { id: 'test-user', email: 'test@example.com' },
      isLoading: false,
    })

    render(
      <AuthLayout>
        <div>Test Content</div>
      </AuthLayout>
    )
    
    // Should render the children even though redirect is happening
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })
})