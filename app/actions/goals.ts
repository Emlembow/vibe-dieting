"use server"

import { createServerClient } from "@/lib/supabase"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import type { MacroGoal } from "@/types/database"
import { macroGoalSchema } from "@/lib/validations"

export async function getGoalsData() {
  const supabase = createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const { data: macroGoal, error } = await supabase
    .from("macro_goals")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle()

  if (error && error.code !== "PGRST116") {
    throw new Error("Failed to fetch macro goals")
  }

  return { macroGoal, user }
}

export async function updateMacroGoals(formData: FormData) {
  const supabase = createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error("Unauthorized")
  }

  // Parse and validate form data
  const rawData = {
    daily_calorie_goal: Number(formData.get("daily_calorie_goal")),
    protein_percentage: Number(formData.get("protein_percentage")),
    carbs_percentage: Number(formData.get("carbs_percentage")),
    fat_percentage: Number(formData.get("fat_percentage")),
  }

  const validationResult = macroGoalSchema.safeParse(rawData)
  
  if (!validationResult.success) {
    return { 
      error: validationResult.error.errors[0]?.message || "Invalid data" 
    }
  }

  const data = validationResult.data

  // Check if goals already exist
  const { data: existingGoal } = await supabase
    .from("macro_goals")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle()

  let result
  
  if (existingGoal) {
    // Update existing goals
    result = await supabase
      .from("macro_goals")
      .update(data)
      .eq("user_id", user.id)
      .select()
      .single()
  } else {
    // Create new goals
    result = await supabase
      .from("macro_goals")
      .insert({
        ...data,
        user_id: user.id,
      })
      .select()
      .single()
  }

  if (result.error) {
    throw new Error("Failed to save macro goals")
  }

  revalidatePath("/goals")
  revalidatePath("/dashboard")
  
  return { success: true, data: result.data }
}