import { getTrendData } from '../trends'
import { createServerClient } from '@/lib/supabase'

// Mock dependencies
jest.mock('@/lib/supabase')
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}))

const mockCreateServerClient = createServerClient as jest.Mock

describe('Trends Actions', () => {
  let mockSupabase: any

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockSupabase = {
      from: jest.fn(),
    }
    
    mockCreateServerClient.mockReturnValue(mockSupabase)
  })

  describe('getTrendData', () => {
    const mockUserId = 'test-user-id'
    const startDate = new Date('2025-06-01')
    const endDate = new Date('2025-06-07')

    const mockFoodEntries = [
      {
        id: '1',
        user_id: mockUserId,
        date: '2025-06-01',
        calories: 500,
        protein_grams: 25,
        carbs_total_grams: 50,
        fat_total_grams: 20,
      },
      {
        id: '2',
        user_id: mockUserId,
        date: '2025-06-01',
        calories: 300,
        protein_grams: 15,
        carbs_total_grams: 30,
        fat_total_grams: 10,
      },
      {
        id: '3',
        user_id: mockUserId,
        date: '2025-06-03',
        calories: 400,
        protein_grams: 20,
        carbs_total_grams: 40,
        fat_total_grams: 15,
      },
    ]

    const mockMacroGoal = {
      id: 'goal-1',
      user_id: mockUserId,
      daily_calorie_goal: 2000,
      protein_percentage: 30,
      carbs_percentage: 40,
      fat_percentage: 30,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    beforeEach(() => {
      // Create separate mock query builders for each table
      const mockFoodEntriesQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockFoodEntries,
          error: null,
        }),
      }

      const mockMacroGoalsQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockMacroGoal,
          error: null,
        }),
      }

      // Mock from() to return appropriate query builder based on table name
      mockSupabase.from.mockImplementation((tableName: string) => {
        if (tableName === 'food_entries') {
          return mockFoodEntriesQuery
        }
        if (tableName === 'macro_goals') {
          return mockMacroGoalsQuery
        }
        return mockFoodEntriesQuery // default
      })
    })

    it('successfully fetches and processes trend data with food entries and goals', async () => {
      const result = await getTrendData(startDate, endDate, mockUserId)

      expect(mockSupabase.from).toHaveBeenCalledWith('food_entries')
      expect(mockSupabase.from).toHaveBeenCalledWith('macro_goals')

      expect(result.dailyTotals).toHaveLength(7) // 7 days in range
      expect(result.dailyTotals[0].date).toBe('Jun 01')
      expect(result.dailyTotals[0].calories).toBe(800) // 500 + 300
      expect(result.dailyTotals[0].protein).toBe(40) // 25 + 15
      expect(result.dailyTotals[0].carbs).toBe(80) // 50 + 30
      expect(result.dailyTotals[0].fat).toBe(30) // 20 + 10

      expect(result.dailyTotals[2].calories).toBe(400) // June 3rd
      expect(result.dailyTotals[1].calories).toBe(0) // June 2nd (no entries)

      expect(result.summary.avgCalories).toBe(600) // (800 + 400) / 2 days with data
      expect(result.summary.avgProtein).toBe(30) // (40 + 20) / 2
      expect(result.summary.totalDays).toBe(2)

      expect(result.macroGoal).toEqual(mockMacroGoal)
    })

    it('handles no food entries gracefully', async () => {
      // Override to return no food entries
      const mockFoodEntriesQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }

      const mockMacroGoalsQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockMacroGoal,
          error: null,
        }),
      }

      mockSupabase.from.mockImplementation((tableName: string) => {
        if (tableName === 'food_entries') {
          return mockFoodEntriesQuery
        }
        if (tableName === 'macro_goals') {
          return mockMacroGoalsQuery
        }
        return mockFoodEntriesQuery
      })

      const result = await getTrendData(startDate, endDate, mockUserId)

      expect(result.dailyTotals).toHaveLength(7)
      expect(result.dailyTotals[0].calories).toBe(0)
      expect(result.summary.avgCalories).toBe(0)
      expect(result.summary.totalDays).toBe(1) // Default to 1 to avoid division by zero
    })

    it('handles no macro goals gracefully', async () => {
      const mockFromReturn = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn(),
      }

      mockSupabase.from.mockReturnValue(mockFromReturn)
      
      // First call (food_entries)
      mockFromReturn.order.mockReturnValueOnce({
        ...mockFromReturn,
        order: jest.fn().mockResolvedValueOnce({
          data: mockFoodEntries,
          error: null,
        }),
      })
      
      // Second call (macro_goals) - no data found
      mockFromReturn.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' }, // No rows found
      })

      const result = await getTrendData(startDate, endDate, mockUserId)

      expect(result.macroGoal).toBeNull()
      expect(result.summary.calorieGoalMet).toBe(0)
      expect(result.summary.proteinGoalMet).toBe(0)
    })

    it('handles food entries fetch error', async () => {
      const mockFromReturn = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn(),
      }

      mockSupabase.from.mockReturnValue(mockFromReturn)
      
      // First call (food_entries) - error
      mockFromReturn.order.mockReturnValueOnce({
        ...mockFromReturn,
        order: jest.fn().mockResolvedValueOnce({
          data: null,
          error: { message: 'Database error' },
        }),
      })

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      await expect(getTrendData(startDate, endDate, mockUserId))
        .rejects.toThrow('Failed to fetch trend data')

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error fetching food entries:',
        { message: 'Database error' }
      )

      consoleSpy.mockRestore()
    })

    it('handles macro goals fetch error (non-PGRST116)', async () => {
      const mockFromReturn = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn(),
      }

      mockSupabase.from.mockReturnValue(mockFromReturn)
      
      // First call (food_entries)
      mockFromReturn.order.mockReturnValueOnce({
        ...mockFromReturn,
        order: jest.fn().mockResolvedValueOnce({
          data: mockFoodEntries,
          error: null,
        }),
      })
      
      // Second call (macro_goals) - non-PGRST116 error
      mockFromReturn.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'OTHER_ERROR', message: 'Database connection failed' },
      })

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const result = await getTrendData(startDate, endDate, mockUserId)

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error fetching macro goals:',
        { code: 'OTHER_ERROR', message: 'Database connection failed' }
      )

      expect(result.macroGoal).toBeNull()

      consoleSpy.mockRestore()
    })

    it('calculates macro percentages correctly', async () => {
      const result = await getTrendData(startDate, endDate, mockUserId)

      // From mockFoodEntries: avg protein=30g, carbs=60g, fat=22.5g
      // Calories: protein=120, carbs=240, fat=202.5, total=562.5
      expect(result.summary.proteinPercentage).toBe(21) // 120/562.5 * 100 ≈ 21%
      expect(result.summary.carbsPercentage).toBe(43) // 240/562.5 * 100 ≈ 43%
      expect(result.summary.fatPercentage).toBe(36) // 202.5/562.5 * 100 ≈ 36%
    })

    it('calculates goal completion rates correctly', async () => {
      // Use data that meets goals
      const highIntakeFoodEntries = [
        {
          id: '1',
          user_id: mockUserId,
          date: '2025-06-01',
          calories: 1900, // 95% of 2000 goal - should count as met
          protein_grams: 135, // Target: 150g, 90% = 135g - should count as met
          carbs_total_grams: 180, // Target: 200g, 90% = 180g - should count as met
          fat_total_grams: 60, // Target: 67g, 90% = 60g - should count as met
        },
      ]

      const mockFromReturn = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn(),
      }

      mockSupabase.from.mockReturnValue(mockFromReturn)
      
      // First call (food_entries)
      mockFromReturn.order.mockReturnValueOnce({
        ...mockFromReturn,
        order: jest.fn().mockResolvedValueOnce({
          data: highIntakeFoodEntries,
          error: null,
        }),
      })
      
      // Second call (macro_goals)
      mockFromReturn.single.mockResolvedValueOnce({
        data: mockMacroGoal,
        error: null,
      })

      const result = await getTrendData(startDate, endDate, mockUserId)

      expect(result.summary.calorieGoalMet).toBe(100) // 1 day met / 1 total day
      expect(result.summary.proteinGoalMet).toBe(100)
      expect(result.summary.carbsGoalMet).toBe(100)
      expect(result.summary.fatGoalMet).toBe(100)
    })

    it('handles zero calories for macro percentage calculation', async () => {
      const zeroCalorieEntries = [
        {
          id: '1',
          user_id: mockUserId,
          date: '2025-06-01',
          calories: 0,
          protein_grams: 0,
          carbs_total_grams: 0,
          fat_total_grams: 0,
        },
      ]

      const mockFromReturn = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn(),
      }

      mockSupabase.from.mockReturnValue(mockFromReturn)
      
      // First call (food_entries)
      mockFromReturn.order.mockReturnValueOnce({
        ...mockFromReturn,
        order: jest.fn().mockResolvedValueOnce({
          data: zeroCalorieEntries,
          error: null,
        }),
      })
      
      // Second call (macro_goals)
      mockFromReturn.single.mockResolvedValueOnce({
        data: mockMacroGoal,
        error: null,
      })

      const result = await getTrendData(startDate, endDate, mockUserId)

      expect(result.summary.proteinPercentage).toBe(0)
      expect(result.summary.carbsPercentage).toBe(0)
      expect(result.summary.fatPercentage).toBe(0)
    })

    it('handles date formatting correctly', async () => {
      const result = await getTrendData(startDate, endDate, mockUserId)

      expect(result.dailyTotals[0].date).toBe('Jun 01')
      expect(result.dailyTotals[6].date).toBe('Jun 07')
    })

    it('aggregates multiple entries for the same day correctly', async () => {
      const result = await getTrendData(startDate, endDate, mockUserId)

      // June 1st has 2 entries: 500+300=800 calories, 25+15=40 protein
      expect(result.dailyTotals[0].calories).toBe(800)
      expect(result.dailyTotals[0].protein).toBe(40)
    })

    it('handles string to number conversion for macros', async () => {
      const entriesWithStringMacros = [
        {
          id: '1',
          user_id: mockUserId,
          date: '2025-06-01',
          calories: 500,
          protein_grams: '25.5', // String
          carbs_total_grams: '50.2', // String
          fat_total_grams: '20.1', // String
        },
      ]

      const mockFromReturn = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn(),
      }

      mockSupabase.from.mockReturnValue(mockFromReturn)
      
      // First call (food_entries)
      mockFromReturn.order.mockReturnValueOnce({
        ...mockFromReturn,
        order: jest.fn().mockResolvedValueOnce({
          data: entriesWithStringMacros,
          error: null,
        }),
      })
      
      // Second call (macro_goals)
      mockFromReturn.single.mockResolvedValueOnce({
        data: mockMacroGoal,
        error: null,
      })

      const result = await getTrendData(startDate, endDate, mockUserId)

      expect(result.dailyTotals[0].protein).toBe(25.5)
      expect(result.dailyTotals[0].carbs).toBe(50.2)
      expect(result.dailyTotals[0].fat).toBe(20.1)
    })
  })
})