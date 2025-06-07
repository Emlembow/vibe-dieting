import { render, screen } from '@/test-utils'
import ProtectedLayout from '../layout'
import { useAuth } from '@/context/auth-context'
import { useRouter } from 'next/navigation'

jest.mock('@/context/auth-context')
jest.mock('next/navigation')

// Mock the UI components
jest.mock('@/components/mobile-nav', () => ({
  MobileNav: () => <div data-testid="mobile-nav" />,
}))

jest.mock('@/components/sidebar-nav', () => ({
  SidebarNav: () => <div data-testid="sidebar-nav" />,
}))

jest.mock('@/components/ui/sidebar', () => ({
  SidebarProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-provider">{children}</div>
  ),
  SidebarInset: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="sidebar-inset" className={className}>{children}</div>
  ),
}))

jest.mock('@/components/ui/loading-spinner', () => ({
  LoadingSpinner: ({ size }: { size?: string }) => (
    <div data-testid="loading-spinner" data-size={size}>Loading...</div>
  ),
}))

const mockUseAuth = useAuth as jest.Mock
const mockPush = jest.fn()

describe('ProtectedLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
  })

  it('shows loading spinner when auth is loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: true,
    })

    render(
      <ProtectedLayout>
        <div>Test Content</div>
      </ProtectedLayout>
    )

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    expect(screen.getByTestId('loading-spinner')).toHaveAttribute('data-size', 'lg')
    expect(screen.queryByText('Test Content')).not.toBeInTheDocument()
  })

  it('redirects to login when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
    })

    render(
      <ProtectedLayout>
        <div>Test Content</div>
      </ProtectedLayout>
    )

    expect(mockPush).toHaveBeenCalledWith('/login')
    expect(screen.queryByText('Test Content')).not.toBeInTheDocument()
  })

  it('renders children with full layout when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'test-user', email: 'test@example.com' },
      isLoading: false,
    })

    render(
      <ProtectedLayout>
        <div data-testid="test-content">Test Content</div>
      </ProtectedLayout>
    )

    expect(screen.getByTestId('test-content')).toBeInTheDocument()
    expect(screen.getByTestId('sidebar-provider')).toBeInTheDocument()
    expect(screen.getByTestId('mobile-nav')).toBeInTheDocument()
    expect(screen.getByTestId('sidebar-nav')).toBeInTheDocument()
    expect(screen.getByTestId('sidebar-inset')).toBeInTheDocument()
  })

  it('does not redirect when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'test-user', email: 'test@example.com' },
      isLoading: false,
    })

    render(
      <ProtectedLayout>
        <div>Test Content</div>
      </ProtectedLayout>
    )

    expect(mockPush).not.toHaveBeenCalled()
  })

  it('does not redirect while loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: true,
    })

    render(
      <ProtectedLayout>
        <div>Test Content</div>
      </ProtectedLayout>
    )

    expect(mockPush).not.toHaveBeenCalled()
  })

  it('applies correct CSS classes to layout elements', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'test-user', email: 'test@example.com' },
      isLoading: false,
    })

    render(
      <ProtectedLayout>
        <div>Test Content</div>
      </ProtectedLayout>
    )

    const sidebarInset = screen.getByTestId('sidebar-inset')
    expect(sidebarInset).toHaveClass('bg-background')
  })

  it('wraps content in main element with correct classes', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'test-user', email: 'test@example.com' },
      isLoading: false,
    })

    const { container } = render(
      <ProtectedLayout>
        <div>Test Content</div>
      </ProtectedLayout>
    )

    const main = container.querySelector('main')
    expect(main).toBeInTheDocument()
    expect(main).toHaveClass('flex-1', 'p-4', 'md:p-8')
  })
})