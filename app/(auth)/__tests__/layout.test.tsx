import { render, screen } from '@/test-utils'
import AuthLayout from '../layout'

describe('Auth Layout', () => {
  it('renders children with auth layout structure', () => {
    render(
      <AuthLayout>
        <div>Test Content</div>
      </AuthLayout>
    )
    
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('has proper layout structure', () => {
    const { container } = render(
      <AuthLayout>
        <div>Test Content</div>
      </AuthLayout>
    )
    
    // Check for layout container
    expect(container.firstChild).toHaveClass('min-h-screen')
  })
})