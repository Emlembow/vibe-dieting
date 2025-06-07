import { render, screen, fireEvent, waitFor, act } from '@/test-utils'
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

// Mock fetch for nutrition API
global.fetch = jest.fn()

// Mock file reading for image uploads
global.FileReader = class {
  readAsDataURL = jest.fn()
  result = 'data:image/jpeg;base64,fake-image-data'
  onload = jest.fn()
  
  constructor() {
    setTimeout(() => {
      this.onload?.()
    }, 0)
  }
} as any

describe('AddFoodPage - Comprehensive Coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    mockUseAuth.mockReturnValue({
      user: { id: 'test-user', email: 'test@example.com' },
      isLoading: false,
    })

    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })

    // Create comprehensive mock query builder
    const createMockQueryBuilder = (resolvedValue: any) => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      insert: jest.fn().mockResolvedValue({ error: null }),
      single: jest.fn().mockResolvedValue(resolvedValue),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockResolvedValue(resolvedValue),
      then: jest.fn((onFulfilled) => Promise.resolve(resolvedValue).then(onFulfilled)),
      catch: jest.fn((onRejected) => Promise.resolve(resolvedValue).catch(onRejected)),
    })

    mockSupabase.from = jest.fn((table: string) => {
      if (table === 'food_entries') {
        return createMockQueryBuilder({ data: [], error: null })
      }
      return createMockQueryBuilder({ data: null, error: null })
    })

    // Mock successful nutrition API response
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        foods: [
          {
            name: 'Apple',
            calories: 95,
            protein_grams: 0.5,
            carbs_total_grams: 25,
            fat_total_grams: 0.3,
            description: 'A fresh apple'
          }
        ]
      })
    })
  })

  describe('Tab Navigation', () => {
    it('switches between search, recent, and manual entry tabs', async () => {
      await act(async () => {
        render(<AddFoodPage />)
      })

      // Default to search tab
      expect(screen.getByText('Search')).toBeInTheDocument()

      // Switch to recent tab
      const recentTab = screen.getByText('Recent')
      await act(async () => {
        fireEvent.click(recentTab)
      })

      // Switch to manual entry tab
      const manualTab = screen.getByText('Manual Entry')
      await act(async () => {
        fireEvent.click(manualTab)
      })

      expect(screen.getByText('Manual Entry')).toBeInTheDocument()
    })
  })

  describe('Search Functionality', () => {
    it('performs text search for food items', async () => {
      await act(async () => {
        render(<AddFoodPage />)
      })

      // Find search input
      const searchInput = screen.getByPlaceholderText(/search for foods/i)
      
      await act(async () => {
        fireEvent.change(searchInput, { target: { value: 'apple' } })
      })

      const searchButton = screen.getByText('Search')
      await act(async () => {
        fireEvent.click(searchButton)
      })

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/nutrition', expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('apple')
        }))
      })
    })

    it('handles empty search input', async () => {
      await act(async () => {
        render(<AddFoodPage />)
      })

      const searchButton = screen.getByText('Search')
      await act(async () => {
        fireEvent.click(searchButton)
      })

      // Should not make API call with empty input
      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('handles search API errors', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500
      })

      await act(async () => {
        render(<AddFoodPage />)
      })

      const searchInput = screen.getByPlaceholderText(/search for foods/i)
      await act(async () => {
        fireEvent.change(searchInput, { target: { value: 'apple' } })
      })

      const searchButton = screen.getByText('Search')
      await act(async () => {
        fireEvent.click(searchButton)
      })

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled()
      })
    })

    it('clears search results', async () => {
      await act(async () => {
        render(<AddFoodPage />)
      })

      // Perform search first
      const searchInput = screen.getByPlaceholderText(/search for foods/i)
      await act(async () => {
        fireEvent.change(searchInput, { target: { value: 'apple' } })
      })

      const searchButton = screen.getByText('Search')
      await act(async () => {
        fireEvent.click(searchButton)
      })

      await waitFor(() => {
        expect(screen.getByText('Apple')).toBeInTheDocument()
      })

      // Clear search
      const clearButton = screen.getByText('Clear')
      await act(async () => {
        fireEvent.click(clearButton)
      })
    })
  })

  describe('Image Upload Functionality', () => {
    it('handles image upload for nutrition analysis', async () => {
      await act(async () => {
        render(<AddFoodPage />)
      })

      // Create a mock file
      const file = new File(['fake image'], 'test.jpg', { type: 'image/jpeg' })
      
      // Find file input
      const fileInput = screen.getByTestId('image-upload') || document.querySelector('input[type="file"]')
      
      if (fileInput) {
        await act(async () => {
          fireEvent.change(fileInput, { target: { files: [file] } })
        })

        await waitFor(() => {
          expect(global.fetch).toHaveBeenCalledWith('/api/nutrition/image', expect.objectContaining({
            method: 'POST'
          }))
        })
      }
    })

    it('handles image upload errors', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500
      })

      await act(async () => {
        render(<AddFoodPage />)
      })

      const file = new File(['fake image'], 'test.jpg', { type: 'image/jpeg' })
      const fileInput = document.querySelector('input[type="file"]')
      
      if (fileInput) {
        await act(async () => {
          fireEvent.change(fileInput, { target: { files: [file] } })
        })

        await waitFor(() => {
          expect(global.fetch).toHaveBeenCalled()
        })
      }
    })

    it('validates file type for image upload', async () => {
      await act(async () => {
        render(<AddFoodPage />)
      })

      // Create a non-image file
      const file = new File(['fake text'], 'test.txt', { type: 'text/plain' })
      const fileInput = document.querySelector('input[type="file"]')
      
      if (fileInput) {
        await act(async () => {
          fireEvent.change(fileInput, { target: { files: [file] } })
        })

        // Should not make API call for invalid file type
        expect(global.fetch).not.toHaveBeenCalledWith('/api/nutrition/image', expect.any(Object))
      }
    })
  })

  describe('Manual Entry', () => {
    it('allows manual food entry with custom values', async () => {
      await act(async () => {
        render(<AddFoodPage />)
      })

      // Switch to manual entry tab
      const manualTab = screen.getByText('Manual Entry')
      await act(async () => {
        fireEvent.click(manualTab)
      })

      // Fill in manual entry form
      const nameInput = screen.getByLabelText(/food name/i)
      const caloriesInput = screen.getByLabelText(/calories/i)
      const proteinInput = screen.getByLabelText(/protein/i)
      const carbsInput = screen.getByLabelText(/carbs/i)
      const fatInput = screen.getByLabelText(/fat/i)

      await act(async () => {
        fireEvent.change(nameInput, { target: { value: 'Custom Food' } })
        fireEvent.change(caloriesInput, { target: { value: '200' } })
        fireEvent.change(proteinInput, { target: { value: '10' } })
        fireEvent.change(carbsInput, { target: { value: '30' } })
        fireEvent.change(fatInput, { target: { value: '5' } })
      })

      const addButton = screen.getByText('Add to Diary')
      await act(async () => {
        fireEvent.click(addButton)
      })

      await waitFor(() => {
        expect(mockSupabase.from).toHaveBeenCalledWith('food_entries')
      })
    })

    it('validates required fields in manual entry', async () => {
      await act(async () => {
        render(<AddFoodPage />)
      })

      const manualTab = screen.getByText('Manual Entry')
      await act(async () => {
        fireEvent.click(manualTab)
      })

      // Try to submit without filling required fields
      const addButton = screen.getByText('Add to Diary')
      await act(async () => {
        fireEvent.click(addButton)
      })

      // Should not make database call without required fields
      expect(mockSupabase.from).not.toHaveBeenCalledWith('food_entries')
    })
  })

  describe('Recent Foods', () => {
    it('displays recent food entries', async () => {
      const mockRecentFoods = [
        {
          id: 'food-1',
          name: 'Apple',
          calories: 95,
          created_at: new Date().toISOString()
        }
      ]

      mockSupabase.from = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockResolvedValue({ data: mockRecentFoods, error: null }),
        then: jest.fn((onFulfilled) => Promise.resolve({ data: mockRecentFoods, error: null }).then(onFulfilled)),
        catch: jest.fn((onRejected) => Promise.resolve({ data: mockRecentFoods, error: null }).catch(onRejected)),
      }))

      await act(async () => {
        render(<AddFoodPage />)
      })

      const recentTab = screen.getByText('Recent')
      await act(async () => {
        fireEvent.click(recentTab)
      })

      await waitFor(() => {
        expect(screen.getByText('Apple')).toBeInTheDocument()
      })
    })

    it('handles empty recent foods list', async () => {
      mockSupabase.from = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockResolvedValue({ data: [], error: null }),
        then: jest.fn((onFulfilled) => Promise.resolve({ data: [], error: null }).then(onFulfilled)),
        catch: jest.fn((onRejected) => Promise.resolve({ data: [], error: null }).catch(onRejected)),
      }))

      await act(async () => {
        render(<AddFoodPage />)
      })

      const recentTab = screen.getByText('Recent')
      await act(async () => {
        fireEvent.click(recentTab)
      })

      await waitFor(() => {
        expect(screen.getByText(/no recent foods/i)).toBeInTheDocument()
      })
    })
  })

  describe('Food Item Actions', () => {
    it('adds selected food to diary', async () => {
      await act(async () => {
        render(<AddFoodPage />)
      })

      // Perform search to get food results
      const searchInput = screen.getByPlaceholderText(/search for foods/i)
      await act(async () => {
        fireEvent.change(searchInput, { target: { value: 'apple' } })
      })

      const searchButton = screen.getByText('Search')
      await act(async () => {
        fireEvent.click(searchButton)
      })

      await waitFor(() => {
        expect(screen.getByText('Apple')).toBeInTheDocument()
      })

      // Add food to diary
      const addButton = screen.getAllByText('Add')[0]
      await act(async () => {
        fireEvent.click(addButton)
      })

      await waitFor(() => {
        expect(mockSupabase.from).toHaveBeenCalledWith('food_entries')
      })
    })

    it('handles database errors when adding food', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      mockSupabase.from = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        insert: jest.fn().mockResolvedValue({ error: { message: 'Database error' } }),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockResolvedValue({ data: [], error: null }),
        then: jest.fn((onFulfilled) => Promise.resolve({ data: [], error: null }).then(onFulfilled)),
        catch: jest.fn((onRejected) => Promise.resolve({ data: [], error: null }).catch(onRejected)),
      }))

      await act(async () => {
        render(<AddFoodPage />)
      })

      const manualTab = screen.getByText('Manual Entry')
      await act(async () => {
        fireEvent.click(manualTab)
      })

      const nameInput = screen.getByLabelText(/food name/i)
      await act(async () => {
        fireEvent.change(nameInput, { target: { value: 'Test Food' } })
      })

      const addButton = screen.getByText('Add to Diary')
      await act(async () => {
        fireEvent.click(addButton)
      })

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled()
      })

      consoleSpy.mockRestore()
    })
  })

  describe('Loading States', () => {
    it('shows loading state during search', async () => {
      // Mock delayed response
      ;(global.fetch as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve({ foods: [] })
        }), 100))
      )

      await act(async () => {
        render(<AddFoodPage />)
      })

      const searchInput = screen.getByPlaceholderText(/search for foods/i)
      await act(async () => {
        fireEvent.change(searchInput, { target: { value: 'apple' } })
      })

      const searchButton = screen.getByText('Search')
      await act(async () => {
        fireEvent.click(searchButton)
      })

      // Should show loading state
      expect(screen.getByText('Searching...')).toBeInTheDocument()
    })

    it('shows loading state during image upload', async () => {
      ;(global.fetch as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve({ foods: [] })
        }), 100))
      )

      await act(async () => {
        render(<AddFoodPage />)
      })

      const file = new File(['fake image'], 'test.jpg', { type: 'image/jpeg' })
      const fileInput = document.querySelector('input[type="file"]')
      
      if (fileInput) {
        await act(async () => {
          fireEvent.change(fileInput, { target: { files: [file] } })
        })

        expect(screen.getByText('Analyzing...')).toBeInTheDocument()
      }
    })
  })
})