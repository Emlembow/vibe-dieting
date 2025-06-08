"use server"

import { createServerClient } from "@/lib/supabase"
import { redirect } from "next/navigation"
import type { FoodEntry, MacroGoal, YoloDay } from "@/types/database"
import { startOfDay, endOfDay, subDays, eachDayOfInterval } from "date-fns"

export async function getDashboardData(date: Date) {
  const supabase = createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Fetch macro goals
  const { data: macroGoal, error: goalError } = await supabase
    .from("macro_goals")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (goalError && goalError.code !== "PGRST116") {
    throw new Error("Failed to fetch macro goals")
  }

  // Fetch food entries for the selected date
  const startDate = startOfDay(date).toISOString()
  const endDate = endOfDay(date).toISOString()

  const { data: foodEntries, error: entriesError } = await supabase
    .from("food_entries")
    .select("*")
    .eq("user_id", user.id)
    .gte("consumed_at", startDate)
    .lte("consumed_at", endDate)
    .order("consumed_at", { ascending: false })

  if (entriesError) {
    throw new Error("Failed to fetch food entries")
  }

  // Check for YOLO day
  const { data: yoloDay, error: yoloError } = await supabase
    .from("yolo_days")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", date.toISOString().split('T')[0])
    .maybeSingle()

  if (yoloError) {
    console.error("Error fetching YOLO day:", yoloError)
  }

  return {
    macroGoal: macroGoal || null,
    foodEntries: foodEntries || [],
    yoloDay: yoloDay || null,
    user
  }
}

export async function getWeeklyData() {
  const supabase = createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return []
  }

  const endDate = new Date()
  const startDate = subDays(endDate, 6)
  const days = eachDayOfInterval({ start: startDate, end: endDate })

  const weeklyData = await Promise.all(
    days.map(async (day) => {
      const dayStart = startOfDay(day).toISOString()
      const dayEnd = endOfDay(day).toISOString()

      const { data: entries } = await supabase
        .from("food_entries")
        .select("calories")
        .eq("user_id", user.id)
        .gte("consumed_at", dayStart)
        .lte("consumed_at", dayEnd)

      const totalCalories = entries?.reduce((sum, entry) => sum + (entry.calories || 0), 0) || 0

      return {
        date: day.toISOString().split('T')[0],
        calories: totalCalories
      }
    })
  )

  return weeklyData
}

export async function deleteFoodEntry(entryId: string) {
  const supabase = createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error("Unauthorized")
  }

  const { error } = await supabase
    .from("food_entries")
    .delete()
    .eq("id", entryId)
    .eq("user_id", user.id)

  if (error) {
    throw new Error("Failed to delete food entry")
  }

  return { success: true }
}

export async function updateFoodEntry(entryId: string, updates: Partial<FoodEntry>) {
  const supabase = createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error("Unauthorized")
  }

  const { data, error } = await supabase
    .from("food_entries")
    .update(updates)
    .eq("id", entryId)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) {
    throw new Error("Failed to update food entry")
  }

  return data
}

export async function toggleYoloDay(date: Date) {
  const supabase = createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error("Unauthorized")
  }

  const dateStr = date.toISOString().split('T')[0]

  // Check if YOLO day exists
  const { data: existingYolo } = await supabase
    .from("yolo_days")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", dateStr)
    .maybeSingle()

  if (existingYolo) {
    // Delete existing YOLO day
    const { error } = await supabase
      .from("yolo_days")
      .delete()
      .eq("id", existingYolo.id)

    if (error) throw new Error("Failed to remove YOLO day")
    
    return { yoloDay: null, isNew: false }
  } else {
    // Create new YOLO day
    const { data, error } = await supabase
      .from("yolo_days")
      .insert({
        user_id: user.id,
        date: dateStr,
        notes: "Living my best life! 🎉"
      })
      .select()
      .single()

    if (error) throw new Error("Failed to create YOLO day")
    
    return { yoloDay: data, isNew: true }
  }
}