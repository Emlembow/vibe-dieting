import { render, screen, waitFor, fireEvent, act } from '@/test-utils'
import DashboardPage from '../page'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/auth-context'
import { format } from 'date-fns'

jest.mock('@/lib/supabase')
jest.mock('@/context/auth-context')
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

const mockSupabase = supabase as jest.Mocked<typeof supabase>
const mockUseAuth = useAuth as jest.Mock

// Mock data
const mockMacroGoal = {
  id: 'goal-1',
  user_id: 'test-user',
  calories: 2000,
  protein: 150,
  carbs: 200,
  fat: 70,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

const mockFoodEntries = [
  {
    id: 'food-1',
    user_id: 'test-user',
    food_name: 'Chicken Breast',
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    quantity: 1,
    unit: 'serving',
    date: new Date().toISOString().split('T')[0], // Add date field for weekly data processing
    protein_grams: 31,
    carbs_total_grams: 0,
    fat_total_grams: 3.6,
    consumed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'food-2',
    user_id: 'test-user',
    food_name: 'Brown Rice',
    calories: 216,
    protein: 5,
    carbs: 45,
    fat: 2,
    quantity: 1,
    unit: 'cup',
    date: new Date().toISOString().split('T')[0], // Add date field for weekly data processing
    protein_grams: 5,
    carbs_total_grams: 45,
    fat_total_grams: 2,
    consumed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

describe('Dashboard Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock auth context
    mockUseAuth.mockReturnValue({
      user: { id: 'test-user', email: 'test@example.com' },
      isLoading: false,
    })

    // Default mock for Supabase - use the global mock and just set resolved values
    const defaultMockQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      order: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      then: jest.fn((onFulfilled) => Promise.resolve({ data: null, error: null }).then(onFulfilled)),
      catch: jest.fn((onRejected) => Promise.resolve({ data: null, error: null }).catch(onRejected)),
    }

    const mockFrom = jest.fn((table: string) => {
      const mockQuery = { ...defaultMockQueryBuilder }

      if (table === 'macro_goals') {
        mockQuery.single = jest.fn().mockResolvedValue({ data: mockMacroGoal, error: null })
        mockQuery.then = jest.fn((onFulfilled) => Promise.resolve({ data: mockMacroGoal, error: null }).then(onFulfilled))
      } else if (table === 'food_entries') {
        mockQuery.lte = jest.fn().mockResolvedValue({ data: mockFoodEntries, error: null })
        mockQuery.then = jest.fn((onFulfilled) => Promise.resolve({ data: mockFoodEntries, error: null }).then(onFulfilled))
      } else if (table === 'yolo_days') {
        mockQuery.lte = jest.fn().mockResolvedValue({ data: [], error: null })
        mockQuery.then = jest.fn((onFulfilled) => Promise.resolve({ data: [], error: null }).then(onFulfilled))
      } else if (table === 'daily_nutrient_totals') {
        mockQuery.lte = jest.fn().mockResolvedValue({ data: [], error: null })
        mockQuery.then = jest.fn((onFulfilled) => Promise.resolve({ data: [], error: null }).then(onFulfilled))
      }

      return mockQuery
    })
    
    mockSupabase.from = mockFrom
  })

  it('renders dashboard with loading state initially', async () => {
    await act(async () => {
      render(<DashboardPage />)
    })
    
    expect(screen.getByText(/Daily Summary/i)).toBeInTheDocument()
    expect(screen.getByText(/Today's Food Log/i)).toBeInTheDocument()
  })

  it('displays macro goals correctly', async () => {
    await act(async () => {
      render(<DashboardPage />)
    })

    await waitFor(() => {
      expect(screen.getByText(/2000/)).toBeInTheDocument() // Calories goal
      expect(screen.getByText(/150g/)).toBeInTheDocument() // Protein goal
      expect(screen.getByText(/200g/)).toBeInTheDocument() // Carbs goal
      expect(screen.getByText(/70g/)).toBeInTheDocument() // Fat goal
    })
  })

  it('displays food entries for selected date', async () => {
    await act(async () => {
      render(<DashboardPage />)
    })

    await waitFor(() => {
      expect(screen.getByText('Chicken Breast')).toBeInTheDocument()
      expect(screen.getByText('Brown Rice')).toBeInTheDocument()
      expect(screen.getByText('165 cal')).toBeInTheDocument()
      expect(screen.getByText('216 cal')).toBeInTheDocument()
    })
  })

  it('calculates and displays totals correctly', async () => {
    await act(async () => {
      render(<DashboardPage />)
    })

    await waitFor(() => {
      // Total calories: 165 + 216 = 381
      expect(screen.getByText(/381/)).toBeInTheDocument()
      // Total protein: 31 + 5 = 36
      expect(screen.getByText(/36/)).toBeInTheDocument()
      // Total carbs: 0 + 45 = 45
      expect(screen.getByText(/45/)).toBeInTheDocument()
      // Total fat: 3.6 + 2 = 5.6 ≈ 6
      expect(screen.getByText(/6/)).toBeInTheDocument()
    })
  })

  it('handles delete food entry', async () => {
    const mockDelete = jest.fn().mockResolvedValue({ error: null })
    const mockFrom = jest.fn((table: string) => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
        order: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        then: jest.fn((onFulfilled) => Promise.resolve({ data: null, error: null }).then(onFulfilled)),
        catch: jest.fn((onRejected) => Promise.resolve({ data: null, error: null }).catch(onRejected)),
      }

      if (table === 'macro_goals') {
        mockQuery.single = jest.fn().mockResolvedValue({ data: mockMacroGoal, error: null })
        mockQuery.then = jest.fn((onFulfilled) => Promise.resolve({ data: mockMacroGoal, error: null }).then(onFulfilled))
      } else if (table === 'food_entries') {
        mockQuery.lte = jest.fn().mockResolvedValue({ data: mockFoodEntries, error: null })
        mockQuery.delete = mockDelete
        mockQuery.then = jest.fn((onFulfilled) => Promise.resolve({ data: mockFoodEntries, error: null }).then(onFulfilled))
      } else if (table === 'yolo_days') {
        mockQuery.lte = jest.fn().mockResolvedValue({ data: [], error: null })
        mockQuery.then = jest.fn((onFulfilled) => Promise.resolve({ data: [], error: null }).then(onFulfilled))
      } else if (table === 'daily_nutrient_totals') {
        mockQuery.lte = jest.fn().mockResolvedValue({ data: [], error: null })
        mockQuery.then = jest.fn((onFulfilled) => Promise.resolve({ data: [], error: null }).then(onFulfilled))
      }

      return mockQuery
    })
    
    mockSupabase.from = mockFrom

    await act(async () => {
      render(<DashboardPage />)
    })

    await waitFor(() => {
      expect(screen.getByText('Chicken Breast')).toBeInTheDocument()
    })

    // Find and click delete button for first food entry
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
    
    await act(async () => {
      fireEvent.click(deleteButtons[0])
    })

    // Confirm deletion in alert dialog
    await waitFor(() => {
      expect(screen.getByText(/are you sure/i)).toBeInTheDocument()
    })
    
    const confirmButton = screen.getByRole('button', { name: /continue/i })
    
    await act(async () => {
      fireEvent.click(confirmButton)
    })

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalled()
    })
  })

  it('handles date navigation', async () => {
    await act(async () => {
      render(<DashboardPage />)
    })

    // Find and click calendar button
    const calendarButton = screen.getByRole('button', { name: /pick a date/i })
    
    await act(async () => {
      fireEvent.click(calendarButton)
    })

    await waitFor(() => {
      // Calendar should be visible
      expect(screen.getByRole('grid')).toBeInTheDocument()
    })
  })

  it('displays empty state when no goals set', async () => {
    const mockFrom = jest.fn((table: string) => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
        order: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        then: jest.fn((onFulfilled) => Promise.resolve({ data: null, error: null }).then(onFulfilled)),
        catch: jest.fn((onRejected) => Promise.resolve({ data: null, error: null }).catch(onRejected)),
      }

      if (table === 'food_entries') {
        mockQuery.lte = jest.fn().mockResolvedValue({ data: [], error: null })
        mockQuery.then = jest.fn((onFulfilled) => Promise.resolve({ data: [], error: null }).then(onFulfilled))
      } else if (table === 'yolo_days') {
        mockQuery.lte = jest.fn().mockResolvedValue({ data: [], error: null })
        mockQuery.then = jest.fn((onFulfilled) => Promise.resolve({ data: [], error: null }).then(onFulfilled))
      } else if (table === 'daily_nutrient_totals') {
        mockQuery.lte = jest.fn().mockResolvedValue({ data: [], error: null })
        mockQuery.then = jest.fn((onFulfilled) => Promise.resolve({ data: [], error: null }).then(onFulfilled))
      }

      return mockQuery
    })
    
    mockSupabase.from = mockFrom

    await act(async () => {
      render(<DashboardPage />)
    })

    await waitFor(() => {
      expect(screen.getByText(/set your macro goals/i)).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /set goals/i })).toHaveAttribute('href', '/goals')
    })
  })

  it('handles API errors gracefully', async () => {
    const mockFrom = jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ 
        data: null, 
        error: { message: 'Database error' } 
      }),
      order: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      then: jest.fn((onFulfilled) => Promise.resolve({ data: null, error: { message: 'Database error' } }).then(onFulfilled)),
      catch: jest.fn((onRejected) => Promise.resolve({ data: null, error: { message: 'Database error' } }).catch(onRejected)),
    }))
    
    mockSupabase.from = mockFrom

    await act(async () => {
      render(<DashboardPage />)
    })

    await waitFor(() => {
      expect(screen.getByText(/set your macro goals/i)).toBeInTheDocument()
    })
  })

  it('shows loading state when user is not authenticated', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: true,
    })

    await act(async () => {
      render(<DashboardPage />)
    })

    // Should still render the dashboard structure
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('renders loading state when data is fetching', async () => {
    mockUseAuth.mockReturnValue({ 
      user: { id: 'test-user', email: 'test@example.com' }, 
      isLoading: false 
    })

    await act(async () => {
      render(<DashboardPage />)
    })

    // Should render the main dashboard content
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText(/Today's Food Log/i)).toBeInTheDocument()
  })
})