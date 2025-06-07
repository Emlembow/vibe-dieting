import { render, screen, fireEvent } from '@testing-library/react'
import GlobalError from '../error'

// Mock console.error to avoid noise in test output
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {})

// Mock window.location
const mockLocation = {
  href: '',
}
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
})

describe('GlobalError', () => {
  const mockReset = jest.fn()
  const mockError = new Error('Test error message')

  beforeEach(() => {
    jest.clearAllMocks()
    mockLocation.href = ''
  })

  afterAll(() => {
    mockConsoleError.mockRestore()
  })

  it('renders error message', () => {
    render(<GlobalError error={mockError} reset={mockReset} />)
    
    expect(screen.getByText('Application Error')).toBeInTheDocument()
    expect(screen.getByText('Something unexpected happened and we couldn\'t load the application.')).toBeInTheDocument()
    expect(screen.getByText('Test error message')).toBeInTheDocument()
  })

  it('renders error digest when provided', () => {
    const errorWithDigest = Object.assign(mockError, { digest: 'error-digest-123' })
    
    render(<GlobalError error={errorWithDigest} reset={mockReset} />)
    
    expect(screen.getByText('error-digest-123')).toBeInTheDocument()
    expect(screen.getByText('Error ID:')).toBeInTheDocument()
  })

  it('does not render error digest when not provided', () => {
    render(<GlobalError error={mockError} reset={mockReset} />)
    
    expect(screen.queryByText('Error ID:')).not.toBeInTheDocument()
  })

  it('calls reset function when Try again button is clicked', () => {
    render(<GlobalError error={mockError} reset={mockReset} />)
    
    const tryAgainButton = screen.getByText('Try again')
    fireEvent.click(tryAgainButton)
    
    expect(mockReset).toHaveBeenCalledTimes(1)
  })

  it('navigates to home when Go to Home button is clicked', () => {
    render(<GlobalError error={mockError} reset={mockReset} />)
    
    const goHomeButton = screen.getByText('Go to Home')
    fireEvent.click(goHomeButton)
    
    expect(mockLocation.href).toBe('/')
  })

  it('displays fallback message when error has no message', () => {
    const errorWithoutMessage = new Error('')
    
    render(<GlobalError error={errorWithoutMessage} reset={mockReset} />)
    
    expect(screen.getByText('An unexpected error occurred.')).toBeInTheDocument()
  })

  it('logs error to console on mount', () => {
    render(<GlobalError error={mockError} reset={mockReset} />)
    
    expect(mockConsoleError).toHaveBeenCalledWith('Global application error:', mockError)
  })

  it('renders with proper HTML structure', () => {
    render(<GlobalError error={mockError} reset={mockReset} />)
    
    // Check for essential elements
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /go to home/i })).toBeInTheDocument()
    
    // Check for icons
    expect(document.querySelector('.lucide-alert-triangle')).toBeInTheDocument()
    expect(document.querySelector('.lucide-refresh-cw')).toBeInTheDocument()
    expect(document.querySelector('.lucide-home')).toBeInTheDocument()
  })

  it('includes support guidance text', () => {
    render(<GlobalError error={mockError} reset={mockReset} />)
    
    expect(screen.getByText('Please try refreshing the page. If the problem persists, contact support.')).toBeInTheDocument()
  })
})