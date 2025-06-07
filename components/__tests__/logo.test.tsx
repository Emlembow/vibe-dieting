import { render, screen } from '@/test-utils'
import { Logo } from '../logo'

describe('Logo Component', () => {
  it('renders the logo with default props', () => {
    render(<Logo />)
    
    expect(screen.getByText('Vibe Dieting')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<Logo className="custom-class" />)
    
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('renders as a link when href is provided', () => {
    render(<Logo href="/dashboard" />)
    
    const logoLink = screen.getByRole('link')
    expect(logoLink).toHaveAttribute('href', '/dashboard')
    expect(logoLink).toHaveTextContent('Vibe Dieting')
  })

  it('renders as a span when href is not provided', () => {
    render(<Logo />)
    
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.getByText('Vibe Dieting')).toBeInTheDocument()
  })
})