import { render, screen, waitFor, fireEvent } from '@/test-utils'
import DashboardPage from '../page'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/auth-context'
import { format } from 'date-fns'

jest.mock('@/lib/supabase')
jest.mock('@/context/auth-context')

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

    // Mock Supabase queries
    const mockFrom = jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockMacroGoal, error: null }),
      order: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
    }))
    
    mockSupabase.from = mockFrom
  })

  it('renders dashboard with loading state initially', () => {
    render(<DashboardPage />)
    
    expect(screen.getByText(/Daily Summary/i)).toBeInTheDocument()
    expect(screen.getByText(/recent entries/i)).toBeInTheDocument()
  })

  it('displays macro goals correctly', async () => {
    const mockFrom = jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockMacroGoal, error: null }),
      order: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
    }))
    
    mockSupabase.from = mockFrom

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText(/2000/)).toBeInTheDocument() // Calories goal
      expect(screen.getByText(/150g/)).toBeInTheDocument() // Protein goal
      expect(screen.getByText(/200g/)).toBeInTheDocument() // Carbs goal
      expect(screen.getByText(/70g/)).toBeInTheDocument() // Fat goal
    })
  })

  it('displays food entries for selected date', async () => {
    const mockFrom = jest.fn((table) => {
      if (table === 'macro_goals') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: mockMacroGoal, error: null }),
        }
      }
      if (table === 'food_entries') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          gte: jest.fn().mockReturnThis(),
          lte: jest.fn().mockResolvedValue({ data: mockFoodEntries, error: null }),
        }
      }
    })
    
    mockSupabase.from = mockFrom

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Chicken Breast')).toBeInTheDocument()
      expect(screen.getByText('Brown Rice')).toBeInTheDocument()
      expect(screen.getByText('165 cal')).toBeInTheDocument()
      expect(screen.getByText('216 cal')).toBeInTheDocument()
    })
  })

  it('calculates and displays totals correctly', async () => {
    const mockFrom = jest.fn((table) => {
      if (table === 'macro_goals') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: mockMacroGoal, error: null }),
        }
      }
      if (table === 'food_entries') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          gte: jest.fn().mockReturnThis(),
          lte: jest.fn().mockResolvedValue({ data: mockFoodEntries, error: null }),
        }
      }
    })
    
    mockSupabase.from = mockFrom

    render(<DashboardPage />)

    await waitFor(() => {
      // Total calories: 165 + 216 = 381
      expect(screen.getByText(/381.*\/.*2000/)).toBeInTheDocument()
      // Total protein: 31 + 5 = 36
      expect(screen.getByText(/36g.*\/.*150g/)).toBeInTheDocument()
      // Total carbs: 0 + 45 = 45
      expect(screen.getByText(/45g.*\/.*200g/)).toBeInTheDocument()
      // Total fat: 3.6 + 2 = 5.6
      expect(screen.getByText(/5\.6g.*\/.*70g/)).toBeInTheDocument()
    })
  })

  it('handles delete food entry', async () => {
    const mockDelete = jest.fn().mockResolvedValue({ error: null })
    const mockFrom = jest.fn((table) => {
      if (table === 'macro_goals') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: mockMacroGoal, error: null }),
        }
      }
      if (table === 'food_entries') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          gte: jest.fn().mockReturnThis(),
          lte: jest.fn().mockResolvedValue({ data: mockFoodEntries, error: null }),
          delete: jest.fn().mockReturnThis(),
        }
      }
    })
    
    mockSupabase.from = mockFrom

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Chicken Breast')).toBeInTheDocument()
    })

    // Find and click delete button for first food entry
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
    fireEvent.click(deleteButtons[0])

    // Confirm deletion in alert dialog
    await waitFor(() => {
      expect(screen.getByText(/are you sure/i)).toBeInTheDocument()
    })
    
    const confirmButton = screen.getByRole('button', { name: /continue/i })
    fireEvent.click(confirmButton)

    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalledWith('food_entries')
    })
  })

  it('handles date navigation', async () => {
    render(<DashboardPage />)

    // Find and click calendar button
    const calendarButton = screen.getByRole('button', { name: /pick a date/i })
    fireEvent.click(calendarButton)

    await waitFor(() => {
      // Calendar should be visible
      expect(screen.getByRole('grid')).toBeInTheDocument()
    })
  })

  it('displays empty state when no goals set', async () => {
    const mockFrom = jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      order: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
    }))
    
    mockSupabase.from = mockFrom

    render(<DashboardPage />)

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
    }))
    
    mockSupabase.from = mockFrom

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument()
    })
  })

  it('shows loading state when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: true,
    })

    render(<DashboardPage />)

    expect(screen.getByText(/Daily Summary/i)).toBeInTheDocument()
  })
})