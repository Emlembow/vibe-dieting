import { z } from "zod"

// Validation schema for text-based nutrition requests
export const nutritionRequestSchema = z.object({
  foodName: z
    .string()
    .min(1, "Food name is required")
    .max(200, "Food name is too long")
    .transform((val) => val.trim()),
})

// Validation schema for image-based nutrition requests
export const nutritionImageRequestSchema = z.object({
  foodImage: z
    .instanceof(File)
    .refine((file) => file.size <= 20 * 1024 * 1024, {
      message: "Image must be less than 20MB",
    })
    .refine(
      (file) => ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type),
      {
        message: "Only JPEG, PNG, and WebP images are allowed",
      }
    ),
})

// Helper function to sanitize user input
export function sanitizeInput(input: string): string {
  // Remove any potential script tags or HTML
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]*>/g, "")
    .trim()
}