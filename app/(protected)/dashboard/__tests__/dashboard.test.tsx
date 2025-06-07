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

    // Create mock query builder factory function
    const createMockQueryBuilder = (resolvedValue: any, singleResolvedValue?: any) => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue(singleResolvedValue || resolvedValue),
      order: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockResolvedValue(resolvedValue),
      limit: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      then: jest.fn((onFulfilled) => Promise.resolve(resolvedValue).then(onFulfilled)),
      catch: jest.fn((onRejected) => Promise.resolve(resolvedValue).catch(onRejected)),
    })

    const mockFrom = jest.fn((table: string) => {
      if (table === 'macro_goals') {
        return createMockQueryBuilder({ data: mockMacroGoal, error: null })
      } else if (table === 'food_entries') {
        return createMockQueryBuilder({ data: mockFoodEntries, error: null })
      } else if (table === 'yolo_days') {
        // For YOLO days, single() should return an error when no record found (normal case)
        return createMockQueryBuilder(
          { data: [], error: null }, 
          { data: null, error: { code: "PGRST116", message: "Row not found" } }
        )
      } else if (table === 'daily_nutrient_totals') {
        return createMockQueryBuilder({ data: [], error: null })
      }
      
      return createMockQueryBuilder({ data: null, error: null })
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

  it.skip('displays macro goals correctly', async () => {
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

  it.skip('displays food entries for selected date', async () => {
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

  it.skip('calculates and displays totals correctly', async () => {
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

  it.skip('handles delete food entry', async () => {
    const mockDelete = jest.fn().mockResolvedValue({ error: null })
    
    const createMockQueryBuilder = (resolvedValue: any, customDelete?: any) => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue(resolvedValue),
      order: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockResolvedValue(resolvedValue),
      limit: jest.fn().mockReturnThis(),
      delete: customDelete || jest.fn().mockReturnThis(),
      then: jest.fn((onFulfilled) => Promise.resolve(resolvedValue).then(onFulfilled)),
      catch: jest.fn((onRejected) => Promise.resolve(resolvedValue).catch(onRejected)),
    })

    const mockFrom = jest.fn((table: string) => {
      if (table === 'macro_goals') {
        return createMockQueryBuilder({ data: mockMacroGoal, error: null })
      } else if (table === 'food_entries') {
        return createMockQueryBuilder({ data: mockFoodEntries, error: null }, mockDelete)
      } else if (table === 'yolo_days') {
        return createMockQueryBuilder({ data: [], error: null })
      } else if (table === 'daily_nutrient_totals') {
        return createMockQueryBuilder({ data: [], error: null })
      }
      
      return createMockQueryBuilder({ data: null, error: null })
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

  it.skip('handles date navigation', async () => {
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

  it.skip('displays empty state when no goals set', async () => {
    const createMockQueryBuilder = (resolvedValue: any) => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue(resolvedValue),
      order: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockResolvedValue(resolvedValue),
      limit: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      then: jest.fn((onFulfilled) => Promise.resolve(resolvedValue).then(onFulfilled)),
      catch: jest.fn((onRejected) => Promise.resolve(resolvedValue).catch(onRejected)),
    })

    const mockFrom = jest.fn((table: string) => {
      if (table === 'macro_goals') {
        return createMockQueryBuilder({ data: null, error: null }) // No goals
      } else if (table === 'food_entries') {
        return createMockQueryBuilder({ data: [], error: null })
      } else if (table === 'yolo_days') {
        return createMockQueryBuilder({ data: [], error: null })
      } else if (table === 'daily_nutrient_totals') {
        return createMockQueryBuilder({ data: [], error: null })
      }
      
      return createMockQueryBuilder({ data: null, error: null })
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

  it.skip('handles API errors gracefully', async () => {
    const createMockQueryBuilder = (resolvedValue: any) => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue(resolvedValue),
      order: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockResolvedValue(resolvedValue),
      limit: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      then: jest.fn((onFulfilled) => Promise.resolve(resolvedValue).then(onFulfilled)),
      catch: jest.fn((onRejected) => Promise.resolve(resolvedValue).catch(onRejected)),
    })

    const mockFrom = jest.fn(() => 
      createMockQueryBuilder({ data: null, error: { message: 'Database error' } })
    )
    
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