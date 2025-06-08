"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface WeeklyChartProps {
  data: Array<{ date: string; calories: number }>
  goal: number
}

export default function WeeklyChart({ data, goal }: WeeklyChartProps) {
  const chartConfig = {
    calories: {
      label: "Calories",
      color: "hsl(var(--chart-1))",
    },
  }

  return (
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(date) => new Date(date).toLocaleDateString('en', { weekday: 'short' })}
            className="text-xs"
          />
          <YAxis className="text-xs" />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(date) => new Date(date).toLocaleDateString('en', { 
                  weekday: 'long', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              />
            }
          />
          <ReferenceLine y={goal} stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" />
          <Line
            type="monotone"
            dataKey="calories"
            stroke="var(--color-calories)"
            strokeWidth={2}
            dot={{ fill: "var(--color-calories)" }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}