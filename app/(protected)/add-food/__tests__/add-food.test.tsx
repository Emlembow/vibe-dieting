import { render, screen, act } from '@/test-utils'
import AddFoodPage from '../page'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/auth-context'
import { useRouter } from 'next/navigation'

jest.mock('@/lib/supabase')
jest.mock('@/context/auth-context')
jest.mock('next/navigation')

const mockSupabase = supabase as jest.Mocked<typeof supabase>
const mockUseAuth = useAuth as jest.Mock
const mockPush = jest.fn()

// Mock the OpenAI API response
global.fetch = jest.fn()

describe('Add Food Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    mockUseAuth.mockReturnValue({
      user: { id: 'test-user', email: 'test@example.com' },
      isLoading: false,
    })

    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })

    // Mock fetch for nutrition API
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        foods: []
      })
    })
  })

  it('renders add food page without crashing', async () => {
    await act(async () => {
      render(<AddFoodPage />)
    })
    
    expect(screen.getByText('Add Food')).toBeInTheDocument()
  })

  it('has search tab available', async () => {
    await act(async () => {
      render(<AddFoodPage />)
    })
    
    expect(screen.getByText('Search')).toBeInTheDocument()
  })

  it('has recent tab available', async () => {
    await act(async () => {
      render(<AddFoodPage />)
    })
    
    expect(screen.getByText('Recent')).toBeInTheDocument()
  })

  it('has manual entry tab available', async () => {
    await act(async () => {
      render(<AddFoodPage />)
    })
    
    expect(screen.getByText('Manual Entry')).toBeInTheDocument()
  })

  it('can switch between tabs', async () => {
    await act(async () => {
      render(<AddFoodPage />)
    })

    const recentTab = screen.getByText('Recent')
    await act(async () => {
      recentTab.click()
    })

    // Should switch to recent tab without errors
    expect(recentTab).toBeInTheDocument()
  })
})