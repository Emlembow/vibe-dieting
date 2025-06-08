"use client"

import type { TrendSummary } from "@/app/actions/trends"
import type { MacroGoal } from "@/types/database"

interface GoalCompletionProps {
  summary: TrendSummary
  macroGoal: MacroGoal | null
}

export default function GoalCompletion({ summary, macroGoal }: GoalCompletionProps) {
  if (!summary || !macroGoal) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        {!macroGoal ? "Set your macro goals to track completion" : "No data available"}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="flex flex-col items-center justify-center">
        <div className="relative h-32 w-32">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--muted))" strokeWidth="12" />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="12"
              strokeDasharray={`${(summary.calorieGoalMet * 251.2) / 100} 251.2`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold">{summary.calorieGoalMet}%</span>
          </div>
        </div>
        <span className="mt-2 text-sm font-medium">Calories</span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-3 w-3 rounded-full bg-green-500 mr-1.5"></div>
            <span className="text-sm font-medium">Protein</span>
          </div>
          <span className="font-medium">{summary.proteinGoalMet}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted">
          <div className="h-full rounded-full bg-green-500" style={{ width: `${summary.proteinGoalMet}%` }}></div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-3 w-3 rounded-full bg-purple-500 mr-1.5"></div>
            <span className="text-sm font-medium">Carbs</span>
          </div>
          <span className="font-medium">{summary.carbsGoalMet}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted">
          <div className="h-full rounded-full bg-purple-500" style={{ width: `${summary.carbsGoalMet}%` }}></div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-3 w-3 rounded-full bg-yellow-500 mr-1.5"></div>
            <span className="text-sm font-medium">Fat</span>
          </div>
          <span className="font-medium">{summary.fatGoalMet}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted">
          <div className="h-full rounded-full bg-yellow-500" style={{ width: `${summary.fatGoalMet}%` }}></div>
        </div>
      </div>
    </div>
  )
}