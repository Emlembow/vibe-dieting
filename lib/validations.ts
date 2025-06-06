import { z } from "zod"

// Auth validation schemas
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
})

// Basic registration schema (without confirm password)
export const registerSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores, and hyphens"
    ),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
})

// Extended registration schema with password confirmation
export const registerWithConfirmSchema = z
  .object({
    username: z
      .string()
      .min(1, "Username is required")
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must be less than 30 characters")
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        "Username can only contain letters, numbers, underscores, and hyphens"
      ),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

// Food validation schemas
export const foodSearchSchema = z.object({
  foodName: z
    .string()
    .min(1, "Food name is required")
    .min(2, "Food name must be at least 2 characters")
    .max(200, "Food name must be less than 200 characters")
    .trim(),
})

export const manualFoodEntrySchema = z
  .object({
    name: z
      .string()
      .min(1, "Food name is required")
      .min(2, "Food name must be at least 2 characters")
      .max(200, "Food name must be less than 200 characters")
      .trim(),
    description: z
      .string()
      .max(500, "Description must be less than 500 characters")
      .optional(),
    calories: z
      .number()
      .min(0, "Calories cannot be negative")
      .max(10000, "Calories must be less than 10,000")
      .int("Calories must be a whole number"),
    protein_grams: z
      .number()
      .min(0, "Protein cannot be negative")
      .max(1000, "Protein must be less than 1,000g"),
    carbs_total_grams: z
      .number()
      .min(0, "Carbs cannot be negative")
      .max(1000, "Carbs must be less than 1,000g"),
    carbs_fiber_grams: z
      .number()
      .min(0, "Fiber cannot be negative")
      .max(1000, "Fiber must be less than 1,000g")
      .optional(),
    carbs_sugar_grams: z
      .number()
      .min(0, "Sugar cannot be negative")
      .max(1000, "Sugar must be less than 1,000g")
      .optional(),
    fat_total_grams: z
      .number()
      .min(0, "Fat cannot be negative")
      .max(1000, "Fat must be less than 1,000g"),
    fat_saturated_grams: z
      .number()
      .min(0, "Saturated fat cannot be negative")
      .max(1000, "Saturated fat must be less than 1,000g")
      .optional(),
  })
  .refine(
    (data) => {
      if (data.carbs_fiber_grams != null && data.carbs_fiber_grams > data.carbs_total_grams) {
        return false
      }
      return true
    },
    {
      message: "Fiber cannot be more than total carbs",
      path: ["carbs_fiber_grams"],
    }
  )
  .refine(
    (data) => {
      if (data.carbs_sugar_grams != null && data.carbs_sugar_grams > data.carbs_total_grams) {
        return false
      }
      return true
    },
    {
      message: "Sugar cannot be more than total carbs",
      path: ["carbs_sugar_grams"],
    }
  )
  .refine(
    (data) => {
      if (data.fat_saturated_grams != null && data.fat_saturated_grams > data.fat_total_grams) {
        return false
      }
      return true
    },
    {
      message: "Saturated fat cannot be more than total fat",
      path: ["fat_saturated_grams"],
    }
  )

// Goals validation schema
export const macroGoalSchema = z
  .object({
    daily_calorie_goal: z
      .number()
      .min(800, "Daily calorie goal must be at least 800")
      .max(10000, "Daily calorie goal must be less than 10,000")
      .int("Daily calorie goal must be a whole number"),
    protein_percentage: z
      .number()
      .min(10, "Protein percentage must be at least 10%")
      .max(70, "Protein percentage must be less than 70%"),
    carbs_percentage: z
      .number()
      .min(10, "Carbs percentage must be at least 10%")
      .max(70, "Carbs percentage must be less than 70%"),
    fat_percentage: z
      .number()
      .min(10, "Fat percentage must be at least 10%")
      .max(70, "Fat percentage must be less than 70%"),
  })
  .refine(
    (data) => {
      const total = data.protein_percentage + data.carbs_percentage + data.fat_percentage
      return Math.abs(total - 100) < 0.1 // Allow small floating point differences
    },
    {
      message: "Protein, carbs, and fat percentages must add up to 100%",
      path: ["protein_percentage"],
    }
  )

// Image upload validation
export const imageUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, "File size must be less than 5MB")
    .refine(
      (file) => ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type),
      "File must be a JPEG, PNG, or WebP image"
    ),
})

// Type exports for use in components
export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type RegisterWithConfirmFormData = z.infer<typeof registerWithConfirmSchema>
export type FoodSearchFormData = z.infer<typeof foodSearchSchema>
export type ManualFoodEntryFormData = z.infer<typeof manualFoodEntrySchema>
export type MacroGoalFormData = z.infer<typeof macroGoalSchema>
export type ImageUploadFormData = z.infer<typeof imageUploadSchema>