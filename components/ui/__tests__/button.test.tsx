import { render, screen, fireEvent } from '@testing-library/react'
import { Button, buttonVariants } from '../button'

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies default variant class', () => {
    render(<Button>Default</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-primary', 'text-primary-foreground')
  })

  it('applies destructive variant class', () => {
    render(<Button variant="destructive">Delete</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-destructive', 'text-destructive-foreground')
  })

  it('applies outline variant class', () => {
    render(<Button variant="outline">Outline</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('border', 'border-input', 'bg-background')
  })

  it('applies secondary variant class', () => {
    render(<Button variant="secondary">Secondary</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-secondary', 'text-secondary-foreground')
  })

  it('applies ghost variant class', () => {
    render(<Button variant="ghost">Ghost</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('hover:bg-accent', 'hover:text-accent-foreground')
  })

  it('applies link variant class', () => {
    render(<Button variant="link">Link</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('text-primary', 'underline-offset-4')
  })

  it('applies small size class', () => {
    render(<Button size="sm">Small</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('h-9', 'rounded-md', 'px-3')
  })

  it('applies large size class', () => {
    render(<Button size="lg">Large</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('h-11', 'rounded-md', 'px-8')
  })

  it('applies icon size class', () => {
    render(<Button size="icon">Icon</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('h-10', 'w-10')
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50')
  })

  it('forwards ref correctly', () => {
    const ref = { current: null }
    render(<Button ref={ref}>Ref test</Button>)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })

  it('accepts additional props', () => {
    render(<Button data-testid="custom-button" type="submit">Submit</Button>)
    const button = screen.getByTestId('custom-button')
    expect(button).toHaveAttribute('type', 'submit')
  })

  describe('buttonVariants', () => {
    it('returns correct classes for default variant', () => {
      const classes = buttonVariants()
      expect(classes).toContain('bg-primary')
      expect(classes).toContain('text-primary-foreground')
    })

    it('returns correct classes for custom variant and size', () => {
      const classes = buttonVariants({ variant: 'outline', size: 'sm' })
      expect(classes).toContain('border')
      expect(classes).toContain('h-9')
    })
  })
})