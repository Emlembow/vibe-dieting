import { render } from '@testing-library/react'
import { Badge } from '../badge'

describe('Badge', () => {
  it('renders with default variant', () => {
    const { container } = render(<Badge>Default Badge</Badge>)
    const badge = container.firstChild as HTMLElement
    
    expect(badge).toHaveClass('inline-flex')
    expect(badge).toHaveClass('items-center')
    expect(badge).toHaveClass('rounded-full')
    expect(badge).toHaveClass('border')
    expect(badge).toHaveClass('px-2.5')
    expect(badge).toHaveClass('py-0.5')
    expect(badge).toHaveClass('text-xs')
    expect(badge).toHaveClass('font-semibold')
    expect(badge).toHaveClass('border-transparent')
    expect(badge).toHaveClass('bg-primary')
    expect(badge).toHaveClass('text-primary-foreground')
    expect(badge).toHaveTextContent('Default Badge')
  })

  it('renders with secondary variant', () => {
    const { container } = render(<Badge variant="secondary">Secondary Badge</Badge>)
    const badge = container.firstChild as HTMLElement
    
    expect(badge).toHaveClass('border-transparent')
    expect(badge).toHaveClass('bg-secondary')
    expect(badge).toHaveClass('text-secondary-foreground')
    expect(badge).toHaveTextContent('Secondary Badge')
  })

  it('renders with destructive variant', () => {
    const { container } = render(<Badge variant="destructive">Destructive Badge</Badge>)
    const badge = container.firstChild as HTMLElement
    
    expect(badge).toHaveClass('border-transparent')
    expect(badge).toHaveClass('bg-destructive')
    expect(badge).toHaveClass('text-destructive-foreground')
    expect(badge).toHaveTextContent('Destructive Badge')
  })

  it('renders with outline variant', () => {
    const { container } = render(<Badge variant="outline">Outline Badge</Badge>)
    const badge = container.firstChild as HTMLElement
    
    expect(badge).toHaveClass('text-foreground')
    expect(badge).toHaveTextContent('Outline Badge')
  })

  it('applies custom className', () => {
    const { container } = render(<Badge className="custom-class">Custom Badge</Badge>)
    const badge = container.firstChild as HTMLElement
    
    expect(badge).toHaveClass('custom-class')
    expect(badge).toHaveClass('inline-flex') // Still has base classes
  })

  it('passes through HTML attributes', () => {
    const { container } = render(
      <Badge data-testid="test-badge" id="badge-id">
        Badge with attributes
      </Badge>
    )
    const badge = container.firstChild as HTMLElement
    
    expect(badge).toHaveAttribute('data-testid', 'test-badge')
    expect(badge).toHaveAttribute('id', 'badge-id')
  })

  it('renders children correctly', () => {
    const { container } = render(
      <Badge>
        <span>Complex</span> content
      </Badge>
    )
    
    expect(container).toHaveTextContent('Complex content')
  })

  it('has proper focus styling classes', () => {
    const { container } = render(<Badge>Focus Badge</Badge>)
    const badge = container.firstChild as HTMLElement
    
    expect(badge).toHaveClass('focus:outline-none')
    expect(badge).toHaveClass('focus:ring-2')
    expect(badge).toHaveClass('focus:ring-ring')
    expect(badge).toHaveClass('focus:ring-offset-2')
  })

  it('has transition classes', () => {
    const { container } = render(<Badge>Transition Badge</Badge>)
    const badge = container.firstChild as HTMLElement
    
    expect(badge).toHaveClass('transition-colors')
  })
})