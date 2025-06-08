"use client"

import { useState, Suspense, lazy } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { TrendData, TrendSummary } from "@/app/actions/trends"
import type { MacroGoal } from "@/types/database"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"

// Lazy load heavy chart components
const TrendChart = lazy(() => import("./trend-chart"))
const MacroDistribution = lazy(() => import("./macro-distribution"))
const GoalCompletion = lazy(() => import("./goal-completion"))

interface TrendsClientProps {
  initialData: TrendData[]
  initialSummary: TrendSummary
  initialMacroGoal: MacroGoal | null
  initialDateRange: { from: Date; to: Date }
  initialInterval: "day" | "week" | "month"
}

export default function TrendsClient({
  initialData,
  initialSummary,
  initialMacroGoal,
  initialDateRange,
  initialInterval
}: TrendsClientProps) {
  const [dateRange, setDateRange] = useState(initialDateRange)
  const [interval, setInterval] = useState(initialInterval)
  const router = useRouter()

  const handleDateChange = (range: { from?: Date; to?: Date } | undefined) => {
    if (range?.from && range?.to) {
      const newRange = { from: range.from, to: range.to }
      setDateRange(newRange)
      const params = new URLSearchParams()
      params.set('from', format(range.from, 'yyyy-MM-dd'))
      params.set('to', format(range.to, 'yyyy-MM-dd'))
      params.set('interval', interval)
      router.push(`/trends?${params.toString()}`)
    }
  }

  const handleIntervalChange = (value: "day" | "week" | "month") => {
    setInterval(value)
    const params = new URLSearchParams()
    params.set('from', format(dateRange.from, 'yyyy-MM-dd'))
    params.set('to', format(dateRange.to, 'yyyy-MM-dd'))
    params.set('interval', value)
    router.push(`/trends?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nutrition Trends</h1>
          <p className="text-muted-foreground">Analyze your nutrition patterns over time</p>
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(dateRange.from, "MMM d, yyyy")} - {format(dateRange.to, "MMM d, yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={handleDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Select value={interval} onValueChange={handleIntervalChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Interval" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Daily</SelectItem>
              <SelectItem value="week">Weekly</SelectItem>
              <SelectItem value="month">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="calories">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="calories">Calories</TabsTrigger>
          <TabsTrigger value="protein">Protein</TabsTrigger>
          <TabsTrigger value="carbs">Carbs</TabsTrigger>
          <TabsTrigger value="fat">Fat</TabsTrigger>
        </TabsList>

        <TabsContent value="calories" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Calorie Intake</CardTitle>
              <CardDescription>Your daily calorie consumption over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <Suspense fallback={<Skeleton className="h-full w-full" />}>
                  <TrendChart 
                    data={initialData} 
                    dataKey="calories" 
                    label="Calories" 
                    color="#ef4444"
                    formatter={(value: number) => `${value} cal`}
                  />
                </Suspense>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="protein" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Protein Intake</CardTitle>
              <CardDescription>Your daily protein consumption in grams</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <Suspense fallback={<Skeleton className="h-full w-full" />}>
                  <TrendChart 
                    data={initialData} 
                    dataKey="protein" 
                    label="Protein" 
                    color="#10b981"
                    formatter={(value: number) => `${value}g`}
                  />
                </Suspense>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="carbs" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Carbohydrate Intake</CardTitle>
              <CardDescription>Your daily carbohydrate consumption in grams</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <Suspense fallback={<Skeleton className="h-full w-full" />}>
                  <TrendChart 
                    data={initialData} 
                    dataKey="carbs" 
                    label="Carbs" 
                    color="#8b5cf6"
                    formatter={(value: number) => `${value}g`}
                  />
                </Suspense>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fat" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Fat Intake</CardTitle>
              <CardDescription>Your daily fat consumption in grams</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <Suspense fallback={<Skeleton className="h-full w-full" />}>
                  <TrendChart 
                    data={initialData} 
                    dataKey="fat" 
                    label="Fat" 
                    color="#eab308"
                    formatter={(value: number) => `${value}g`}
                  />
                </Suspense>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Macro Distribution</CardTitle>
            <CardDescription>Average macronutrient breakdown for selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
              <MacroDistribution summary={initialSummary} />
            </Suspense>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Goal Completion</CardTitle>
            <CardDescription>How often you've met your nutrition goals</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
              <GoalCompletion summary={initialSummary} macroGoal={initialMacroGoal} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}