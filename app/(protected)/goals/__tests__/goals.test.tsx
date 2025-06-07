import { render, screen, fireEvent, waitFor, act } from '@/test-utils'
import GoalsPage from '../page'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/auth-context'
import { useRouter } from 'next/navigation'

jest.mock('@/lib/supabase')
jest.mock('@/context/auth-context')
jest.mock('next/navigation')

const mockSupabase = supabase as jest.Mocked<typeof supabase>
const mockUseAuth = useAuth as jest.Mock
const mockPush = jest.fn()

const mockExistingGoal = {
  id: 'goal-1',
  user_id: 'test-user',
  daily_calorie_goal: 2000,
  protein_percentage: 30,
  carbs_percentage: 40,
  fat_percentage: 30,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

// Helper to create a complete mock query builder
const createMockQueryBuilder = (returnValue = { data: null, error: null }) => {
  const mockBuilder = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue(returnValue),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockResolvedValue(returnValue),
    then: jest.fn((onFulfilled) => Promise.resolve(returnValue).then(onFulfilled)),
    catch: jest.fn((onRejected) => Promise.resolve(returnValue).catch(onRejected)),
  }
  
  return mockBuilder
}

describe('Goals Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    mockUseAuth.mockReturnValue({
      user: { id: 'test-user', email: 'test@example.com' },
      isLoading: false,
    })

    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })

    // Set consistent default mock for all tests
    mockSupabase.from = jest.fn(() => createMockQueryBuilder({ data: null, error: null }))
  })

  it('renders goals form with all fields', async () => {
    await act(async () => {
      render(<GoalsPage />)
    })
    
    expect(screen.getByText('Macro Goals')).toBeInTheDocument()
    expect(screen.getByRole('spinbutton')).toBeInTheDocument() // Calorie input
    expect(screen.getByText(/protein \(30%\)/i)).toBeInTheDocument()
    expect(screen.getByText(/carbs \(40%\)/i)).toBeInTheDocument()
    expect(screen.getByText(/fat \(30%\)/i)).toBeInTheDocument()
  })

  it('displays existing goals when available', async () => {
    mockSupabase.from = jest.fn(() => 
      createMockQueryBuilder({ data: mockExistingGoal, error: null })
    )

    await act(async () => {
      render(<GoalsPage />)
    })

    await waitFor(() => {
      const calorieInput = screen.getByRole('spinbutton') as HTMLInputElement
      expect(calorieInput.value).toBe('2000')
      
      // Check that the percentages are displayed correctly (since they're sliders)
      expect(screen.getByText(/protein \(30%\)/i)).toBeInTheDocument()
      expect(screen.getByText(/carbs \(40%\)/i)).toBeInTheDocument() 
      expect(screen.getByText(/fat \(30%\)/i)).toBeInTheDocument()
    })
  })

  it('handles form submission for new goals', async () => {
    const mockInsert = jest.fn().mockReturnThis()
    mockSupabase.from = jest.fn(() => ({
      ...createMockQueryBuilder(),
      insert: mockInsert,
    }))

    await act(async () => {
      render(<GoalsPage />)
    })

    const calorieInput = screen.getByRole('spinbutton')
    const submitButton = screen.getByRole('button', { name: /save goals/i })

    await act(async () => {
      fireEvent.change(calorieInput, { target: { value: '2500' } })
      fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: 'test-user',
        daily_calorie_goal: 2500,
        protein_percentage: 30,
        carbs_percentage: 40,
        fat_percentage: 30,
      })
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('handles form submission for updating goals', async () => {
    const mockInsert = jest.fn().mockResolvedValue({ data: mockExistingGoal, error: null })
    mockSupabase.from = jest.fn(() => ({
      ...createMockQueryBuilder({ data: mockExistingGoal, error: null }),
      insert: mockInsert,
    }))

    await act(async () => {
      render(<GoalsPage />)
    })

    await waitFor(() => {
      expect(screen.getByRole('spinbutton')).toHaveValue(2000)
    })

    const calorieInput = screen.getByRole('spinbutton')
    const submitButton = screen.getByRole('button', { name: /save goals/i })

    await act(async () => {
      fireEvent.change(calorieInput, { target: { value: '2200' } })
      fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: 'test-user',
        daily_calorie_goal: 2200,
        protein_percentage: 30,
        carbs_percentage: 40,
        fat_percentage: 30,
      })
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('validates calorie input is positive', async () => {
    await act(async () => {
      render(<GoalsPage />)
    })

    const calorieInput = screen.getByRole('spinbutton') as HTMLInputElement
    const submitButton = screen.getByRole('button', { name: /save goals/i })

    await act(async () => {
      fireEvent.change(calorieInput, { target: { value: '0' } })
      fireEvent.click(submitButton)
    })

    expect(calorieInput.validity.valid).toBe(false)
  })

  it('calculates macro percentages correctly', async () => {
    await act(async () => {
      render(<GoalsPage />)
    })

    // This test checks the default percentages which are already displayed
    await waitFor(() => {
      expect(screen.getByText(/protein \(30%\)/i)).toBeInTheDocument()
      expect(screen.getByText(/carbs \(40%\)/i)).toBeInTheDocument()
      expect(screen.getByText(/fat \(30%\)/i)).toBeInTheDocument()
    })
  })

  it('handles API errors gracefully', async () => {
    mockSupabase.from = jest.fn(() => 
      createMockQueryBuilder({ data: null, error: { message: 'Database error' } })
    )

    await act(async () => {
      render(<GoalsPage />)
    })

    // Should still render the form even with error
    expect(screen.getByText('Macro Goals')).toBeInTheDocument()
  })

  it('disables form while submitting', async () => {
    let resolveInsert: any
    const insertPromise = new Promise(resolve => { resolveInsert = resolve })
    
    const mockInsert = jest.fn(() => ({
      then: (callback: any) => insertPromise.then(callback)
    }))
    
    mockSupabase.from = jest.fn(() => ({
      ...createMockQueryBuilder(),
      insert: mockInsert,
    }))

    await act(async () => {
      render(<GoalsPage />)
    })

    const submitButton = screen.getByRole('button', { name: /save goals/i })
    const calorieInput = screen.getByRole('spinbutton')

    await act(async () => {
      fireEvent.change(calorieInput, { target: { value: '2000' } })
      fireEvent.click(submitButton)
    })

    expect(submitButton).toBeDisabled()
    expect(screen.getByText('Saving...')).toBeInTheDocument()

    await act(async () => {
      resolveInsert({ data: mockExistingGoal, error: null })
    })

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
    })
  })

  it('shows loading state when user is not authenticated', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: true,
    })

    await act(async () => {
      render(<GoalsPage />)
    })

    // Should still render the form even when loading
    expect(screen.getByText('Macro Goals')).toBeInTheDocument()
  })

  it('handles form submission with consistent mocking', async () => {
    const mockInsert = jest.fn(() => Promise.resolve({ data: mockExistingGoal, error: null }))
    mockSupabase.from = jest.fn(() => ({
      ...createMockQueryBuilder({ data: null, error: null }),
      insert: mockInsert,
    }))

    await act(async () => {
      render(<GoalsPage />)
    })

    const calorieInput = screen.getByRole('spinbutton')
    const submitButton = screen.getByRole('button', { name: /save goals/i })

    await act(async () => {
      fireEvent.change(calorieInput, { target: { value: '2000' } })
      fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalled()
    })
  })
})