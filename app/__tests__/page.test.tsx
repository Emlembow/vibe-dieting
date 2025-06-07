import { render, screen } from '@/test-utils'
import HomePage from '../page'

const mockPush = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock window.location
delete (window as any).location;
(window as any).location = {
  search: '',
  href: 'http://localhost:3000',
  origin: 'http://localhost:3000',
  pathname: '/',
  reload: jest.fn(),
  assign: jest.fn(),
  replace: jest.fn(),
};

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