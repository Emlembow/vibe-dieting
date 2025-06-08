"use client"

import type { TrendSummary } from "@/app/actions/trends"

interface MacroDistributionProps {
  summary: TrendSummary
}

export default function MacroDistribution({ summary }: MacroDistributionProps) {
  if (!summary || summary.totalDays === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        No data available
      </div>
    )
  }

  return (
    <>
      <div className="flex justify-center">
        <div className="relative h-[200px] w-[200px]">
          {/* SVG Donut Chart */}
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            {/* Background circle */}
            <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--muted))" strokeWidth="12" />

            {/* Protein segment */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="hsl(142.1, 76.2%, 36.3%)"
              strokeWidth="12"
              strokeDasharray={`${(summary.proteinPercentage * 251.2) / 100} 251.2`}
              strokeLinecap="round"
            />

            {/* Carbs segment */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="hsl(262.1, 83.3%, 57.8%)"
              strokeWidth="12"
              strokeDasharray={`${(summary.carbsPercentage * 251.2) / 100} 251.2`}
              strokeDashoffset={`-${(summary.proteinPercentage * 251.2) / 100}`}
              strokeLinecap="round"
            />

            {/* Fat segment */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="hsl(48, 96.5%, 53.1%)"
              strokeWidth="12"
              strokeDasharray={`${(summary.fatPercentage * 251.2) / 100} 251.2`}
              strokeDashoffset={`-${((summary.proteinPercentage + summary.carbsPercentage) * 251.2) / 100}`}
              strokeLinecap="round"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold">{summary.avgCalories.toLocaleString()}</span>
            <span className="text-xs text-muted-foreground">avg. calories</span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="flex items-center justify-center">
            <div className="h-3 w-3 rounded-full bg-green-500 mr-1.5"></div>
            <span className="text-sm font-medium">Protein</span>
          </div>
          <div className="mt-1 text-2xl font-bold">{summary.proteinPercentage}%</div>
          <div className="text-xs text-muted-foreground">{summary.avgProtein}g avg.</div>
        </div>
        <div>
          <div className="flex items-center justify-center">
            <div className="h-3 w-3 rounded-full bg-purple-500 mr-1.5"></div>
            <span className="text-sm font-medium">Carbs</span>
          </div>
          <div className="mt-1 text-2xl font-bold">{summary.carbsPercentage}%</div>
          <div className="text-xs text-muted-foreground">{summary.avgCarbs}g avg.</div>
        </div>
        <div>
          <div className="flex items-center justify-center">
            <div className="h-3 w-3 rounded-full bg-yellow-500 mr-1.5"></div>
            <span className="text-sm font-medium">Fat</span>
          </div>
          <div className="mt-1 text-2xl font-bold">{summary.fatPercentage}%</div>
          <div className="text-xs text-muted-foreground">{summary.avgFat}g avg.</div>
        </div>
      </div>
    </>
  )
}