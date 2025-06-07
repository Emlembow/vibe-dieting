import { render, screen } from '@testing-library/react'
import { LoadingSpinner, LoadingPage } from '../loading-spinner'

describe('LoadingSpinner', () => {
  it('renders with default size', () => {
    const { container } = render(<LoadingSpinner />)
    const spinner = container.firstChild as HTMLElement
    
    expect(spinner).toHaveClass('animate-spin')
    expect(spinner).toHaveClass('rounded-full')
    expect(spinner).toHaveClass('border-b-2')
    expect(spinner).toHaveClass('border-t-2')
    expect(spinner).toHaveClass('border-primary')
    expect(spinner).toHaveClass('h-8')
    expect(spinner).toHaveClass('w-8')
  })

  it('renders with small size', () => {
    const { container } = render(<LoadingSpinner size="sm" />)
    const spinner = container.firstChild as HTMLElement
    
    expect(spinner).toHaveClass('h-4')
    expect(spinner).toHaveClass('w-4')
  })

  it('renders with large size', () => {
    const { container } = render(<LoadingSpinner size="lg" />)
    const spinner = container.firstChild as HTMLElement
    
    expect(spinner).toHaveClass('h-12')
    expect(spinner).toHaveClass('w-12')
  })

  it('applies custom className', () => {
    const { container } = render(<LoadingSpinner className="custom-class" />)
    const spinner = container.firstChild as HTMLElement
    
    expect(spinner).toHaveClass('custom-class')
  })

  it('combines custom className with default classes', () => {
    const { container } = render(<LoadingSpinner className="text-red-500" />)
    const spinner = container.firstChild as HTMLElement
    
    expect(spinner).toHaveClass('text-red-500')
    expect(spinner).toHaveClass('animate-spin')
    expect(spinner).toHaveClass('border-primary')
  })
})

describe('LoadingPage', () => {
  it('renders loading page with spinner and text', () => {
    render(<LoadingPage />)
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    
    // Check for container structure
    const container = screen.getByText('Loading...').parentElement?.parentElement
    expect(container).toHaveClass('flex')
    expect(container).toHaveClass('min-h-[400px]')
    expect(container).toHaveClass('items-center')
    expect(container).toHaveClass('justify-center')
  })

  it('renders with large spinner', () => {
    const { container } = render(<LoadingPage />)
    const spinner = container.querySelector('.animate-spin')
    
    expect(spinner).toHaveClass('h-12')
    expect(spinner).toHaveClass('w-12')
  })

  it('has proper spacing between spinner and text', () => {
    render(<LoadingPage />)
    
    const innerContainer = screen.getByText('Loading...').parentElement
    expect(innerContainer).toHaveClass('flex')
    expect(innerContainer).toHaveClass('flex-col')
    expect(innerContainer).toHaveClass('items-center')
    expect(innerContainer).toHaveClass('space-y-4')
  })

  it('applies muted text styling', () => {
    render(<LoadingPage />)
    
    const loadingText = screen.getByText('Loading...')
    expect(loadingText).toHaveClass('text-sm')
    expect(loadingText).toHaveClass('text-muted-foreground')
  })
})