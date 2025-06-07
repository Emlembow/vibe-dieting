import {
  loginSchema,
  registerSchema,
  registerWithConfirmSchema,
  foodSearchSchema,
  manualFoodEntrySchema,
  macroGoalSchema,
  imageUploadSchema,
} from '../validations'

describe('Validation Schemas', () => {
  describe('loginSchema', () => {
    it('validates correct login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
      }
      
      const result = loginSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('requires email', () => {
      const invalidData = {
        email: '',
        password: 'password123',
      }
      
      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Email is required')
      }
    })

    it('validates email format', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
      }
      
      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Please enter a valid email address')
      }
    })

    it('requires password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '',
      }
      
      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Password is required')
      }
    })

    it('validates minimum password length', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '12345',
      }
      
      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Password must be at least 6 characters')
      }
    })
  })

  describe('registerSchema', () => {
    it('validates correct registration data', () => {
      const validData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123',
      }
      
      const result = registerSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('requires username', () => {
      const invalidData = {
        username: '',
        email: 'test@example.com',
        password: 'Password123',
      }
      
      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Username is required')
      }
    })

    it('validates minimum username length', () => {
      const invalidData = {
        username: 'ab',
        email: 'test@example.com',
        password: 'Password123',
      }
      
      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Username must be at least 3 characters')
      }
    })

    it('validates maximum username length', () => {
      const invalidData = {
        username: 'a'.repeat(31),
        email: 'test@example.com',
        password: 'Password123',
      }
      
      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Username must be less than 30 characters')
      }
    })

    it('validates username format', () => {
      const invalidData = {
        username: 'invalid@username',
        email: 'test@example.com',
        password: 'Password123',
      }
      
      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Username can only contain letters, numbers, underscores, and hyphens')
      }
    })

    it('validates password strength', () => {
      const invalidData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'weakpassword',
      }
      
      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Password must contain at least one uppercase letter, one lowercase letter, and one number')
      }
    })

    it('validates minimum password length for registration', () => {
      const invalidData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Pass1',
      }
      
      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Password must be at least 8 characters')
      }
    })
  })

  describe('registerWithConfirmSchema', () => {
    it('validates correct registration data with matching passwords', () => {
      const validData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
      }
      
      const result = registerWithConfirmSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('requires password confirmation', () => {
      const invalidData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: '',
      }
      
      const result = registerWithConfirmSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Please confirm your password')
      }
    })

    it('validates passwords match', () => {
      const invalidData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'DifferentPassword123',
      }
      
      const result = registerWithConfirmSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Passwords don't match")
        expect(result.error.issues[0].path).toEqual(['confirmPassword'])
      }
    })
  })

  describe('foodSearchSchema', () => {
    it('validates correct food search data', () => {
      const validData = {
        foodName: 'apple',
      }
      
      const result = foodSearchSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('requires food name', () => {
      const invalidData = {
        foodName: '',
      }
      
      const result = foodSearchSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Food name is required')
      }
    })

    it('validates minimum food name length', () => {
      const invalidData = {
        foodName: 'a',
      }
      
      const result = foodSearchSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Food name must be at least 2 characters')
      }
    })

    it('validates maximum food name length', () => {
      const invalidData = {
        foodName: 'a'.repeat(201),
      }
      
      const result = foodSearchSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Food name must be less than 200 characters')
      }
    })

    it('trims whitespace', () => {
      const data = {
        foodName: '  apple  ',
      }
      
      const result = foodSearchSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.foodName).toBe('apple')
      }
    })
  })

  describe('manualFoodEntrySchema', () => {
    it('validates correct manual food entry', () => {
      const validData = {
        name: 'Custom Food',
        description: 'A delicious food item',
        calories: 100,
        protein_grams: 10,
        carbs_total_grams: 20,
        carbs_fiber_grams: 5,
        carbs_sugar_grams: 15,
        fat_total_grams: 5,
        fat_saturated_grams: 2,
      }
      
      const result = manualFoodEntrySchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('validates negative calories', () => {
      const invalidData = {
        name: 'Food',
        calories: -10,
        protein_grams: 0,
        carbs_total_grams: 0,
        fat_total_grams: 0,
      }
      
      const result = manualFoodEntrySchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Calories cannot be negative')
      }
    })

    it('validates maximum calories', () => {
      const invalidData = {
        name: 'Food',
        calories: 10001,
        protein_grams: 0,
        carbs_total_grams: 0,
        fat_total_grams: 0,
      }
      
      const result = manualFoodEntrySchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Calories must be less than 10,000')
      }
    })

    it('validates calories are integers', () => {
      const invalidData = {
        name: 'Food',
        calories: 100.5,
        protein_grams: 0,
        carbs_total_grams: 0,
        fat_total_grams: 0,
      }
      
      const result = manualFoodEntrySchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Calories must be a whole number')
      }
    })

    it('validates fiber cannot exceed total carbs', () => {
      const invalidData = {
        name: 'Food',
        calories: 100,
        protein_grams: 0,
        carbs_total_grams: 10,
        carbs_fiber_grams: 15,
        fat_total_grams: 0,
      }
      
      const result = manualFoodEntrySchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Fiber cannot be more than total carbs')
        expect(result.error.issues[0].path).toEqual(['carbs_fiber_grams'])
      }
    })

    it('validates sugar cannot exceed total carbs', () => {
      const invalidData = {
        name: 'Food',
        calories: 100,
        protein_grams: 0,
        carbs_total_grams: 10,
        carbs_sugar_grams: 15,
        fat_total_grams: 0,
      }
      
      const result = manualFoodEntrySchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Sugar cannot be more than total carbs')
        expect(result.error.issues[0].path).toEqual(['carbs_sugar_grams'])
      }
    })

    it('validates saturated fat cannot exceed total fat', () => {
      const invalidData = {
        name: 'Food',
        calories: 100,
        protein_grams: 0,
        carbs_total_grams: 0,
        fat_total_grams: 5,
        fat_saturated_grams: 10,
      }
      
      const result = manualFoodEntrySchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Saturated fat cannot be more than total fat')
        expect(result.error.issues[0].path).toEqual(['fat_saturated_grams'])
      }
    })

    it('validates negative protein', () => {
      const invalidData = {
        name: 'Food',
        calories: 100,
        protein_grams: -5,
        carbs_total_grams: 0,
        fat_total_grams: 0,
      }
      
      const result = manualFoodEntrySchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Protein cannot be negative')
      }
    })

    it('allows optional fields to be omitted', () => {
      const validData = {
        name: 'Simple Food',
        calories: 100,
        protein_grams: 10,
        carbs_total_grams: 20,
        fat_total_grams: 5,
      }
      
      const result = manualFoodEntrySchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('macroGoalSchema', () => {
    it('validates correct macro goals', () => {
      const validData = {
        daily_calorie_goal: 2000,
        protein_percentage: 30,
        carbs_percentage: 40,
        fat_percentage: 30,
      }
      
      const result = macroGoalSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('validates minimum calorie goal', () => {
      const invalidData = {
        daily_calorie_goal: 700,
        protein_percentage: 30,
        carbs_percentage: 40,
        fat_percentage: 30,
      }
      
      const result = macroGoalSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Daily calorie goal must be at least 800')
      }
    })

    it('validates maximum calorie goal', () => {
      const invalidData = {
        daily_calorie_goal: 10001,
        protein_percentage: 30,
        carbs_percentage: 40,
        fat_percentage: 30,
      }
      
      const result = macroGoalSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Daily calorie goal must be less than 10,000')
      }
    })

    it('validates calories are integers', () => {
      const invalidData = {
        daily_calorie_goal: 2000.5,
        protein_percentage: 30,
        carbs_percentage: 40,
        fat_percentage: 30,
      }
      
      const result = macroGoalSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Daily calorie goal must be a whole number')
      }
    })

    it('validates percentages add up to 100', () => {
      const invalidData = {
        daily_calorie_goal: 2000,
        protein_percentage: 30,
        carbs_percentage: 40,
        fat_percentage: 40, // Total = 110%
      }
      
      const result = macroGoalSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Protein, carbs, and fat percentages must add up to 100%')
        expect(result.error.issues[0].path).toEqual(['protein_percentage'])
      }
    })

    it('allows small floating point differences in percentages', () => {
      const validData = {
        daily_calorie_goal: 2000,
        protein_percentage: 30.05,
        carbs_percentage: 39.95,
        fat_percentage: 30,
      }
      
      const result = macroGoalSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('validates minimum protein percentage', () => {
      const invalidData = {
        daily_calorie_goal: 2000,
        protein_percentage: 5,
        carbs_percentage: 45,
        fat_percentage: 50,
      }
      
      const result = macroGoalSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Protein percentage must be at least 10%')
      }
    })

    it('validates maximum protein percentage', () => {
      const invalidData = {
        daily_calorie_goal: 2000,
        protein_percentage: 75,
        carbs_percentage: 15,
        fat_percentage: 10,
      }
      
      const result = macroGoalSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Protein percentage must be less than 70%')
      }
    })
  })

  describe('imageUploadSchema', () => {
    it('validates correct image file', () => {
      const validFile = new File(['fake content'], 'test.jpg', { type: 'image/jpeg' })
      Object.defineProperty(validFile, 'size', { value: 1024 * 1024 }) // 1MB
      
      const validData = {
        file: validFile,
      }
      
      const result = imageUploadSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('validates maximum file size', () => {
      const largeFile = new File(['fake content'], 'test.jpg', { type: 'image/jpeg' })
      Object.defineProperty(largeFile, 'size', { value: 6 * 1024 * 1024 }) // 6MB
      
      const invalidData = {
        file: largeFile,
      }
      
      const result = imageUploadSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('File size must be less than 5MB')
      }
    })

    it('validates file type', () => {
      const invalidFile = new File(['fake content'], 'test.txt', { type: 'text/plain' })
      Object.defineProperty(invalidFile, 'size', { value: 1024 })
      
      const invalidData = {
        file: invalidFile,
      }
      
      const result = imageUploadSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('File must be a JPEG, PNG, or WebP image')
      }
    })

    it('accepts PNG files', () => {
      const pngFile = new File(['fake content'], 'test.png', { type: 'image/png' })
      Object.defineProperty(pngFile, 'size', { value: 1024 })
      
      const validData = {
        file: pngFile,
      }
      
      const result = imageUploadSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('accepts WebP files', () => {
      const webpFile = new File(['fake content'], 'test.webp', { type: 'image/webp' })
      Object.defineProperty(webpFile, 'size', { value: 1024 })
      
      const validData = {
        file: webpFile,
      }
      
      const result = imageUploadSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('accepts JPG files', () => {
      const jpgFile = new File(['fake content'], 'test.jpg', { type: 'image/jpg' })
      Object.defineProperty(jpgFile, 'size', { value: 1024 })
      
      const validData = {
        file: jpgFile,
      }
      
      const result = imageUploadSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })
})