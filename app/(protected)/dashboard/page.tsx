"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"
import { supabase } from "@/lib/supabase"
import type { FoodEntry, MacroGoal, YoloDay } from "@/types/database"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"
import { format, subDays, parseISO, eachDayOfInterval } from "date-fns"
import { CalendarIcon, Plus, Trash2, ArrowRight, Settings, Clock, Pencil, PartyPopper } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { EditFoodDialog } from "@/components/edit-food-dialog"
import { YoloDayDialog } from "@/components/yolo-day-dialog"
import { YoloDayDisplay } from "@/components/yolo-day-display"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export default function DashboardPage() {
  const { user } = useAuth()
  const [macroGoal, setMacroGoal] = useState<MacroGoal | null>(null)
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([])
  const [weeklyData, setWeeklyData] = useState<DailyTotal[]>([])
  const [date, setDate] = useState<Date>(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [isWeeklyLoading, setIsWeeklyLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  // Edit dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedFoodEntry, setSelectedFoodEntry] = useState<FoodEntry | null>(null)

  // YOLO Day state
  const [yoloDay, setYoloDay] = useState<YoloDay | null>(null)
  const [isYoloDayDialogOpen, setIsYoloDayDialogOpen] = useState(false)

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch macro goals
        const { data: goalData, error: goalError } = await supabase
          .from("macro_goals")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single()

        if (goalError && goalError.code !== "PGRST116") {
          console.error("Error fetching macro goals:", goalError)
        } else {
          setMacroGoal(goalData || null)
        }

        // Check if this date is a YOLO Day
        const formattedDate = format(date, "yyyy-MM-dd")
        const { data: yoloDayData, error: yoloDayError } = await supabase
          .from("yolo_days")
          .select("*")
          .eq("user_id", user.id)
          .eq("date", formattedDate)
          .single()

        if (yoloDayError && yoloDayError.code !== "PGRST116") {
          console.error("Error fetching YOLO day:", yoloDayError)
        }
        setYoloDay(yoloDayData || null)

        // Fetch food entries for the selected date (only if not a YOLO day)
        if (!yoloDayData) {
          const { data: entriesData, error: entriesError } = await supabase
            .from("food_entries")
            .select("*")
            .eq("user_id", user.id)
            .eq("date", formattedDate)
            .order("created_at", { ascending: false }) // Newest first

          if (entriesError) {
            console.error("Error fetching food entries:", entriesError)
          } else {
            setFoodEntries(entriesData || [])
          }
        } else {
          setFoodEntries([]) // Clear food entries for YOLO days
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user, date])

  // Fetch weekly data
  useEffect(() => {
    if (!user) return

    const fetchWeeklyData = async () => {
      setIsWeeklyLoading(true)
      try {
        const endDate = new Date()
        const startDate = subDays(endDate, 6) // Last 7 days including today

        // Format dates for Supabase query
        const startDateStr = format(startDate, "yyyy-MM-dd")
        const endDateStr = format(endDate, "yyyy-MM-dd")

        // Fetch all food entries for the date range
        const { data: entriesData, error: entriesError } = await supabase
          .from("food_entries")
          .select("*")
          .eq("user_id", user.id)
          .gte("date", startDateStr)
          .lte("date", endDateStr)

        if (entriesError) {
          console.error("Error fetching weekly food entries:", entriesError)
          return
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

        // Generate array of all days in the range
        const daysInRange = eachDayOfInterval({ start: startDate, end: endDate })

        // Create a set of YOLO day dates for quick lookup
        const yoloDayDates = new Set(
          yoloDaysData?.map((yoloDay: YoloDay) => yoloDay.date) || []
        )

        // Initialize daily totals with zeros
        const dailyTotals: DailyTotal[] = daysInRange.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd")
          return {
            date: day,
            formattedDate: format(day, "EEE"),
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            isYoloDay: yoloDayDates.has(dateStr),
          }
        })

        // Sum up the entries for each day
        if (entriesData) {
          entriesData.forEach((entry: any) => {
            const entryDate = parseISO(entry.date)
            const dayIndex = dailyTotals.findIndex(
              (day) => format(day.date, "yyyy-MM-dd") === format(entryDate, "yyyy-MM-dd"),
            )

            if (dayIndex !== -1) {
              dailyTotals[dayIndex].calories += entry.calories
              dailyTotals[dayIndex].protein += Number(entry.protein_grams)
              dailyTotals[dayIndex].carbs += Number(entry.carbs_total_grams)
              dailyTotals[dayIndex].fat += Number(entry.fat_total_grams)
            }
          })
        }

        setWeeklyData(dailyTotals)
      } finally {
        setIsWeeklyLoading(false)
      }
    }

    fetchWeeklyData()
  }, [user])

  const handleDeleteEntry = async (id: string) => {
    try {
      const { error } = await supabase.from("food_entries").delete().eq("id", id)

      if (error) throw error

      setFoodEntries(foodEntries.filter((entry) => entry.id !== id))
      toast({
        title: "Food entry deleted",
        description: "The food entry has been removed from your tracker",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete food entry",
        variant: "destructive",
      })
    }
  }

  const handleEditEntry = (entry: FoodEntry) => {
    setSelectedFoodEntry(entry)
    setIsEditDialogOpen(true)
  }

  const handleFoodUpdated = (updatedFood: FoodEntry) => {
    // Update the food entries list with the updated food
    setFoodEntries(foodEntries.map((entry) => (entry.id === updatedFood.id ? updatedFood : entry)))
  }

  const handleCreateYoloDay = async (reason?: string) => {
    if (!user) return

    try {
      const formattedDate = format(date, "yyyy-MM-dd")
      const { data, error } = await supabase
        .from("yolo_days")
        .insert({
          user_id: user.id,
          date: formattedDate,
          reason: reason || null,
        })
        .select()
        .single()

      if (error) throw error

      setYoloDay(data)
      setFoodEntries([]) // Clear any existing food entries for this day
      setIsYoloDayDialogOpen(false)

      toast({
        title: "YOLO Day declared! 🎉",
        description: "Enjoy your day off from tracking. You deserve it!",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create YOLO day",
        variant: "destructive",
      })
    }
  }

  const handleRemoveYoloDay = async () => {
    if (!user || !yoloDay) return

    try {
      const { error } = await supabase.from("yolo_days").delete().eq("id", yoloDay.id)

      if (error) throw error

      setYoloDay(null)
      // Refresh food entries for this date
      const formattedDate = format(date, "yyyy-MM-dd")
      const { data: entriesData, error: entriesError } = await supabase
        .from("food_entries")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", formattedDate)
        .order("created_at", { ascending: false })

      if (!entriesError) {
        setFoodEntries(entriesData || [])
      }

      toast({
        title: "Back to tracking!",
        description: "Ready to log your nutrition again.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove YOLO day",
        variant: "destructive",
      })
    }
  }

  // Calculate totals
  const totalCalories = foodEntries.reduce((sum, entry) => sum + entry.calories, 0)
  const totalProtein = foodEntries.reduce((sum, entry) => sum + Number(entry.protein_grams), 0)
  const totalCarbs = foodEntries.reduce((sum, entry) => sum + Number(entry.carbs_total_grams), 0)
  const totalFat = foodEntries.reduce((sum, entry) => sum + Number(entry.fat_total_grams), 0)

  // Calculate percentages for progress bars
  const caloriePercentage = macroGoal ? Math.min(100, (totalCalories / macroGoal.daily_calorie_goal) * 100) : 0

  // Calculate macro targets based on percentages and calorie goal
  const proteinTarget = macroGoal ? (macroGoal.daily_calorie_goal * (macroGoal.protein_percentage / 100)) / 4 : 0
  const carbsTarget = macroGoal ? (macroGoal.daily_calorie_goal * (macroGoal.carbs_percentage / 100)) / 4 : 0
  const fatTarget = macroGoal ? (macroGoal.daily_calorie_goal * (macroGoal.fat_percentage / 100)) / 9 : 0

  const proteinPercentage = proteinTarget ? Math.min(100, (totalProtein / proteinTarget) * 100) : 0
  const carbsPercentage = carbsTarget ? Math.min(100, (totalCarbs / carbsTarget) * 100) : 0
  const fatPercentage = fatTarget ? Math.min(100, (totalFat / fatTarget) * 100) : 0

  // Format the time from ISO string
  const formatEntryTime = (createdAt: string) => {
    try {
      return format(parseISO(createdAt), "h:mm a")
    } catch (error) {
      return "Unknown time"
    }
  }

  // Prepare chart data
  const chartData = weeklyData.map((day) => ({
    name: day.formattedDate,
    calories: day.isYoloDay ? null : (day.calories || 0),
    yoloDayMarker: day.isYoloDay ? (macroGoal?.daily_calorie_goal || 2000) : null,
    goal: macroGoal?.daily_calorie_goal || 0,
    isYoloDay: day.isYoloDay || false,
  }))

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Vibe with your nutrition and macros</p>
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(date, "MMMM d, yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
            </PopoverContent>
          </Popover>
          {!yoloDay && (
            <Button onClick={() => router.push("/add-food")}>
              <Plus className="mr-2 h-4 w-4" /> Log Food
            </Button>
          )}
        </div>
      </div>

      {!macroGoal && !isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-muted">
                <Settings className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Set Your Macro Goals</h3>
              <p className="text-muted-foreground">
                You haven't set your macro goals yet. Define your targets to start tracking.
              </p>
              <Button onClick={() => router.push("/goals")} className="mt-2">
                Set Goals
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : yoloDay ? (
        <YoloDayDisplay 
          yoloDay={yoloDay} 
          onRemove={handleRemoveYoloDay} 
          date={date} 
        />
      ) : (
        <>
          {/* Main Summary Card - More Compact for Mobile */}
          <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-gray-900 to-gray-800">
            <CardContent className="p-4">
              {/* Header with Daily Summary and Date */}
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h2 className="text-lg font-semibold text-white">Daily Summary</h2>
                  <p className="text-xs text-gray-400">{format(date, "EEE, MMM d")}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{totalCalories}</div>
                  <div className="text-xs text-gray-400">of {macroGoal?.daily_calorie_goal} kcal</div>
                </div>
              </div>

              {/* Calories Progress */}
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-300">Calories</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white">{Math.round(caloriePercentage)}%</span>
                    <span className="text-xs text-gray-400">
                      {macroGoal ? Math.max(0, macroGoal.daily_calorie_goal - totalCalories) : 0} left
                    </span>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                    style={{ width: `${caloriePercentage}%` }}
                  />
                </div>
              </div>

              {/* Macros Grid - 3 columns side by side */}
              <div className="grid grid-cols-3 gap-2">
                {/* Protein */}
                <div>
                  <div className="flex items-center mb-1">
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-1"></div>
                    <span className="text-xs text-gray-300">Protein</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-base font-bold text-white">{totalProtein.toFixed(0)}</span>
                    <span className="text-xs text-gray-400">/ {proteinTarget.toFixed(0)}g</span>
                  </div>
                  <div className="h-1 w-full bg-gray-700 rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${proteinPercentage}%` }} />
                  </div>
                </div>

                {/* Carbs */}
                <div>
                  <div className="flex items-center mb-1">
                    <div className="h-2 w-2 rounded-full bg-purple-500 mr-1"></div>
                    <span className="text-xs text-gray-300">Carbs</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-base font-bold text-white">{totalCarbs.toFixed(0)}</span>
                    <span className="text-xs text-gray-400">/ {carbsTarget.toFixed(0)}g</span>
                  </div>
                  <div className="h-1 w-full bg-gray-700 rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${carbsPercentage}%` }} />
                  </div>
                </div>

                {/* Fat */}
                <div>
                  <div className="flex items-center mb-1">
                    <div className="h-2 w-2 rounded-full bg-yellow-500 mr-1"></div>
                    <span className="text-xs text-gray-300">Fat</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-base font-bold text-white">{totalFat.toFixed(0)}</span>
                    <span className="text-xs text-gray-400">/ {fatTarget.toFixed(0)}g</span>
                  </div>
                  <div className="h-1 w-full bg-gray-700 rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${fatPercentage}%` }} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Food Log */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <div>
                <CardTitle>Today's Food Log</CardTitle>
                <CardDescription className="hidden sm:block">{format(date, "EEEE, MMMM d, yyyy")}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {!yoloDay && (
                  <Button 
                    onClick={() => setIsYoloDayDialogOpen(true)}
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-pink-500 hover:bg-pink-500/10"
                  >
                    <PartyPopper className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">YOLO Day</span>
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => router.push("/add-food")}>
                  <Plus className="mr-2 h-4 w-4" /> Add Food
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex h-[300px] items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
                </div>
              ) : foodEntries.length === 0 ? (
                <div className="flex h-[300px] flex-col items-center justify-center text-center">
                  <div className="rounded-full bg-muted p-3">
                    <Plus className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium">No food entries</h3>
                  <p className="mt-2 text-sm text-muted-foreground">You haven't logged any food for today</p>
                  <Button onClick={() => router.push("/add-food")} className="mt-4">
                    Log Your First Meal
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-3">
                    {foodEntries.map((entry) => (
                      <div key={entry.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border p-3 text-sm gap-2">
                        <div className="grid gap-1 flex-1 w-full">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">{entry.name}</div>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock className="mr-1 h-3 w-3" />
                              {formatEntryTime(entry.created_at)}
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {entry.description && entry.description.length > 60
                              ? `${entry.description.substring(0, 60)}...`
                              : entry.description}
                          </div>
                          <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-1">
                            <Badge
                              variant="outline"
                              className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20 text-xs py-0.5 px-2"
                            >
                              {entry.calories} kcal
                            </Badge>
                            <Badge
                              variant="outline"
                              className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20 text-xs py-0.5 px-2"
                            >
                              P: {entry.protein_grams}g
                            </Badge>
                            <Badge
                              variant="outline"
                              className="bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 border-purple-500/20 text-xs py-0.5 px-2"
                            >
                              C: {entry.carbs_total_grams}g
                            </Badge>
                            <Badge
                              variant="outline"
                              className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20 text-xs py-0.5 px-2"
                            >
                              F: {entry.fat_total_grams}g
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-1 w-full sm:w-auto sm:ml-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditEntry(entry)}
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Food Entry</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{entry.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteEntry(entry.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Weekly Overview */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <div>
                <CardTitle>Weekly Overview</CardTitle>
                <CardDescription className="hidden sm:block">Your nutrition trends for the past 7 days</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => router.push("/trends")}>
                <span className="hidden sm:inline">View Detailed Trends</span>
                <span className="sm:hidden">Details</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {isWeeklyLoading ? (
                <div className="flex h-[200px] items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
                </div>
              ) : (
                <ChartContainer
                  config={{
                    calories: {
                      label: "Calories",
                      color: "hsl(var(--chart-1))",
                    },
                    goal: {
                      label: "Goal",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className="h-[200px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis
                        dataKey="name"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}`}
                        domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.1)]}
                      />
                      <ChartTooltip 
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
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )
                            }
                            return <ChartTooltipContent active={active} payload={payload} label={label} />
                          }
                          return null
                        }}
                      />
                      <ReferenceLine
                        y={macroGoal?.daily_calorie_goal || 0}
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
                      <Line
                        type="monotone"
                        dataKey="calories"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6 }}
                        connectNulls={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="yoloDayMarker"
                        stroke="transparent"
                        strokeWidth={0}
                        dot={(props: any) => {
                          const { cx, cy, payload } = props
                          if (payload.yoloDayMarker !== null) {
                            // Create a star shape
                            const size = 8
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
                                  stroke="#fff" 
                                  strokeWidth={2}
                                  strokeLinejoin="round"
                                />
                                <text x={cx} y={cy - 12} textAnchor="middle" fill="#ec4899" fontSize={10} fontWeight="bold">
                                  YOLO
                                </text>
                              </g>
                            )
                          }
                          return <g />
                        }}
                        activeDot={false}
                        connectNulls={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Edit Food Dialog */}
      <EditFoodDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false)
          setSelectedFoodEntry(null)
        }}
        foodEntry={selectedFoodEntry}
        onFoodUpdated={handleFoodUpdated}
      />

      {/* YOLO Day Dialog */}
      <YoloDayDialog
        isOpen={isYoloDayDialogOpen}
        onClose={() => setIsYoloDayDialogOpen(false)}
        onConfirm={handleCreateYoloDay}
        date={date}
      />
    </div>
  )
}

type DailyTotal = {
  date: Date
  formattedDate: string
  calories: number
  protein: number
  carbs: number
  fat: number
  isYoloDay?: boolean
}
