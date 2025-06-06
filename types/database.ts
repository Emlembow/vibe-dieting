export interface Profile {
  id: string
  username: string | null
  full_name: string | null
  created_at: string
  updated_at: string
}

export interface MacroGoal {
  id: string
  user_id: string
  daily_calorie_goal: number
  protein_percentage: number
  carbs_percentage: number
  fat_percentage: number
  created_at: string
  updated_at: string
}

export interface FoodEntry {
  id: string
  user_id: string
  date: string
  name: string
  description: string | null
  calories: number
  protein_grams: number
  carbs_total_grams: number
  carbs_fiber_grams: number | null
  carbs_sugar_grams: number | null
  fat_total_grams: number
  fat_saturated_grams: number | null
  created_at: string
}

export interface YoloDay {
  id: string
  user_id: string
  date: string
  reason: string | null
  created_at: string
}

export interface NutritionResponse {
  foodDetails: {
    name: string
    description: string
  }
  macronutrients: {
    calories: number
    proteinGrams: number
    carbohydrates: {
      totalGrams: number
      fiberGrams: number
      sugarGrams: number
    }
    fat: {
      totalGrams: number
      saturatedGrams: number
    }
  }
}
