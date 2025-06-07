import { render } from '@testing-library/react'
import LoginLoading from '../loading'

describe('LoginLoading', () => {
  it('renders loading skeleton with proper structure', () => {
    const { container } = render(<LoginLoading />)
    
    // Check main container
    const mainContainer = container.firstChild as HTMLElement
    expect(mainContainer).toHaveClass('flex')
    expect(mainContainer).toHaveClass('min-h-screen')
    expect(mainContainer).toHaveClass('items-center')
    expect(mainContainer).toHaveClass('justify-center')
  })

  it('renders card with proper styling', () => {
    const { container } = render(<LoginLoading />)
    
    const card = container.querySelector('.rounded-lg')
    expect(card).toHaveClass('w-full')
    expect(card).toHaveClass('max-w-md')
  })

  it('renders header skeletons', () => {
    const { container } = render(<LoginLoading />)
    
    // Check for logo skeleton
    const logoSkeleton = container.querySelector('.h-12.w-12.rounded-full')
    expect(logoSkeleton).toBeInTheDocument()
    
    // Check for title skeleton
    const titleSkeleton = container.querySelector('.h-8.w-48')
    expect(titleSkeleton).toBeInTheDocument()
    
    // Check for description skeleton
    const descSkeleton = container.querySelector('.h-4.w-64')
    expect(descSkeleton).toBeInTheDocument()
  })

  it('renders form field skeletons', () => {
    const { container } = render(<LoginLoading />)
    
    // Check for label skeletons
    const labelSkeletons = container.querySelectorAll('.h-4.w-16, .h-4.w-20')
    expect(labelSkeletons.length).toBe(2)
    
    // Check for input field skeletons
    const inputSkeletons = container.querySelectorAll('.h-10.w-full')
    expect(inputSkeletons.length).toBe(3) // 2 inputs + 1 button
  })

  it('renders centered text skeleton', () => {
    const { container } = render(<LoginLoading />)
    
    const centeredTextSkeleton = container.querySelector('.h-4.w-48.mx-auto')
    expect(centeredTextSkeleton).toBeInTheDocument()
  })

  it('has proper spacing classes', () => {
    const { container } = render(<LoginLoading />)
    
    // Check header spacing
    const header = container.querySelector('[class*="space-y-1"]')
    expect(header).toBeInTheDocument()
    
    // Check content spacing
    const content = container.querySelector('[class*="space-y-4"]')
    expect(content).toBeInTheDocument()
    
    // Check field group spacing
    const fieldGroups = container.querySelectorAll('[class*="space-y-2"]')
    expect(fieldGroups.length).toBe(2)
  })
})