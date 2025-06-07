import { render } from '@testing-library/react'
import { Separator } from '../separator'

describe('Separator', () => {
  it('renders with default props', () => {
    const { container } = render(<Separator />)
    const separator = container.firstChild as HTMLElement
    
    expect(separator).toHaveClass('shrink-0')
    expect(separator).toHaveClass('bg-border')
    expect(separator).toHaveClass('h-[1px]')
    expect(separator).toHaveClass('w-full')
    expect(separator).toHaveAttribute('data-orientation', 'horizontal')
    expect(separator).toHaveAttribute('aria-orientation', 'horizontal')
  })

  it('renders vertical separator', () => {
    const { container } = render(<Separator orientation="vertical" />)
    const separator = container.firstChild as HTMLElement
    
    expect(separator).toHaveClass('h-full')
    expect(separator).toHaveClass('w-[1px]')
    expect(separator).toHaveAttribute('data-orientation', 'vertical')
    expect(separator).toHaveAttribute('aria-orientation', 'vertical')
  })

  it('renders horizontal separator explicitly', () => {
    const { container } = render(<Separator orientation="horizontal" />)
    const separator = container.firstChild as HTMLElement
    
    expect(separator).toHaveClass('h-[1px]')
    expect(separator).toHaveClass('w-full')
    expect(separator).toHaveAttribute('data-orientation', 'horizontal')
  })

  it('applies custom className', () => {
    const { container } = render(<Separator className="custom-class" />)
    const separator = container.firstChild as HTMLElement
    
    expect(separator).toHaveClass('custom-class')
    expect(separator).toHaveClass('shrink-0') // Still has base classes
  })

  it('sets decorative prop correctly', () => {
    const { container } = render(<Separator decorative={false} />)
    const separator = container.firstChild as HTMLElement
    
    expect(separator).not.toHaveAttribute('aria-hidden')
  })

  it('uses decorative by default', () => {
    const { container } = render(<Separator />)
    const separator = container.firstChild as HTMLElement
    
    // Default decorative=true means it should be hidden from screen readers
    expect(separator).toHaveAttribute('aria-hidden', 'true')
  })

  it('passes through other props', () => {
    const { container } = render(
      <Separator data-testid="test-separator" id="sep-id" />
    )
    const separator = container.firstChild as HTMLElement
    
    expect(separator).toHaveAttribute('data-testid', 'test-separator')
    expect(separator).toHaveAttribute('id', 'sep-id')
  })

  it('forwards ref correctly', () => {
    const ref = { current: null }
    render(<Separator ref={ref} />)
    
    expect(ref.current).not.toBeNull()
  })
})