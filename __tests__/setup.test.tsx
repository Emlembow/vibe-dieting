import { render, screen } from '@testing-library/react'

// Simple test to verify Jest setup
describe('Test Setup', () => {
  it('should render a simple component', () => {
    const TestComponent = () => <div>Hello World</div>
    
    render(<TestComponent />)
    
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('should handle async operations', async () => {
    const AsyncComponent = () => {
      return <div>Async Content</div>
    }
    
    render(<AsyncComponent />)
    
    const content = await screen.findByText('Async Content')
    expect(content).toBeInTheDocument()
  })
})