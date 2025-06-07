import { render, screen } from '@/test-utils'
import RootLayout from '../layout'

// Mock the Analytics component
jest.mock('@vercel/analytics/next', () => ({
  Analytics: () => <div data-testid="analytics" />,
}))

// Mock AuthProvider
jest.mock('@/context/auth-context', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-provider">{children}</div>
  ),
}))

describe('RootLayout', () => {
  it('renders children within AuthProvider', () => {
    render(
      <RootLayout>
        <div data-testid="test-content">Test Content</div>
      </RootLayout>
    )

    expect(screen.getByTestId('auth-provider')).toBeInTheDocument()
    expect(screen.getByTestId('test-content')).toBeInTheDocument()
    expect(screen.getByTestId('analytics')).toBeInTheDocument()
  })

  it('renders with correct HTML structure', () => {
    const { container } = render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    )

    const html = container.querySelector('html')
    const body = container.querySelector('body')

    expect(html).toHaveAttribute('lang', 'en')
    expect(body).toHaveClass(/inter/)
  })

  it('includes all required components', () => {
    render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    )

    // Verify AuthProvider wraps children
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument()
    
    // Verify Analytics component is included
    expect(screen.getByTestId('analytics')).toBeInTheDocument()
  })
})