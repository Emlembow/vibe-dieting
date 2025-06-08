"use server"

import { createServerClient } from "@/lib/supabase"
import { cookies } from "next/headers"
import { format, eachDayOfInterval, parseISO } from "date-fns"
import type { FoodEntry, MacroGoal, YoloDay } from "@/types/database"

export type TrendData = {
  date: string
  calories: number
  protein: number
  carbs: number
  fat: number
  isYoloDay?: boolean
}

export type TrendSummary = {
  avgCalories: number
  avgProtein: number
  avgCarbs: number
  avgFat: number
  proteinPercentage: number
  carbsPercentage: number
  fatPercentage: number
  calorieGoalMet: number
  proteinGoalMet: number
  carbsGoalMet: number
  fatGoalMet: number
  totalDays: number
}

export async function getTrendData(startDate: Date, endDate: Date, userId: string) {
  // Use service role client for server actions
  const supabase = createServerClient()

  // Format dates for Supabase query
  const startDateStr = format(startDate, "yyyy-MM-dd")
  const endDateStr = format(endDate, "yyyy-MM-dd")

  // Fetch food entries for the date range
  const { data: entriesData, error: entriesError } = await supabase
    .from("food_entries")
    .select("*")
    .eq("user_id", userId)
    .gte("date", startDateStr)
    .lte("date", endDateStr)
    .order("date", { ascending: true })

  if (entriesError) {
    console.error("Error fetching food entries:", entriesError)
    throw new Error("Failed to fetch trend data")
  }

  // Fetch YOLO days for the date range
  const { data: yoloDaysData, error: yoloDaysError } = await supabase
    .from("yolo_days")
    .select("*")
    .eq("user_id", userId)
    .gte("date", startDateStr)
    .lte("date", endDateStr)

  if (yoloDaysError) {
    console.error("Error fetching YOLO days:", yoloDaysError)
  }

  // Create a set of YOLO day dates for quick lookup
  const yoloDayDates = new Set(
    yoloDaysData?.map((yoloDay: YoloDay) => yoloDay.date) || []
  )

  // Fetch user's macro goals
  const { data: goalData, error: goalError } = await supabase
    .from("macro_goals")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (goalError && goalError.code !== "PGRST116") {
    console.error("Error fetching macro goals:", goalError)
  }

  // Generate array of all days in the range
  const daysInRange = eachDayOfInterval({ start: startDate, end: endDate })

  // Initialize daily totals with zeros
  const dailyTotals: TrendData[] = daysInRange.map((day) => {
    const dateStr = format(day, "yyyy-MM-dd")
    return {
      date: format(day, "MMM dd"),
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      isYoloDay: yoloDayDates.has(dateStr),
    }
  })

  // Sum up the entries for each day
  if (entriesData && entriesData.length > 0) {
    entriesData.forEach((entry: FoodEntry) => {
      const entryDate = parseISO(entry.date)
      const dayIndex = daysInRange.findIndex(
        (day) => format(day, "yyyy-MM-dd") === format(entryDate, "yyyy-MM-dd")
      )

      if (dayIndex !== -1) {
        dailyTotals[dayIndex].calories += entry.calories
        dailyTotals[dayIndex].protein += Number(entry.protein_grams)
        dailyTotals[dayIndex].carbs += Number(entry.carbs_total_grams)
        dailyTotals[dayIndex].fat += Number(entry.fat_total_grams)
      }
    })
  }

  // Calculate summary statistics
  // Include YOLO days as days with data (they count as completed days)
  const daysWithData = dailyTotals.filter((day) => day.calories > 0 || day.isYoloDay)
  const totalDays = daysWithData.length || 1

  // For averages, exclude YOLO days (they have 0 calories but that's not representative)
  const daysWithActualData = daysWithData.filter((day) => !day.isYoloDay && day.calories > 0)
  const avgDays = daysWithActualData.length || 1

  const summary: TrendSummary = {
    avgCalories: Math.round(
      daysWithActualData.reduce((sum, day) => sum + day.calories, 0) / avgDays
    ),
    avgProtein: Math.round(
      daysWithActualData.reduce((sum, day) => sum + day.protein, 0) / avgDays
    ),
    avgCarbs: Math.round(
      daysWithActualData.reduce((sum, day) => sum + day.carbs, 0) / avgDays
    ),
    avgFat: Math.round(daysWithActualData.reduce((sum, day) => sum + day.fat, 0) / avgDays),
    proteinPercentage: 0,
    carbsPercentage: 0,
    fatPercentage: 0,
    calorieGoalMet: 0,
    proteinGoalMet: 0,
    carbsGoalMet: 0,
    fatGoalMet: 0,
    totalDays: totalDays,
  }

  // Calculate macro percentages based on average calories
  if (summary.avgCalories > 0) {
    const proteinCalories = summary.avgProtein * 4
    const carbsCalories = summary.avgCarbs * 4
    const fatCalories = summary.avgFat * 9
    const totalMacroCalories = proteinCalories + carbsCalories + fatCalories

    summary.proteinPercentage = Math.round((proteinCalories / totalMacroCalories) * 100)
    summary.carbsPercentage = Math.round((carbsCalories / totalMacroCalories) * 100)
    summary.fatPercentage = Math.round((fatCalories / totalMacroCalories) * 100)
  }

  // Calculate goal completion rates if goals exist
  if (goalData) {
    const proteinTarget = (goalData.daily_calorie_goal * (goalData.protein_percentage / 100)) / 4
    const carbsTarget = (goalData.daily_calorie_goal * (goalData.carbs_percentage / 100)) / 4
    const fatTarget = (goalData.daily_calorie_goal * (goalData.fat_percentage / 100)) / 9

    let calorieGoalDays = 0
    let proteinGoalDays = 0
    let carbsGoalDays = 0
    let fatGoalDays = 0

    daysWithData.forEach((day) => {
      // YOLO days count as meeting all goals
      if (day.isYoloDay) {
        calorieGoalDays++
        proteinGoalDays++
        carbsGoalDays++
        fatGoalDays++
      } else {
        if (day.calories >= goalData.daily_calorie_goal * 0.9) calorieGoalDays++
        if (day.protein >= proteinTarget * 0.9) proteinGoalDays++
        if (day.carbs >= carbsTarget * 0.9) carbsGoalDays++
        if (day.fat >= fatTarget * 0.9) fatGoalDays++
      }
    })

    summary.calorieGoalMet = Math.round((calorieGoalDays / totalDays) * 100)
    summary.proteinGoalMet = Math.round((proteinGoalDays / totalDays) * 100)
    summary.carbsGoalMet = Math.round((carbsGoalDays / totalDays) * 100)
    summary.fatGoalMet = Math.round((fatGoalDays / totalDays) * 100)
  }

  return {
    dailyTotals,
    summary,
    macroGoal: goalData as MacroGoal | null,
  }
}