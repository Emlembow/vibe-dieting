"use client"

import { useState, useTransition, Suspense, lazy } from "react"
import { deleteFoodEntry, updateFoodEntry, toggleYoloDay } from "@/app/actions/dashboard"
import type { FoodEntry, MacroGoal, YoloDay } from "@/types/database"
import type { User } from "@supabase/supabase-js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { CalendarIcon, Plus, Trash2, ArrowRight, Settings, Clock, Pencil, Star } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { YoloDayDisplay } from "@/components/yolo-day-display"
import { Skeleton } from "@/components/ui/skeleton"

// Lazy load heavy components
const EditFoodDialog = lazy(() => import("@/components/edit-food-dialog").then(mod => ({ default: mod.EditFoodDialog })))
const YoloDayDialog = lazy(() => import("@/components/yolo-day-dialog").then(mod => ({ default: mod.YoloDayDialog })))
const WeeklyChart = lazy(() => import("./weekly-chart"))

interface DashboardClientProps {
  initialData: {
    macroGoal: MacroGoal | null
    foodEntries: FoodEntry[]
    yoloDay: YoloDay | null
    user: User
  }
  initialWeeklyData: Array<{ date: string; calories: number }>
  initialDate: Date
}

interface DailyTotal {
  calories: number
  protein: number
  carbs: number
  fat: number
}

