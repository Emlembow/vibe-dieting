import { createServerClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Only allow in development environment
    if (process.env.NODE_ENV !== "development") {
      return NextResponse.json(
        { error: "This endpoint is only available in development" },
        { status: 403 }
      )
    }
    // Create a server-side Supabase client
    const supabase = createServerClient()

    const email = "test@example.com"
    const password = "password123"
    const username = "testuser"

    // First, try to delete the user if it exists (to start fresh)
    try {
      const { data: existingUser } = await supabase.from("auth.users").select("id").eq("email", email).single()

      if (existingUser) {
        await supabase.auth.admin.deleteUser(existingUser.id)
      }
    } catch (error) {
    }

    // Create a new user with the admin API
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (error) {
      throw error
    }

    const userId = data.user.id

    // Create a profile for the user using the server client (bypasses RLS)
    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      username,
      full_name: "Test User",
    })

    if (profileError) {
    }

    // Add macro goals
    const { error: goalsError } = await supabase.from("macro_goals").insert({
      user_id: userId,
      daily_calorie_goal: 2000,
      protein_percentage: 30,
      carbs_percentage: 40,
      fat_percentage: 30,
    })

    if (goalsError) {
    }

    // Add food entries
    const today = new Date().toISOString().split("T")[0]
    const { error: entriesError } = await supabase.from("food_entries").insert([
      {
        user_id: userId,
        date: today,
        name: "Grilled Chicken Breast",
        description: "Boneless, skinless chicken breast grilled with minimal oil",
        calories: 165,
        protein_grams: 31,
        carbs_total_grams: 0,
        carbs_fiber_grams: 0,
        carbs_sugar_grams: 0,
        fat_total_grams: 3.6,
        fat_saturated_grams: 1,
      },
      {
        user_id: userId,
        date: today,
        name: "Brown Rice",
        description: "Cooked brown rice, medium grain",
        calories: 218,
        protein_grams: 4.5,
        carbs_total_grams: 45.8,
        carbs_fiber_grams: 3.5,
        carbs_sugar_grams: 0.7,
        fat_total_grams: 1.6,
        fat_saturated_grams: 0.3,
      },
    ])

    if (entriesError) {
    }

    return NextResponse.json({
      success: true,
      message: "Test user created successfully. You can now log in with these credentials.",
      credentials: {
        email,
        password,
      },
    })
  } catch (error: any) {
    console.error("Error creating test user:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create test user",
      },
      { status: 500 },
    )
  }
}
