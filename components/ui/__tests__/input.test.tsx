import { render, screen, fireEvent } from '@testing-library/react'
import { Input } from '../input'

describe('Input', () => {
  it('renders input element', () => {
    render(<Input data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toBeInTheDocument()
    expect(input).toBeInstanceOf(HTMLInputElement)
  })

  it('applies default classes', () => {
    render(<Input data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toHaveClass(
      'flex',
      'h-10',
      'w-full',
      'rounded-md',
      'border',
      'border-input',
      'bg-background',
      'px-3',
      'py-2',
      'text-sm'
    )
  })

  it('handles value changes', () => {
    const handleChange = jest.fn()
    render(<Input onChange={handleChange} data-testid="input" />)
    
    const input = screen.getByTestId('input')
    fireEvent.change(input, { target: { value: 'test value' } })
    
    expect(handleChange).toHaveBeenCalledTimes(1)
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({
      target: expect.objectContaining({
        value: 'test value'
      })
    }))
  })

  it('accepts different input types', () => {
    render(<Input type="email" data-testid="email-input" />)
    const input = screen.getByTestId('email-input')
    expect(input).toHaveAttribute('type', 'email')
  })

  it('handles placeholder text', () => {
    render(<Input placeholder="Enter your name" data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toHaveAttribute('placeholder', 'Enter your name')
  })

  it('handles disabled state', () => {
    render(<Input disabled data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toBeDisabled()
    expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50')
  })

  it('applies custom className', () => {
    render(<Input className="custom-input" data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toHaveClass('custom-input')
  })

  it('forwards ref correctly', () => {
    const ref = { current: null }
    render(<Input ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  it('handles focus and blur events', () => {
    const handleFocus = jest.fn()
    const handleBlur = jest.fn()
    
    render(
      <Input 
        onFocus={handleFocus} 
        onBlur={handleBlur} 
        data-testid="input" 
      />
    )
    
    const input = screen.getByTestId('input')
    
    fireEvent.focus(input)
    expect(handleFocus).toHaveBeenCalledTimes(1)
    
    fireEvent.blur(input)
    expect(handleBlur).toHaveBeenCalledTimes(1)
  })

  it('handles controlled input', () => {
    const { rerender } = render(<Input value="initial" data-testid="input" readOnly />)
    const input = screen.getByTestId('input') as HTMLInputElement
    expect(input.value).toBe('initial')
    
    rerender(<Input value="updated" data-testid="input" readOnly />)
    expect(input.value).toBe('updated')
  })

  it('accepts additional HTML attributes', () => {
    render(
      <Input 
        name="test-input"
        id="test-id"
        autoComplete="email"
        data-testid="input"
      />
    )
    
    const input = screen.getByTestId('input')
    expect(input).toHaveAttribute('name', 'test-input')
    expect(input).toHaveAttribute('id', 'test-id')
    expect(input).toHaveAttribute('autoComplete', 'email')
  })

  it('has proper focus styling classes', () => {
    render(<Input data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toHaveClass(
      'focus-visible:outline-none',
      'focus-visible:ring-2',
      'focus-visible:ring-ring',
      'focus-visible:ring-offset-2'
    )
  })
})