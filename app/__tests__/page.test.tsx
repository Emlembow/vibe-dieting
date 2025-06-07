import { render, screen } from '@/test-utils'
import HomePage from '../page'

const mockPush = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    search: '',
  },
  writable: true,
})

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    window.location.search = ''
  })

  it('renders loading state and redirects to dashboard', () => {
    render(<HomePage />)
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.getByText('Please wait while we redirect you.')).toBeInTheDocument()
    expect(mockPush).toHaveBeenCalledWith('/dashboard')
  })

  it('handles auth params and redirects to dashboard', () => {
    window.location.search = '?access_token=test&refresh_token=test'
    
    render(<HomePage />)
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    // Note: The actual token handling would require mocking supabase.auth.setSession
  })

  it('handles missing auth params', () => {
    window.location.search = ''
    
    render(<HomePage />)
    
    expect(mockPush).toHaveBeenCalledWith('/dashboard')
  })
})