export default function DashboardClient({ 
  initialData, 
  initialWeeklyData,
  initialDate 
}: DashboardClientProps) {
  const { macroGoal, user } = initialData
  const [foodEntries, setFoodEntries] = useState(initialData.foodEntries)
  const [weeklyData] = useState(initialWeeklyData)
  const [date, setDate] = useState<Date>(initialDate)
  const [yoloDay, setYoloDay] = useState(initialData.yoloDay)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const { toast } = useToast()

  // Edit dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedFoodEntry, setSelectedFoodEntry] = useState<FoodEntry | null>(null)

  // YOLO Day state
  const [isYoloDayDialogOpen, setIsYoloDayDialogOpen] = useState(false)

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate)
      router.push(`/dashboard?date=${format(newDate, 'yyyy-MM-dd')}`)
    }
  }

  const handleDeleteEntry = async (entryId: string) => {
    startTransition(async () => {
      try {
        await deleteFoodEntry(entryId)
        setFoodEntries(prev => prev.filter(entry => entry.id !== entryId))
        toast({
          title: "Food entry deleted",
          description: "The food entry has been removed.",
        })
        router.refresh()
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete food entry",
          variant: "destructive",
        })
      }
    })
  }

  const handleEditEntry = (entry: FoodEntry) => {
    setSelectedFoodEntry(entry)
    setIsEditDialogOpen(true)
  }

  const handleUpdateEntry = async (entryId: string, updates: Partial<FoodEntry>) => {
    startTransition(async () => {
      try {
        const updatedEntry = await updateFoodEntry(entryId, updates)
        setFoodEntries(prev => prev.map(entry => 
          entry.id === entryId ? { ...entry, ...updatedEntry } : entry
        ))
        setIsEditDialogOpen(false)
        toast({
          title: "Food entry updated",
          description: "Your changes have been saved.",
        })
        router.refresh()
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update food entry",
          variant: "destructive",
        })
      }
    })
  }

  const handleToggleYoloDay = async () => {
    startTransition(async () => {
      try {
        const result = await toggleYoloDay(date)
        setYoloDay(result.yoloDay)
        
        if (result.isNew) {
          setIsYoloDayDialogOpen(true)
        }
        
        toast({
          title: result.isNew ? "YOLO Day activated! 🎉" : "YOLO Day deactivated",
          description: result.isNew 
            ? "Enjoy your day off from tracking!" 
            : "Back to regular tracking.",
        })
        router.refresh()
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to toggle YOLO day",
          variant: "destructive",
        })
      }
    })
  }

  // Calculate daily totals
  const dailyTotals: DailyTotal = foodEntries.reduce((acc, entry) => ({
    calories: acc.calories + (entry.calories || 0),
    protein: acc.protein + (entry.protein_grams || 0),
    carbs: acc.carbs + (entry.carbs_total_grams || 0),
    fat: acc.fat + (entry.fat_total_grams || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 })

  // Calculate percentages of goals
  const getPercentage = (actual: number, goal: number) => {
    if (goal === 0) return 0
    return Math.round((actual / goal) * 100)
  }

  const calorieGoal = macroGoal?.daily_calorie_goal || 2000
  const proteinGoal = macroGoal ? (calorieGoal * (macroGoal.protein_percentage / 100)) / 4 : 150
  const carbsGoal = macroGoal ? (calorieGoal * (macroGoal.carbs_percentage / 100)) / 4 : 250
  const fatGoal = macroGoal ? (calorieGoal * (macroGoal.fat_percentage / 100)) / 9 : 67

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          {yoloDay && (
            <YoloDayDisplay 
              yoloDay={yoloDay} 
              onRemove={handleToggleYoloDay}
              date={date}
            />
          )}
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(date, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button
            variant={yoloDay ? "secondary" : "outline"}
            size="icon"
            onClick={handleToggleYoloDay}
            disabled={isPending}
            title={yoloDay ? "Deactivate YOLO Day" : "Activate YOLO Day"}
          >
            <Star className={`h-4 w-4 ${yoloDay ? "fill-current" : ""}`} />
          </Button>
        </div>
      </div>

      {!macroGoal && !yoloDay && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">Set Your Goals</CardTitle>
            <CardDescription className="text-yellow-700">
              You haven't set your macro goals yet. Set them up to track your progress!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/goals")} className="gap-2">
              <Settings className="h-4 w-4" />
              Set Goals
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Calories</CardDescription>
            <CardTitle className="text-2xl">
              {dailyTotals.calories} / {calorieGoal}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {getPercentage(dailyTotals.calories, calorieGoal)}% of daily goal
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Protein</CardDescription>
            <CardTitle className="text-2xl">
              {Math.round(dailyTotals.protein)}g / {Math.round(proteinGoal)}g
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {getPercentage(dailyTotals.protein, proteinGoal)}% of daily goal
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Carbs</CardDescription>
            <CardTitle className="text-2xl">
              {Math.round(dailyTotals.carbs)}g / {Math.round(carbsGoal)}g
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {getPercentage(dailyTotals.carbs, carbsGoal)}% of daily goal
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Fat</CardDescription>
            <CardTitle className="text-2xl">
              {Math.round(dailyTotals.fat)}g / {Math.round(fatGoal)}g
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {getPercentage(dailyTotals.fat, fatGoal)}% of daily goal
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Progress</CardTitle>
            <CardDescription>Your calorie intake over the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              <WeeklyChart data={weeklyData} goal={calorieGoal} />
            </Suspense>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Today's Food</CardTitle>
              <CardDescription>
                {foodEntries.length} {foodEntries.length === 1 ? "entry" : "entries"}
              </CardDescription>
            </div>
            <Button onClick={() => router.push("/add-food")} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Food
            </Button>
          </CardHeader>
          <CardContent>
            {foodEntries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No food entries yet today</p>
                <Button 
                  onClick={() => router.push("/add-food")} 
                  variant="link" 
                  className="mt-2 gap-2"
                >
                  Add your first meal
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-3">
                  {foodEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{entry.name}</div>
                        <div className="text-sm text-muted-foreground">
                          <span>{entry.calories} cal</span>
                          {entry.description && (
                            <>
                              <span className="mx-2">•</span>
                              <span>{entry.description}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditEntry(entry)}
                          className="h-8 w-8"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Trash2 className="h-3.5 w-3.5" />
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
                              <AlertDialogAction onClick={() => handleDeleteEntry(entry.id)}>
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
      </div>

      <Suspense fallback={null}>
        {isEditDialogOpen && selectedFoodEntry && (
          <EditFoodDialog
            isOpen={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
            foodEntry={selectedFoodEntry}
            onFoodUpdated={(updatedFood) => {
              setFoodEntries(prev => prev.map(entry => 
                entry.id === updatedFood.id ? updatedFood : entry
              ))
              setIsEditDialogOpen(false)
              toast({
                title: "Food entry updated",
                description: "Your changes have been saved.",
              })
              router.refresh()
            }}
          />
        )}
      </Suspense>

      <Suspense fallback={null}>
        {isYoloDayDialogOpen && (
          <YoloDayDialog
            isOpen={isYoloDayDialogOpen}
            onClose={() => setIsYoloDayDialogOpen(false)}
            onConfirm={() => setIsYoloDayDialogOpen(false)}
            date={date}
          />
        )}
      </Suspense>
    </div>
  )
}