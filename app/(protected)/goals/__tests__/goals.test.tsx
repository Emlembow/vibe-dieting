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
  calories: 2000,
  protein: 150,
  carbs: 200,
  fat: 70,
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
    order: jest.fn(() => Promise.resolve(returnValue)),
    limit: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
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
    
    expect(screen.getByText('Set Your Macro Goals')).toBeInTheDocument()
    expect(screen.getByLabelText(/daily calorie target/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/protein target/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/carbohydrate target/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/fat target/i)).toBeInTheDocument()
  })

  it('displays existing goals when available', async () => {
    mockSupabase.from = jest.fn(() => 
      createMockQueryBuilder({ data: [mockExistingGoal], error: null })
    )

    await act(async () => {
      render(<GoalsPage />)
    })

    await waitFor(() => {
      const calorieInput = screen.getByLabelText(/daily calorie target/i) as HTMLInputElement
      const proteinInput = screen.getByLabelText(/protein target/i) as HTMLInputElement
      const carbsInput = screen.getByLabelText(/carbohydrate target/i) as HTMLInputElement
      const fatInput = screen.getByLabelText(/fat target/i) as HTMLInputElement

      expect(calorieInput.value).toBe('2000')
      expect(proteinInput.value).toBe('150')
      expect(carbsInput.value).toBe('200')
      expect(fatInput.value).toBe('70')
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

    const calorieInput = screen.getByLabelText(/daily calorie target/i)
    const proteinInput = screen.getByLabelText(/protein target/i)
    const carbsInput = screen.getByLabelText(/carbohydrate target/i)
    const fatInput = screen.getByLabelText(/fat target/i)
    const submitButton = screen.getByRole('button', { name: /save goals/i })

    await act(async () => {
      fireEvent.change(calorieInput, { target: { value: '2500' } })
      fireEvent.change(proteinInput, { target: { value: '180' } })
      fireEvent.change(carbsInput, { target: { value: '250' } })
      fireEvent.change(fatInput, { target: { value: '80' } })
      fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: 'test-user',
        calories: 2500,
        protein: 180,
        carbs: 250,
        fat: 80,
      })
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('handles form submission for updating goals', async () => {
    const mockUpdate = jest.fn().mockReturnThis()
    mockSupabase.from = jest.fn((table) => {
      if (table === 'macro_goals') {
        const builder = createMockQueryBuilder({ data: [mockExistingGoal], error: null })
        builder.update = mockUpdate
        return builder
      }
      return createMockQueryBuilder()
    })

    await act(async () => {
      render(<GoalsPage />)
    })

    await waitFor(() => {
      expect(screen.getByDisplayValue('2000')).toBeInTheDocument()
    })

    const calorieInput = screen.getByLabelText(/daily calorie target/i)
    const submitButton = screen.getByRole('button', { name: /update goals/i })

    await act(async () => {
      fireEvent.change(calorieInput, { target: { value: '2200' } })
      fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith({
        calories: 2200,
        protein: 150,
        carbs: 200,
        fat: 70,
      })
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('validates calorie input is positive', async () => {
    await act(async () => {
      render(<GoalsPage />)
    })

    const calorieInput = screen.getByLabelText(/daily calorie target/i) as HTMLInputElement
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

    const calorieInput = screen.getByLabelText(/daily calorie target/i)
    const proteinInput = screen.getByLabelText(/protein target/i)
    const carbsInput = screen.getByLabelText(/carbohydrate target/i)
    const fatInput = screen.getByLabelText(/fat target/i)

    await act(async () => {
      fireEvent.change(calorieInput, { target: { value: '2000' } })
      fireEvent.change(proteinInput, { target: { value: '150' } })
      fireEvent.change(carbsInput, { target: { value: '200' } })
      fireEvent.change(fatInput, { target: { value: '67' } })
    })

    await waitFor(() => {
      expect(screen.getByText(/30%/)).toBeInTheDocument() // Protein: (150*4)/2000 = 30%
      expect(screen.getByText(/40%/)).toBeInTheDocument() // Carbs: (200*4)/2000 = 40%
      expect(screen.getByText(/30%/)).toBeInTheDocument() // Fat: (67*9)/2000 ≈ 30%
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
    expect(screen.getByText('Set Your Macro Goals')).toBeInTheDocument()
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
    const calorieInput = screen.getByLabelText(/daily calorie target/i)

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
    expect(screen.getByText('Set Your Macro Goals')).toBeInTheDocument()
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

    const calorieInput = screen.getByLabelText(/daily calorie target/i)
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