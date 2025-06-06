import { render, screen, fireEvent, waitFor } from '@/test-utils'
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
  })

  it('renders goals form with all fields', () => {
    const mockFrom = jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    }))
    
    mockSupabase.from = mockFrom

    render(<GoalsPage />)
    
    expect(screen.getByText(/set your macro goals/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/daily calorie goal/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/protein goal/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/carbohydrate goal/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/fat goal/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save goals/i })).toBeInTheDocument()
  })

  it('loads and displays existing goals', async () => {
    const mockFrom = jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockExistingGoal, error: null }),
    }))
    
    mockSupabase.from = mockFrom

    render(<GoalsPage />)

    await waitFor(() => {
      expect(screen.getByDisplayValue('2000')).toBeInTheDocument() // Calories
      expect(screen.getByDisplayValue('150')).toBeInTheDocument() // Protein
      expect(screen.getByDisplayValue('200')).toBeInTheDocument() // Carbs
      expect(screen.getByDisplayValue('70')).toBeInTheDocument() // Fat
    })
  })

  it('creates new goals when none exist', async () => {
    const mockFrom = jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      insert: jest.fn().mockResolvedValue({ data: null, error: null }),
    }))
    
    mockSupabase.from = mockFrom

    render(<GoalsPage />)

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/daily calorie goal/i), {
      target: { value: '2500' }
    })
    fireEvent.change(screen.getByLabelText(/protein goal/i), {
      target: { value: '180' }
    })
    fireEvent.change(screen.getByLabelText(/carbohydrate goal/i), {
      target: { value: '250' }
    })
    fireEvent.change(screen.getByLabelText(/fat goal/i), {
      target: { value: '80' }
    })

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /save goals/i }))

    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalledWith('macro_goals')
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('updates existing goals', async () => {
    const mockFrom = jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockExistingGoal, error: null }),
      update: jest.fn().mockReturnThis(),
    }))
    
    mockSupabase.from = mockFrom

    render(<GoalsPage />)

    await waitFor(() => {
      expect(screen.getByDisplayValue('2000')).toBeInTheDocument()
    })

    // Update calorie goal
    fireEvent.change(screen.getByLabelText(/daily calorie goal/i), {
      target: { value: '2200' }
    })

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /save goals/i }))

    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalledWith('macro_goals')
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('validates numeric inputs', () => {
    const mockFrom = jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    }))
    
    mockSupabase.from = mockFrom

    render(<GoalsPage />)

    const calorieInput = screen.getByLabelText(/daily calorie goal/i) as HTMLInputElement
    
    // Try to enter non-numeric value
    fireEvent.change(calorieInput, { target: { value: 'abc' } })
    
    // The input should not accept non-numeric values
    expect(calorieInput.value).toBe('')
  })

  it('validates minimum values', () => {
    const mockFrom = jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    }))
    
    mockSupabase.from = mockFrom

    render(<GoalsPage />)

    const calorieInput = screen.getByLabelText(/daily calorie goal/i) as HTMLInputElement
    
    // Try to enter negative value
    fireEvent.change(calorieInput, { target: { value: '-100' } })
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /save goals/i }))
    
    // Check HTML5 validation
    expect(calorieInput.validity.valid).toBe(false)
  })

  it('displays preset goal options', () => {
    const mockFrom = jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    }))
    
    mockSupabase.from = mockFrom

    render(<GoalsPage />)

    expect(screen.getByText(/quick presets/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /weight loss/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /maintenance/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /muscle gain/i })).toBeInTheDocument()
  })

  it('applies preset goals when clicked', async () => {
    const mockFrom = jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    }))
    
    mockSupabase.from = mockFrom

    render(<GoalsPage />)

    // Click weight loss preset
    fireEvent.click(screen.getByRole('button', { name: /weight loss/i }))

    await waitFor(() => {
      // Weight loss preset values
      expect(screen.getByDisplayValue('1500')).toBeInTheDocument() // Calories
      expect(screen.getByDisplayValue('120')).toBeInTheDocument() // Protein
      expect(screen.getByDisplayValue('150')).toBeInTheDocument() // Carbs
      expect(screen.getByDisplayValue('50')).toBeInTheDocument() // Fat
    })
  })

  it('handles database error when loading goals', async () => {
    const mockFrom = jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ 
        data: null, 
        error: { message: 'Database connection failed' } 
      }),
    }))
    
    mockSupabase.from = mockFrom

    render(<GoalsPage />)

    await waitFor(() => {
      expect(screen.getByText(/failed to load goals/i)).toBeInTheDocument()
    })
  })

  it('handles database error when saving goals', async () => {
    const mockFrom = jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      insert: jest.fn().mockResolvedValue({ 
        data: null, 
        error: { message: 'Failed to save' } 
      }),
    }))
    
    mockSupabase.from = mockFrom

    render(<GoalsPage />)

    // Fill form and submit
    fireEvent.change(screen.getByLabelText(/daily calorie goal/i), {
      target: { value: '2000' }
    })
    fireEvent.change(screen.getByLabelText(/protein goal/i), {
      target: { value: '150' }
    })
    fireEvent.change(screen.getByLabelText(/carbohydrate goal/i), {
      target: { value: '200' }
    })
    fireEvent.change(screen.getByLabelText(/fat goal/i), {
      target: { value: '70' }
    })

    fireEvent.click(screen.getByRole('button', { name: /save goals/i }))

    await waitFor(() => {
      expect(screen.getByText(/failed to save goals/i)).toBeInTheDocument()
    })
  })

  it('disables form while saving', async () => {
    let resolveInsert: any
    const insertPromise = new Promise(resolve => {
      resolveInsert = resolve
    })

    const mockFrom = jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      insert: jest.fn().mockReturnValue(insertPromise),
    }))
    
    mockSupabase.from = mockFrom

    render(<GoalsPage />)

    // Fill and submit form
    fireEvent.change(screen.getByLabelText(/daily calorie goal/i), {
      target: { value: '2000' }
    })
    fireEvent.change(screen.getByLabelText(/protein goal/i), {
      target: { value: '150' }
    })
    fireEvent.change(screen.getByLabelText(/carbohydrate goal/i), {
      target: { value: '200' }
    })
    fireEvent.change(screen.getByLabelText(/fat goal/i), {
      target: { value: '70' }
    })

    const submitButton = screen.getByRole('button', { name: /save goals/i })
    fireEvent.click(submitButton)

    // Button should be disabled
    expect(submitButton).toBeDisabled()
    expect(screen.getByText(/saving.../i)).toBeInTheDocument()

    // Resolve the promise
    resolveInsert({ data: null, error: null })

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
    })
  })

  it('displays macro ratio calculations', async () => {
    const mockFrom = jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockExistingGoal, error: null }),
    }))
    
    mockSupabase.from = mockFrom

    render(<GoalsPage />)

    await waitFor(() => {
      // Should display macro percentages
      expect(screen.getByText(/protein.*30%/i)).toBeInTheDocument()
      expect(screen.getByText(/carbs.*40%/i)).toBeInTheDocument()
      expect(screen.getByText(/fat.*30%/i)).toBeInTheDocument()
    })
  })
})