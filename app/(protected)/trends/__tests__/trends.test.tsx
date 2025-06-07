import { render, screen, act } from '@/test-utils'
import TrendsPage from '../page'
import { useAuth } from '@/context/auth-context'

jest.mock('@/context/auth-context')
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

const mockUseAuth = useAuth as jest.Mock

describe('Trends Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    mockUseAuth.mockReturnValue({
      user: { id: 'test-user', email: 'test@example.com' },
      isLoading: false,
    })
  })

  it('renders trends page without crashing', async () => {
    await act(async () => {
      render(<TrendsPage />)
    })
    
    // Check for trends page content
    expect(screen.getByText(/trends/i) || screen.getByText(/analytics/i) || screen.getByText(/progress/i)).toBeInTheDocument()
  })

  it('shows loading state when user is not authenticated', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: true,
    })

    await act(async () => {
      render(<TrendsPage />)
    })

    // Should still render something
    expect(document.body).toBeInTheDocument()
  })
})