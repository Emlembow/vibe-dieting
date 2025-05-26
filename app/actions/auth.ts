"use server"

import { createServerClient } from "@/lib/supabase"

export async function registerUser(formData: FormData) {
  try {
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const username = formData.get("username") as string

    if (!email || !password || !username) {
      return {
        success: false,
        error: "Email, password, and username are required",
      }
    }

    // Validate password strength
    if (password.length < 6) {
      return {
        success: false,
        error: "Password must be at least 6 characters",
      }
    }

    // Create a server-side Supabase client (now using anon key)
    const supabase = createServerClient()

    // Create the user account using standard auth (not admin)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
        }
      }
    })

    if (authError) {
      return {
        success: false,
        error: authError.message,
      }
    }

    if (!authData.user) {
      return {
        success: false,
        error: "Failed to create user",
      }
    }

    // Profile will be created automatically by database trigger
    // No need to manually insert it here

    return {
      success: true,
      message: "Account created successfully! Please check your email to verify your account.",
    }
  } catch (error: any) {
    console.error("Registration error:", error)
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    }
  }
}
