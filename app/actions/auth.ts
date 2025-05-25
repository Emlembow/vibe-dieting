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

    // Create a server-side Supabase client
    const supabase = createServerClient()

    // Create the user
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm for better testing experience
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    // Create the profile using the server client (bypasses RLS)
    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      username,
    })

    if (profileError) {
      console.error("Error creating profile:", profileError)
      return {
        success: false,
        error: `Error creating profile: ${profileError.message}`,
      }
    }

    return {
      success: true,
      message: "Account created successfully! You can now sign in.",
    }
  } catch (error: any) {
    console.error("Registration error:", error)
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    }
  }
}
