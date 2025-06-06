import { render, screen, fireEvent, waitFor } from '@/test-utils'
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

    // Mock Supabase queries
    const mockFrom = jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockResolvedValue({ data: null, error: null }),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ 
        data: [
          {
            id: 'recent-1',
            food_name: 'Recent Chicken',
            calories: 165,
            protein: 31,
            carbs: 0,
            fat: 3.6,
          }
        ], 
        error: null 
      }),
    }))
    
    mockSupabase.from = mockFrom
  })

  it('renders add food form with all fields', () => {
    render(<AddFoodPage />)
    
    expect(screen.getByText(/add food entry/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/food name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/unit/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/calories/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/protein/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/carbs/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/fat/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add entry/i })).toBeInTheDocument()
  })

  it('displays recent foods', async () => {
    render(<AddFoodPage />)

    await waitFor(() => {
      expect(screen.getByText(/recent foods/i)).toBeInTheDocument()
      expect(screen.getByText('Recent Chicken')).toBeInTheDocument()
      expect(screen.getByText('165 cal')).toBeInTheDocument()
    })
  })

  it('handles manual food entry submission', async () => {
    render(<AddFoodPage />)

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/food name/i), {
      target: { value: 'Grilled Salmon' }
    })
    fireEvent.change(screen.getByLabelText(/quantity/i), {
      target: { value: '1' }
    })
    fireEvent.change(screen.getByLabelText(/calories/i), {
      target: { value: '367' }
    })
    fireEvent.change(screen.getByLabelText(/protein/i), {
      target: { value: '55' }
    })
    fireEvent.change(screen.getByLabelText(/carbs/i), {
      target: { value: '0' }
    })
    fireEvent.change(screen.getByLabelText(/fat/i), {
      target: { value: '22' }
    })

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /add entry/i }))

    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith('food_entries')
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('validates required fields', async () => {
    render(<AddFoodPage />)

    // Try to submit with empty fields
    fireEvent.click(screen.getByRole('button', { name: /add entry/i }))

    // Check HTML5 validation
    const foodNameInput = screen.getByLabelText(/food name/i) as HTMLInputElement
    expect(foodNameInput.validity.valid).toBe(false)
  })

  it('handles AI-powered nutrition estimation', async () => {
    // Mock successful API response
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        calories: 200,
        protein: 25,
        carbs: 10,
        fat: 8,
        confidence: 'high'
      })
    })

    render(<AddFoodPage />)

    // Enter food description
    fireEvent.change(screen.getByLabelText(/food name/i), {
      target: { value: 'grilled chicken breast with steamed broccoli' }
    })

    // Click the AI estimate button
    const estimateButton = screen.getByRole('button', { name: /estimate nutrition/i })
    fireEvent.click(estimateButton)

    await waitFor(() => {
      expect(screen.getByDisplayValue('200')).toBeInTheDocument() // Calories
      expect(screen.getByDisplayValue('25')).toBeInTheDocument() // Protein
      expect(screen.getByDisplayValue('10')).toBeInTheDocument() // Carbs
      expect(screen.getByDisplayValue('8')).toBeInTheDocument() // Fat
    })
  })

  it('handles AI estimation error', async () => {
    // Mock API error
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    })

    render(<AddFoodPage />)

    fireEvent.change(screen.getByLabelText(/food name/i), {
      target: { value: 'some food' }
    })

    const estimateButton = screen.getByRole('button', { name: /estimate nutrition/i })
    fireEvent.click(estimateButton)

    await waitFor(() => {
      expect(screen.getByText(/failed to estimate/i)).toBeInTheDocument()
    })
  })

  it('allows selecting recent food entries', async () => {
    render(<AddFoodPage />)

    await waitFor(() => {
      expect(screen.getByText('Recent Chicken')).toBeInTheDocument()
    })

    // Click on recent food
    fireEvent.click(screen.getByText('Recent Chicken'))

    // Check if form is populated
    await waitFor(() => {
      expect(screen.getByDisplayValue('Recent Chicken')).toBeInTheDocument()
      expect(screen.getByDisplayValue('165')).toBeInTheDocument() // Calories
      expect(screen.getByDisplayValue('31')).toBeInTheDocument() // Protein
    })
  })

  it('displays smart suggestions based on food name', async () => {
    render(<AddFoodPage />)

    // Type in food name
    fireEvent.change(screen.getByLabelText(/food name/i), {
      target: { value: 'chick' }
    })

    // Wait for debounce and suggestions
    await waitFor(() => {
      expect(screen.getByText(/suggestions/i)).toBeInTheDocument()
    }, { timeout: 1000 })
  })

  it('handles database error when saving', async () => {
    const mockFrom = jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockResolvedValue({ 
        data: null, 
        error: { message: 'Database connection failed' } 
      }),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: [], error: null }),
    }))
    
    mockSupabase.from = mockFrom

    render(<AddFoodPage />)

    // Fill and submit form
    fireEvent.change(screen.getByLabelText(/food name/i), {
      target: { value: 'Test Food' }
    })
    fireEvent.change(screen.getByLabelText(/calories/i), {
      target: { value: '100' }
    })
    fireEvent.change(screen.getByLabelText(/protein/i), {
      target: { value: '10' }
    })
    fireEvent.change(screen.getByLabelText(/carbs/i), {
      target: { value: '10' }
    })
    fireEvent.change(screen.getByLabelText(/fat/i), {
      target: { value: '5' }
    })

    fireEvent.click(screen.getByRole('button', { name: /add entry/i }))

    await waitFor(() => {
      expect(screen.getByText(/failed to add food entry/i)).toBeInTheDocument()
    })
  })

  it('disables form while submitting', async () => {
    render(<AddFoodPage />)

    // Fill form
    fireEvent.change(screen.getByLabelText(/food name/i), {
      target: { value: 'Test Food' }
    })
    fireEvent.change(screen.getByLabelText(/calories/i), {
      target: { value: '100' }
    })
    fireEvent.change(screen.getByLabelText(/protein/i), {
      target: { value: '10' }
    })
    fireEvent.change(screen.getByLabelText(/carbs/i), {
      target: { value: '10' }
    })
    fireEvent.change(screen.getByLabelText(/fat/i), {
      target: { value: '5' }
    })

    const submitButton = screen.getByRole('button', { name: /add entry/i })
    
    // Create a promise we can control
    let resolveInsert: any
    const insertPromise = new Promise(resolve => {
      resolveInsert = resolve
    })
    
    const mockFrom = jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnValue(insertPromise),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: [], error: null }),
    }))
    
    mockSupabase.from = mockFrom

    fireEvent.click(submitButton)

    // Button should be disabled
    expect(submitButton).toBeDisabled()
    expect(screen.getByText(/adding.../i)).toBeInTheDocument()

    // Resolve the promise
    resolveInsert({ data: null, error: null })

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
    })
  })
})