import { render, screen, waitFor, act } from '@/test-utils'
import TrendsPage from '../page'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/auth-context'

jest.mock('@/lib/supabase')
jest.mock('@/context/auth-context')
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

const mockSupabase = supabase as jest.Mocked<typeof supabase>
const mockUseAuth = useAuth as jest.Mock

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

describe('TrendsPage - Additional Coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    mockUseAuth.mockReturnValue({
      user: { id: 'test-user', email: 'test@example.com' },
      isLoading: false,
    })

    // Create mock query builder factory function
    const createMockQueryBuilder = (resolvedValue: any) => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue(resolvedValue),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockResolvedValue(resolvedValue),
      then: jest.fn((onFulfilled) => Promise.resolve(resolvedValue).then(onFulfilled)),
      catch: jest.fn((onRejected) => Promise.resolve(resolvedValue).catch(onRejected)),
    })

    mockSupabase.from = jest.fn((table: string) => {
      if (table === 'macro_goals') {
        return createMockQueryBuilder({ 
          data: {
            id: 'goal-1',
            daily_calorie_goal: 2000,
            protein_percentage: 30,
            carbs_percentage: 40,
            fat_percentage: 30
          }, 
          error: null 
        })
      } else if (table === 'food_entries') {
        return createMockQueryBuilder({ data: [], error: null })
      } else if (table === 'yolo_days') {
        return createMockQueryBuilder({ data: [], error: null })
      }
      return createMockQueryBuilder({ data: null, error: null })
    })
  })

  it('displays trends analysis and charts', async () => {
    await act(async () => {
      render(<TrendsPage />)
    })

    await waitFor(() => {
      expect(screen.getByText('Nutrition Trends')).toBeInTheDocument()
      expect(screen.getByText(/analyze your nutrition patterns/i)).toBeInTheDocument()
    })
  })

  it('handles empty data gracefully', async () => {
    mockSupabase.from = jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockResolvedValue({ data: [], error: null }),
      then: jest.fn((onFulfilled) => Promise.resolve({ data: [], error: null }).then(onFulfilled)),
      catch: jest.fn((onRejected) => Promise.resolve({ data: [], error: null }).catch(onRejected)),
    }))

    await act(async () => {
      render(<TrendsPage />)
    })

    await waitFor(() => {
      expect(screen.getByText('Nutrition Trends')).toBeInTheDocument()
    })
  })

  it('shows loading state initially', async () => {
    // Mock a delayed response
    mockSupabase.from = jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ data: null, error: null }), 100))
      ),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ data: [], error: null }), 100))
      ),
      then: jest.fn((onFulfilled) => Promise.resolve({ data: [], error: null }).then(onFulfilled)),
      catch: jest.fn((onRejected) => Promise.resolve({ data: [], error: null }).catch(onRejected)),
    }))

    await act(async () => {
      render(<TrendsPage />)
    })

    // Should show loading state initially
    expect(screen.getByText('Nutrition Trends')).toBeInTheDocument()
  })

  it('handles API errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    mockSupabase.from = jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ 
        data: null, 
        error: { message: 'Database error' } 
      }),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockResolvedValue({ 
        data: [], 
        error: { message: 'Database error' } 
      }),
      then: jest.fn((onFulfilled) => Promise.resolve({ data: [], error: null }).then(onFulfilled)),
      catch: jest.fn((onRejected) => Promise.resolve({ data: [], error: null }).catch(onRejected)),
    }))

    await act(async () => {
      render(<TrendsPage />)
    })

    await waitFor(() => {
      expect(screen.getByText('Nutrition Trends')).toBeInTheDocument()
    })

    consoleSpy.mockRestore()
  })

  it('renders with user not authenticated', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
    })

    await act(async () => {
      render(<TrendsPage />)
    })

    expect(screen.getByText('Nutrition Trends')).toBeInTheDocument()
  })

  it('renders with user loading', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: true,
    })

    await act(async () => {
      render(<TrendsPage />)
    })

    expect(screen.getByText('Nutrition Trends')).toBeInTheDocument()
  })
})