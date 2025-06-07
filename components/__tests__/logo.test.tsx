import { render, screen } from '@/test-utils'
import { Logo } from '../logo'

describe('Logo Component', () => {
  it('renders the logo with default props', () => {
    render(<Logo />)
    
    expect(screen.getByAltText('Vibe Dieting Logo')).toBeInTheDocument()
    expect(screen.getByRole('img')).toHaveAttribute('src', expect.stringContaining('vibe-logo-full.png'))
  })

  it('applies custom className correctly', () => {
    const { container } = render(<Logo className="custom-class" />)
    
    const logoElement = container.querySelector('.custom-class')
    expect(logoElement).toBeInTheDocument()
  })

  it('renders with different variants', () => {
    render(<Logo variant="icon" />)
    
    expect(screen.getByRole('img')).toHaveAttribute('src', expect.stringContaining('vibe-logo-icon.png'))
  })

  it('renders with different sizes', () => {
    render(<Logo size="lg" />)
    
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('width', '64')
    expect(img).toHaveAttribute('height', '64')
  })

  it('renders with custom props', () => {
    render(<Logo className="custom-class" variant="dark" size="sm" />)
    
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', expect.stringContaining('vibe-logo-dark.png'))
    expect(img).toHaveAttribute('width', '32')
    expect(img).toHaveAttribute('height', '32')
    
    // Check if custom class is applied
    const { container } = render(<Logo className="custom-class" />)
    const logoElement = container.querySelector('.custom-class')
    expect(logoElement).toBeInTheDocument()
  })

  it('handles all variants correctly', () => {
    const variants = ['default', 'icon', 'horizontal', 'vertical', 'dark', 'light']
    
    variants.forEach(variant => {
      const { unmount } = render(<Logo variant={variant as any} />)
      const img = screen.getByRole('img')
      expect(img).toHaveAttribute('src', expect.stringContaining(`vibe-logo-${variant === 'default' ? 'full' : variant}.png`))
      unmount()
    })
  })
})