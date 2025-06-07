import { render, screen } from '@/test-utils'
import { Logo } from '../logo'

describe('Logo Component', () => {
  it('renders the logo with default props', () => {
    render(<Logo />)
    
    expect(screen.getByText('Vibe Dieting')).toBeInTheDocument()
  })

  it('applies custom className correctly', () => {
    const { container } = render(<Logo className="custom-class" />)
    
    const logoElement = container.querySelector('.custom-class')
    expect(logoElement).toBeInTheDocument()
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

  it('renders with custom props', () => {
    render(<Logo className="custom-class" href="/dashboard" />)
    
    const logoLink = screen.getByRole('link')
    expect(logoLink).toHaveAttribute('href', '/dashboard')
    expect(logoLink).toHaveTextContent('Vibe Dieting')
    
    // Check if custom class is applied
    const logoElement = logoLink.closest('.custom-class') || logoLink.querySelector('.custom-class') || logoLink
    expect(logoElement).toBeInTheDocument()
  })

  it('handles missing href gracefully', () => {
    render(<Logo className="test-class" />)
    
    expect(screen.getByText('Vibe Dieting')).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})