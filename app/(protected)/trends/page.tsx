"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { format, subDays, addDays, parseISO, eachDayOfInterval } from "date-fns"
import { CalendarIcon, TrendingUp, TrendingDown, Target, Activity } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/context/auth-context"
import { supabase } from "@/lib/supabase"
import type { MacroGoal, FoodEntry, YoloDay } from "@/types/database"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line, ReferenceLine } from "recharts"

type TrendData = {
  date: string
  calories: number
  protein: number
  carbs: number
  fat: number
  isYoloDay?: boolean
}

type TrendSummary = {
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

export default function TrendsPage() {
  const { user } = useAuth()
  const [dateRange, setDateRange] = useState<{
    from: Date
    to: Date
  }>({
    from: subDays(new Date(), 7),
    to: new Date(),
  })
  const [interval, setInterval] = useState<"day" | "week" | "month">("day")
  const [isLoading, setIsLoading] = useState(true)
  const [trendData, setTrendData] = useState<TrendData[]>([])
  const [summary, setSummary] = useState<TrendSummary | null>(null)
  const [macroGoal, setMacroGoal] = useState<MacroGoal | null>(null)
  const { toast } = useToast()

  // Fetch data when date range changes
  useEffect(() => {
    if (!user) return
    
    const fetchTrendData = async () => {
      setIsLoading(true)
      try {
        // Format dates for Supabase query
        const startDateStr = format(dateRange.from, "yyyy-MM-dd")
        const endDateStr = format(dateRange.to, "yyyy-MM-dd")

        // Fetch food entries for the date range
        const { data: entriesData, error: entriesError } = await supabase
          .from("food_entries")
          .select("*")
          .eq("user_id", user.id)
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
          .eq("user_id", user.id)
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
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single()

        if (goalError && goalError.code !== "PGRST116") {
          console.error("Error fetching macro goals:", goalError)
        }

        // Generate array of all days in the range
        const daysInRange = eachDayOfInterval({ start: dateRange.from, end: dateRange.to })

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

          if (totalMacroCalories > 0) {
            summary.proteinPercentage = Math.round((proteinCalories / totalMacroCalories) * 100)
            summary.carbsPercentage = Math.round((carbsCalories / totalMacroCalories) * 100)
            summary.fatPercentage = Math.round((fatCalories / totalMacroCalories) * 100)
          }
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

        setTrendData(dailyTotals)
        setSummary(summary)
        setMacroGoal(goalData as MacroGoal | null)
      } catch (error) {
        console.error("Error fetching trend data:", error)
        toast({
          title: "Error",
          description: "Failed to load trend data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrendData()
  }, [dateRange, toast, user])


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
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    setDateRange({
                      from: range.from,
                      to: range.to
                    })
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Select value={interval} onValueChange={(value: "day" | "week" | "month") => setInterval(value)}>
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

      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Average Calories</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{summary.avgCalories.toLocaleString()}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">per day</p>
                </div>
                <Activity className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Average Protein</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">{summary.avgProtein}g</p>
                  <Badge variant="outline" className="text-xs border-green-300 text-green-600 dark:border-green-700 dark:text-green-400">
                    {summary.proteinPercentage}% of intake
                  </Badge>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950 dark:to-violet-950 border-purple-200 dark:border-purple-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Average Carbs</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{summary.avgCarbs}g</p>
                  <Badge variant="outline" className="text-xs border-purple-300 text-purple-600 dark:border-purple-700 dark:text-purple-400">
                    {summary.carbsPercentage}% of intake
                  </Badge>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 border-yellow-200 dark:border-yellow-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Average Fat</p>
                  <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{summary.avgFat}g</p>
                  <Badge variant="outline" className="text-xs border-yellow-300 text-yellow-600 dark:border-yellow-700 dark:text-yellow-400">
                    {summary.fatPercentage}% of intake
                  </Badge>
                </div>
                <Target className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500" />
                Calorie Intake
              </CardTitle>
              <CardDescription>Your daily calorie consumption over time {macroGoal && `(Goal: ${macroGoal.daily_calorie_goal} cal/day)`}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                {isLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
                  </div>
                ) : trendData.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                    <Activity className="h-12 w-12 mb-4 opacity-50" />
                    <p className="text-lg font-semibold">No data available</p>
                    <p className="text-sm">Start logging your food to see trends</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis 
                        dataKey="date" 
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        interval={0}
                        tick={{ fontSize: 12 }}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        domain={[0, 'dataMax + 100']}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <Tooltip 
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload
                            if (data.isYoloDay) {
                              return (
                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                  <div className="grid gap-2">
                                    <div className="flex items-center gap-2">
                                      <div className="flex flex-col">
                                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                                          {label}
                                        </span>
                                        <span className="font-bold text-pink-500">
                                          YOLO Day! 🎉
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                          No tracking needed
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )
                            }
                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-sm">
                                <div className="grid gap-2">
                                  <div className="flex items-center gap-2">
                                    <div className="flex flex-col">
                                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                                        {label}
                                      </span>
                                      <span className="font-bold">
                                        {payload[0].value} cal
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      {macroGoal && (
                        <ReferenceLine
                          y={macroGoal.daily_calorie_goal}
                          stroke="#3b82f6"
                          strokeDasharray="5 5"
                          strokeWidth={2}
                          label={{
                            value: "Goal",
                            position: "right",
                            fill: "#3b82f6",
                            fontSize: 12,
                          }}
                        />
                      )}
                      <Line
                        type="monotone"
                        dataKey="calories"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={(props: any) => {
                          const { cx, cy, payload } = props
                          if (payload.isYoloDay) {
                            // Star shape for YOLO days
                            const size = 6
                            const innerRadius = size * 0.4
                            const points = []
                            
                            for (let i = 0; i < 10; i++) {
                              const angle = (i * Math.PI) / 5 - Math.PI / 2
                              const radius = i % 2 === 0 ? size : innerRadius
                              const x = cx + radius * Math.cos(angle)
                              const y = cy + radius * Math.sin(angle)
                              points.push(`${x},${y}`)
                            }
                            
                            return (
                              <g>
                                <polygon 
                                  points={points.join(' ')} 
                                  fill="#ec4899" 
                                  stroke="#ec4899"
                                  strokeWidth="1"
                                />
                                <title>YOLO Day!</title>
                              </g>
                            )
                          }
                          return <circle cx={cx} cy={cy} r={5} fill="#3b82f6" strokeWidth={2} />
                        }}
                        activeDot={{ r: 7, fill: "#1d4ed8" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="protein" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Protein Intake
              </CardTitle>
              <CardDescription>
                Your daily protein consumption in grams 
                {macroGoal && (
                  ` (Goal: ${Math.round((macroGoal.daily_calorie_goal * (macroGoal.protein_percentage / 100)) / 4)}g/day)`
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                {isLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
                  </div>
                ) : trendData.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mb-4 opacity-50" />
                    <p className="text-lg font-semibold">No data available</p>
                    <p className="text-sm">Start logging your food to see trends</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis 
                        dataKey="date" 
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        interval={0}
                        tick={{ fontSize: 12 }}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        domain={[0, 'dataMax + 10']}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <Tooltip 
                        formatter={(value: number) => [`${value}g`, 'Protein']}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      {macroGoal && (
                        <ReferenceLine
                          y={Math.round((macroGoal.daily_calorie_goal * (macroGoal.protein_percentage / 100)) / 4)}
                          stroke="#10b981"
                          strokeDasharray="5 5"
                          strokeWidth={2}
                          label={{
                            value: "Goal",
                            position: "right",
                            fill: "#10b981",
                            fontSize: 12,
                          }}
                        />
                      )}
                      <Line
                        type="monotone"
                        dataKey="protein"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={{ fill: "#10b981", strokeWidth: 2, r: 5 }}
                        activeDot={{ r: 7, fill: "#059669" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="carbs" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                Carbohydrate Intake
              </CardTitle>
              <CardDescription>
                Your daily carbohydrate consumption in grams
                {macroGoal && (
                  ` (Goal: ${Math.round((macroGoal.daily_calorie_goal * (macroGoal.carbs_percentage / 100)) / 4)}g/day)`
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                {isLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
                  </div>
                ) : trendData.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mb-4 opacity-50" />
                    <p className="text-lg font-semibold">No data available</p>
                    <p className="text-sm">Start logging your food to see trends</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis 
                        dataKey="date" 
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        interval={0}
                        tick={{ fontSize: 12 }}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        domain={[0, 'dataMax + 10']}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <Tooltip 
                        formatter={(value: number) => [`${value}g`, 'Carbs']}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      {macroGoal && (
                        <ReferenceLine
                          y={Math.round((macroGoal.daily_calorie_goal * (macroGoal.carbs_percentage / 100)) / 4)}
                          stroke="#8b5cf6"
                          strokeDasharray="5 5"
                          strokeWidth={2}
                          label={{
                            value: "Goal",
                            position: "right",
                            fill: "#8b5cf6",
                            fontSize: 12,
                          }}
                        />
                      )}
                      <Line
                        type="monotone"
                        dataKey="carbs"
                        stroke="#8b5cf6"
                        strokeWidth={3}
                        dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 5 }}
                        activeDot={{ r: 7, fill: "#7c3aed" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fat" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-yellow-500" />
                Fat Intake
              </CardTitle>
              <CardDescription>
                Your daily fat consumption in grams
                {macroGoal && (
                  ` (Goal: ${Math.round((macroGoal.daily_calorie_goal * (macroGoal.fat_percentage / 100)) / 9)}g/day)`
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                {isLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
                  </div>
                ) : trendData.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                    <Target className="h-12 w-12 mb-4 opacity-50" />
                    <p className="text-lg font-semibold">No data available</p>
                    <p className="text-sm">Start logging your food to see trends</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis 
                        dataKey="date" 
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        interval={0}
                        tick={{ fontSize: 12 }}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        domain={[0, 'dataMax + 10']}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <Tooltip 
                        formatter={(value: number) => [`${value}g`, 'Fat']}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      {macroGoal && (
                        <ReferenceLine
                          y={Math.round((macroGoal.daily_calorie_goal * (macroGoal.fat_percentage / 100)) / 9)}
                          stroke="#eab308"
                          strokeDasharray="5 5"
                          strokeWidth={2}
                          label={{
                            value: "Goal",
                            position: "right",
                            fill: "#eab308",
                            fontSize: 12,
                          }}
                        />
                      )}
                      <Line
                        type="monotone"
                        dataKey="fat"
                        stroke="#eab308"
                        strokeWidth={3}
                        dot={{ fill: "#eab308", strokeWidth: 2, r: 5 }}
                        activeDot={{ r: 7, fill: "#ca8a04" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900 dark:to-gray-900 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              Macro Distribution
            </CardTitle>
            <CardDescription>Average macronutrient breakdown for selected period</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-[300px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
              </div>
            ) : summary ? (
              <>
                <div className="flex justify-center">
                  <div className="relative h-[200px] w-[200px]">
                    {/* SVG Donut Chart */}
                    <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90 drop-shadow-lg">
                      {/* Background circle */}
                      <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />

                      {/* Protein segment */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="10"
                        strokeDasharray={`${(summary.proteinPercentage * 251.2) / 100} 251.2`}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />

                      {/* Carbs segment */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#8b5cf6"
                        strokeWidth="10"
                        strokeDasharray={`${(summary.carbsPercentage * 251.2) / 100} 251.2`}
                        strokeDashoffset={`-${(summary.proteinPercentage * 251.2) / 100}`}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />

                      {/* Fat segment */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#eab308"
                        strokeWidth="10"
                        strokeDasharray={`${(summary.fatPercentage * 251.2) / 100} 251.2`}
                        strokeDashoffset={`-${((summary.proteinPercentage + summary.carbsPercentage) * 251.2) / 100}`}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{summary.avgCalories.toLocaleString()}</span>
                      <span className="text-xs text-slate-600 dark:text-slate-400">avg. calories</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                  <div className="bg-card rounded-lg p-3 shadow-sm border border-border">
                    <div className="flex items-center justify-center mb-2">
                      <div className="h-3 w-3 rounded-full bg-green-500 mr-1.5"></div>
                      <span className="text-sm font-medium text-card-foreground">Protein</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{summary.proteinPercentage}%</div>
                    <div className="text-xs text-muted-foreground">{summary.avgProtein}g avg.</div>
                  </div>
                  <div className="bg-card rounded-lg p-3 shadow-sm border border-border">
                    <div className="flex items-center justify-center mb-2">
                      <div className="h-3 w-3 rounded-full bg-purple-500 mr-1.5"></div>
                      <span className="text-sm font-medium text-card-foreground">Carbs</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{summary.carbsPercentage}%</div>
                    <div className="text-xs text-muted-foreground">{summary.avgCarbs}g avg.</div>
                  </div>
                  <div className="bg-card rounded-lg p-3 shadow-sm border border-border">
                    <div className="flex items-center justify-center mb-2">
                      <div className="h-3 w-3 rounded-full bg-yellow-500 mr-1.5"></div>
                      <span className="text-sm font-medium text-card-foreground">Fat</span>
                    </div>
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{summary.fatPercentage}%</div>
                    <div className="text-xs text-muted-foreground">{summary.avgFat}g avg.</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex h-[300px] flex-col items-center justify-center text-muted-foreground">
                <Target className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg font-semibold">No data available</p>
                <p className="text-sm">Start logging your food to see trends</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900 dark:to-teal-900 border-emerald-200 dark:border-emerald-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Goal Completion
            </CardTitle>
            <CardDescription>How often you've met your nutrition goals (within 90% of target)</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-[300px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
              </div>
            ) : summary && macroGoal ? (
              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col items-center justify-center">
                  <div className="relative h-32 w-32">
                    <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90 drop-shadow-lg">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="10"
                        strokeDasharray={`${(summary.calorieGoalMet * 251.2) / 100} 251.2`}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{summary.calorieGoalMet}%</span>
                      <span className="text-xs text-muted-foreground">of days</span>
                    </div>
                  </div>
                  <div className="mt-2 text-center">
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Calorie Goals Met</span>
                    <p className="text-xs text-muted-foreground">Daily targets achieved</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-card rounded-lg p-3 shadow-sm border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-green-500 mr-1.5"></div>
                        <span className="text-sm font-medium text-card-foreground">Protein</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {summary.proteinGoalMet}%
                      </Badge>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-green-500 transition-all duration-500" 
                        style={{ width: `${summary.proteinGoalMet}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-card rounded-lg p-3 shadow-sm border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-purple-500 mr-1.5"></div>
                        <span className="text-sm font-medium text-card-foreground">Carbs</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {summary.carbsGoalMet}%
                      </Badge>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-purple-500 transition-all duration-500" 
                        style={{ width: `${summary.carbsGoalMet}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-card rounded-lg p-3 shadow-sm border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-yellow-500 mr-1.5"></div>
                        <span className="text-sm font-medium text-card-foreground">Fat</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {summary.fatGoalMet}%
                      </Badge>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-yellow-500 transition-all duration-500" 
                        style={{ width: `${summary.fatGoalMet}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-[300px] flex-col items-center justify-center text-muted-foreground">
                <TrendingDown className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg font-semibold">{!macroGoal ? "Set your macro goals" : "No data available"}</p>
                <p className="text-sm">{!macroGoal ? "Configure your targets to track completion" : "Start logging your food to see trends"}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}