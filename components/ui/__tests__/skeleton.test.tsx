import React from 'react'
import { render, screen } from '@testing-library/react'
import { Skeleton } from '../skeleton'

describe('Skeleton Component', () => {
  it('renders skeleton with default styling', () => {
    render(<Skeleton data-testid="skeleton" />)
    
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toBeInTheDocument()
    expect(skeleton).toHaveClass('animate-pulse', 'rounded-md', 'bg-muted')
  })

  it('applies custom className', () => {
    render(<Skeleton className="custom-skeleton" data-testid="skeleton" />)
    
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toHaveClass('custom-skeleton')
    expect(skeleton).toHaveClass('animate-pulse') // Should maintain default classes
  })

  it('passes through additional props', () => {
    render(
      <Skeleton 
        data-testid="skeleton"
        id="skeleton-id"
        aria-label="Loading content"
      />
    )
    
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toHaveAttribute('id', 'skeleton-id')
    expect(skeleton).toHaveAttribute('aria-label', 'Loading content')
  })

  it('renders with custom dimensions', () => {
    render(<Skeleton className="h-8 w-full" data-testid="skeleton" />)
    
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toHaveClass('h-8', 'w-full')
  })

  it('can render skeleton with content inside', () => {
    render(
      <Skeleton data-testid="skeleton">
        <span>Loading text...</span>
      </Skeleton>
    )
    
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toBeInTheDocument()
    expect(screen.getByText('Loading text...')).toBeInTheDocument()
  })

  it('supports different skeleton shapes', () => {
    const { rerender } = render(
      <Skeleton className="rounded-full" data-testid="skeleton" />
    )
    
    let skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toHaveClass('rounded-full')
    
    rerender(<Skeleton className="rounded-none" data-testid="skeleton" />)
    skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toHaveClass('rounded-none')
  })

  it('works as a loading placeholder', () => {
    render(
      <div>
        <Skeleton className="h-4 w-3/4 mb-2" data-testid="title-skeleton" />
        <Skeleton className="h-3 w-1/2" data-testid="subtitle-skeleton" />
      </div>
    )
    
    expect(screen.getByTestId('title-skeleton')).toHaveClass('h-4', 'w-3/4', 'mb-2')
    expect(screen.getByTestId('subtitle-skeleton')).toHaveClass('h-3', 'w-1/2')
  })

  it('supports custom animation overrides', () => {
    render(
      <Skeleton 
        className="animate-bounce" 
        data-testid="skeleton" 
      />
    )
    
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toHaveClass('animate-bounce')
  })

  it('renders as a div element', () => {
    render(<Skeleton data-testid="skeleton" />)
    
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton.tagName).toBe('DIV')
  })

  it('handles empty className gracefully', () => {
    render(<Skeleton className="" data-testid="skeleton" />)
    
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toHaveClass('animate-pulse', 'rounded-md', 'bg-muted')
  })

  it('supports event handlers', () => {
    const handleClick = jest.fn()
    render(
      <Skeleton 
        onClick={handleClick}
        data-testid="skeleton"
      />
    )
    
    const skeleton = screen.getByTestId('skeleton')
    skeleton.click()
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('can be used for different content types', () => {
    render(
      <div>
        {/* Avatar skeleton */}
        <Skeleton className="h-12 w-12 rounded-full" data-testid="avatar-skeleton" />
        
        {/* Text line skeleton */}
        <Skeleton className="h-4 w-full" data-testid="text-skeleton" />
        
        {/* Button skeleton */}
        <Skeleton className="h-10 w-24 rounded-md" data-testid="button-skeleton" />
      </div>
    )
    
    expect(screen.getByTestId('avatar-skeleton')).toHaveClass('h-12', 'w-12', 'rounded-full')
    expect(screen.getByTestId('text-skeleton')).toHaveClass('h-4', 'w-full')
    expect(screen.getByTestId('button-skeleton')).toHaveClass('h-10', 'w-24', 'rounded-md')
  })
})