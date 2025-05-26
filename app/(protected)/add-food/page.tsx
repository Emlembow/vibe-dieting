"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/context/auth-context"
import type { NutritionResponse, FoodEntry } from "@/types/database"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  CalendarIcon,
  Loader2,
  Search,
  ArrowLeft,
  Plus,
  Utensils,
  Camera,
  Upload,
  X,
  Clock,
  Sparkles,
  Pencil,
} from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import Image from "next/image"

// Add the import for the HighlightMatch component at the top of the file
import { HighlightMatch } from "@/components/highlight-match"

interface SmartFoodSuggestion extends FoodEntry {
  score: number
  reason: string
  lastEaten: string
  frequency: number
}

export default function AddFoodPage() {
  const { user } = useAuth()
  const [foodName, setFoodName] = useState("")
  const [date, setDate] = useState<Date>(new Date())
  const [isSearching, setIsSearching] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [nutritionData, setNutritionData] = useState<NutritionResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  // Image upload states
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [activeTab, setActiveTab] = useState("recent")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Recent foods states
  const [recentFoods, setRecentFoods] = useState<SmartFoodSuggestion[]>([])
  const [isLoadingRecent, setIsLoadingRecent] = useState(false)

  // Add a new state for the recent foods search
  const [recentFoodsSearch, setRecentFoodsSearch] = useState("")
  const [filteredRecentFoods, setFilteredRecentFoods] = useState<SmartFoodSuggestion[]>([])

  // Fetch and sort recent foods with smart algorithm
  useEffect(() => {
    if (!user) return

    const fetchRecentFoods = async () => {
      setIsLoadingRecent(true)
      try {
        // Fetch all user's food entries from the last 30 days
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const { data: entries, error } = await supabase
          .from("food_entries")
          .select("*")
          .eq("user_id", user.id)
          .gte("date", format(thirtyDaysAgo, "yyyy-MM-dd"))
          .order("created_at", { ascending: false })

        if (error) throw error

        // Group by food name and calculate smart scores
        const foodGroups = new Map<string, FoodEntry[]>()

        entries?.forEach((entry: FoodEntry) => {
          const key = entry.name.toLowerCase()
          if (!foodGroups.has(key)) {
            foodGroups.set(key, [])
          }
          foodGroups.get(key)!.push(entry)
        })

        // Calculate smart scores for each unique food
        const suggestions: SmartFoodSuggestion[] = []
        const currentHour = new Date().getHours()
        const currentDay = new Date().getDay() // 0 = Sunday, 1 = Monday, etc.

        // Find the maximum frequency for normalization
        const maxFrequency = Math.max(...Array.from(foodGroups.values()).map((g) => g.length))

        foodGroups.forEach((entries, foodName) => {
          const mostRecent = entries[0] // Most recent entry for this food
          const frequency = entries.length

          // Calculate time-based score
          const timeScores = entries.map((entry) => {
            const entryTime = new Date(entry.created_at)
            const entryHour = entryTime.getHours()
            const entryDay = entryTime.getDay()

            // Time similarity score (0-1)
            const hourDiff = Math.abs(currentHour - entryHour)
            const timeScore = Math.max(0, 1 - hourDiff / 12) // Closer times get higher scores

            // Day of week bonus
            const dayBonus = currentDay === entryDay ? 0.3 : 0

            return timeScore + dayBonus
          })

          const avgTimeScore = timeScores.reduce((a, b) => a + b, 0) / timeScores.length

          // Recency score (0-1) - more recent = higher score
          const daysSinceLastEaten = (Date.now() - new Date(mostRecent.created_at).getTime()) / (1000 * 60 * 60 * 24)
          const recencyScore = Math.max(0, 1 - daysSinceLastEaten / 7) // Foods eaten in last week get higher scores

          // Frequency score (0-1) - normalize by max frequency
          const frequencyScore = frequency / maxFrequency

          // Apply a progressive boost for frequency
          // This gives a much stronger boost to items eaten multiple times
          const frequencyBoost = Math.pow(frequency, 1.5) / Math.pow(maxFrequency, 1.5)

          // Combined score with adjusted weights to prioritize frequency more
          // Increase frequency weight from 0.3 to 0.5
          // Reduce time and recency weights accordingly
          const finalScore = avgTimeScore * 0.25 + recencyScore * 0.25 + frequencyBoost * 0.5

          // Determine reason for suggestion
          let reason = "Recently added"
          if (avgTimeScore > 0.7) {
            reason = "Usually eaten around this time"
          } else if (frequency >= 3) {
            reason = "Frequently eaten"
          } else if (recencyScore > 0.8) {
            reason = "Added recently"
          }

          suggestions.push({
            ...mostRecent,
            score: finalScore,
            reason,
            lastEaten: format(new Date(mostRecent.created_at), "MMM d"),
            frequency,
          })
        })

        // Sort by score (highest first) and take top 10
        const sortedSuggestions = suggestions.sort((a, b) => b.score - a.score).slice(0, 10)

        setRecentFoods(sortedSuggestions)
      } catch (error: any) {
        console.error("Error fetching recent foods:", error)
      } finally {
        setIsLoadingRecent(false)
      }
    }

    fetchRecentFoods()
  }, [user])

  // Add this useEffect after the existing useEffect for fetching recent foods
  useEffect(() => {
    if (recentFoods.length === 0) {
      setFilteredRecentFoods([])
      return
    }

    if (!recentFoodsSearch.trim()) {
      setFilteredRecentFoods(recentFoods)
      return
    }

    // Filter foods based on search term
    const searchTerm = recentFoodsSearch.toLowerCase().trim()
    const filtered = recentFoods.filter(
      (food) =>
        food.name.toLowerCase().includes(searchTerm) ||
        (food.description && food.description.toLowerCase().includes(searchTerm)),
    )

    // Re-score the filtered foods to prioritize commonly eaten ones
    const rescored = filtered.map((food) => {
      // Boost score for frequently eaten foods when searching
      // Apply a stronger frequency boost during search
      const frequencyBoost = Math.pow(food.frequency, 1.5) * 0.15

      // Boost score for exact name matches
      const exactMatchBoost = food.name.toLowerCase() === searchTerm ? 0.3 : 0

      // Boost score for name starts with search term
      const startsWithBoost = food.name.toLowerCase().startsWith(searchTerm) ? 0.1 : 0

      return {
        ...food,
        score: food.score + frequencyBoost + exactMatchBoost + startsWithBoost,
      }
    })

    // Sort by the new scores
    setFilteredRecentFoods(rescored.sort((a, b) => b.score - a.score))
  }, [recentFoods, recentFoodsSearch])

  const handleSearch = async () => {
    if (!foodName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a food name",
        variant: "destructive",
      })
      return
    }

    setIsSearching(true)
    setNutritionData(null)
    setError(null)

    try {
      // Prepare the request payload
      const payload = {
        foodName: foodName.trim(),
      }

      // Get the current session to include the auth token
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error("You must be logged in to search for food")
      }

      const response = await fetch("/api/nutrition", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch nutrition data")
      }

      const data = await response.json()
      setNutritionData(data)
    } catch (error: any) {
      console.error("Error fetching nutrition data:", error)
      setError(error.message || "Failed to fetch nutrition data")
      toast({
        title: "Error",
        description: error.message || "Failed to fetch nutrition data",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      })
      return
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    setImage(file)

    // Create preview URL
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const clearImage = () => {
    setImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const analyzeImage = async () => {
    if (!image) {
      toast({
        title: "No image selected",
        description: "Please upload an image of food to analyze",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    setNutritionData(null)
    setError(null)

    try {
      // Create form data to send the image
      const formData = new FormData()
      formData.append("foodImage", image)

      // Get the current session to include the auth token
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error("You must be logged in to analyze images")
      }

      const response = await fetch("/api/nutrition/image", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to analyze image")
      }

      const data = await response.json()
      setNutritionData(data)

      // Clear the image after successful analysis
      clearImage()
    } catch (error: any) {
      console.error("Error analyzing food image:", error)
      setError(error.message || "Failed to analyze food image")
      toast({
        title: "Error",
        description: error.message || "Failed to analyze food image",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleSave = async () => {
    if (!nutritionData) return

    setIsSaving(true)

    try {
      // Get the current user
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        throw new Error("You must be logged in to save food entries")
      }

      const { error } = await supabase.from("food_entries").insert({
        user_id: session.user.id,
        date: format(date, "yyyy-MM-dd"),
        name: nutritionData.foodDetails.name,
        description: nutritionData.foodDetails.description,
        calories: nutritionData.macronutrients.calories,
        protein_grams: nutritionData.macronutrients.proteinGrams,
        carbs_total_grams: nutritionData.macronutrients.carbohydrates.totalGrams,
        carbs_fiber_grams: nutritionData.macronutrients.carbohydrates.fiberGrams,
        carbs_sugar_grams: nutritionData.macronutrients.carbohydrates.sugarGrams,
        fat_total_grams: nutritionData.macronutrients.fat.totalGrams,
        fat_saturated_grams: nutritionData.macronutrients.fat.saturatedGrams,
      })

      if (error) throw error

      toast({
        title: "Food added",
        description: "The food has been added to your tracker",
      })

      router.push("/dashboard")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save food entry",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddRecentFood = async (food: SmartFoodSuggestion) => {
    setIsSaving(true)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        throw new Error("You must be logged in to save food entries")
      }

      const { error } = await supabase.from("food_entries").insert({
        user_id: session.user.id,
        date: format(date, "yyyy-MM-dd"),
        name: food.name,
        description: food.description,
        calories: food.calories,
        protein_grams: food.protein_grams,
        carbs_total_grams: food.carbs_total_grams,
        carbs_fiber_grams: food.carbs_fiber_grams,
        carbs_sugar_grams: food.carbs_sugar_grams,
        fat_total_grams: food.fat_total_grams,
        fat_saturated_grams: food.fat_saturated_grams,
      })

      if (error) throw error

      toast({
        title: "Food added",
        description: `${food.name} has been added to your tracker`,
      })

      router.push("/dashboard")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save food entry",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // For manual entry if API fails
  const [manualEntry, setManualEntry] = useState({
    name: "",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  })

  const handleManualSave = async () => {
    if (!manualEntry.name) {
      toast({
        title: "Error",
        description: "Please enter a food name",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      // Get the current user
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        throw new Error("You must be logged in to save food entries")
      }

      const { error } = await supabase.from("food_entries").insert({
        user_id: session.user.id,
        date: format(date, "yyyy-MM-dd"),
        name: manualEntry.name,
        description: `Manually entered`,
        calories: manualEntry.calories,
        protein_grams: manualEntry.protein,
        carbs_total_grams: manualEntry.carbs,
        carbs_fiber_grams: 0,
        carbs_sugar_grams: 0,
        fat_total_grams: manualEntry.fat,
        fat_saturated_grams: 0,
      })

      if (error) throw error

      toast({
        title: "Food added",
        description: "The food has been added to your tracker",
      })

      router.push("/dashboard")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save food entry",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    // Reset states when changing tabs
    setError(null)
    setRecentFoodsSearch("")
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex items-center w-full sm:w-auto">
          <Button variant="ghost" size="icon" className="mr-2 h-8 w-8 sm:h-10 sm:w-10" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="sr-only">Back to Dashboard</span>
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Add Food</h1>
            <p className="text-sm sm:text-base text-muted-foreground hidden sm:block">Vibe with your meals and track your nutrition</p>
          </div>
        </div>
        <div className="w-full sm:w-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full sm:w-[240px] justify-start text-left font-normal h-9 sm:h-10 text-sm">
                <CalendarIcon className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {format(date, "MMM d, yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Only show tabs if no nutrition data is available yet */}
      {!nutritionData ? (
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-6 gap-2 h-auto p-1.5 bg-muted/50">
            <TabsTrigger value="recent" className="text-xs sm:text-sm px-3 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Clock className="mr-1.5 h-3.5 w-3.5 sm:hidden" />
              <span className="hidden sm:inline">Recent Foods</span>
              <span className="sm:hidden">Recent</span>
            </TabsTrigger>
            <TabsTrigger value="search" className="text-xs sm:text-sm px-3 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Search className="mr-1.5 h-3.5 w-3.5 sm:hidden" />
              <span className="hidden sm:inline">Search Food</span>
              <span className="sm:hidden">Search</span>
            </TabsTrigger>
            <TabsTrigger value="image" className="text-xs sm:text-sm px-3 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Camera className="mr-1.5 h-3.5 w-3.5 sm:hidden" />
              <span className="hidden sm:inline">Image Upload</span>
              <span className="sm:hidden">Image</span>
            </TabsTrigger>
            <TabsTrigger value="manual" className="text-xs sm:text-sm px-3 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Pencil className="mr-1.5 h-3.5 w-3.5 sm:hidden" />
              <span className="hidden sm:inline">Manual Entry</span>
              <span className="sm:hidden">Manual</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recent" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="mr-2 h-5 w-5 text-purple-500" />
                  Smart Suggestions
                </CardTitle>
                <CardDescription>
                  Foods you might want to add based on your eating patterns and the current time
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingRecent ? (
                  <div className="flex h-[300px] items-center justify-center">
                    <LoadingSpinner size="md" />
                  </div>
                ) : recentFoods.length === 0 ? (
                  <div className="flex h-[300px] flex-col items-center justify-center text-center">
                    <div className="rounded-full bg-muted p-3">
                      <Clock className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="mt-4 text-lg font-medium">No recent foods</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Start logging foods and we'll learn your patterns to make suggestions
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search your recent foods..."
                        value={recentFoodsSearch}
                        onChange={(e) => setRecentFoodsSearch(e.target.value)}
                        className="pl-9"
                      />
                      {recentFoodsSearch && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                          onClick={() => setRecentFoodsSearch("")}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {filteredRecentFoods.length === 0 && recentFoodsSearch ? (
                      <div className="flex h-[300px] flex-col items-center justify-center text-center">
                        <div className="rounded-full bg-muted p-3">
                          <Search className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="mt-4 text-lg font-medium">No matching foods</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Try a different search term or add a new food
                        </p>
                        <Button variant="outline" className="mt-4" onClick={() => setActiveTab("search")}>
                          Search for new food
                        </Button>
                      </div>
                    ) : (
                      <ScrollArea className="h-[350px] sm:h-[400px] pr-2 sm:pr-4">
                        <div className="space-y-3">
                          {filteredRecentFoods.map((food, index) => (
                            <div
                              key={`${food.name}-${index}`}
                              className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border p-3 sm:p-4 hover:bg-muted/50 transition-colors gap-3"
                            >
                              <div className="flex-1 w-full">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="font-medium">
                                    {recentFoodsSearch ? (
                                      <HighlightMatch text={food.name} highlight={recentFoodsSearch} />
                                    ) : (
                                      food.name
                                    )}
                                  </div>
                                  {food.frequency >= 3 && (
                                    <Badge
                                      variant="outline"
                                      className="ml-2 bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                                    >
                                      <Utensils className="mr-1 h-3 w-3" />
                                      Favorite
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground mb-2">
                                  {food.description && food.description.length > 60 ? (
                                    recentFoodsSearch ? (
                                      <HighlightMatch
                                        text={`${food.description.substring(0, 60)}...`}
                                        highlight={recentFoodsSearch}
                                      />
                                    ) : (
                                      `${food.description.substring(0, 60)}...`
                                    )
                                  ) : recentFoodsSearch ? (
                                    <HighlightMatch text={food.description || ""} highlight={recentFoodsSearch} />
                                  ) : (
                                    food.description
                                  )}
                                </div>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                                  <span className="flex items-center">
                                    <Clock className="mr-1 h-3 w-3" />
                                    Last: {food.lastEaten}
                                  </span>
                                  <span>Added {food.frequency}x</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                  <Badge
                                    variant="outline"
                                    className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20 text-xs py-0.5 px-2"
                                  >
                                    {food.calories} kcal
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20 text-xs py-0.5 px-2"
                                  >
                                    P: {food.protein_grams}g
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className="bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 border-purple-500/20 text-xs py-0.5 px-2"
                                  >
                                    C: {food.carbs_total_grams}g
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20 text-xs py-0.5 px-2"
                                  >
                                    F: {food.fat_total_grams}g
                                  </Badge>
                                </div>
                              </div>
                              <div className="w-full sm:w-auto sm:ml-4">
                                <Button onClick={() => handleAddRecentFood(food)} disabled={isSaving} size="sm" className="w-full sm:w-auto">
                                  {isSaving ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <Plus className="mr-1 h-4 w-4" />
                                      Add
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="search" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Search for Food</CardTitle>
                <CardDescription>Enter a food name to get nutrition information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="e.g., Grilled chicken breast, Avocado toast..."
                      value={foodName}
                      onChange={(e) => setFoodName(e.target.value)}
                      className="pl-9"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleSearch()
                        }
                      }}
                    />
                  </div>
                  <Button onClick={handleSearch} disabled={isSearching}>
                    {isSearching ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      "Search"
                    )}
                  </Button>
                </div>

                {error && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="image" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload Food Image</CardTitle>
                <CardDescription>Take a photo or upload an image of your food for analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {imagePreview ? (
                    <div className="relative">
                      <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-dashed">
                        <Image
                          src={imagePreview || "/placeholder.svg"}
                          alt="Food preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute right-2 top-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                        onClick={clearImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 sm:p-12 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <div className="rounded-full bg-muted p-3 mb-4">
                        <Camera className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium">Upload an image</h3>
                      <p className="mt-2 text-sm text-muted-foreground max-w-xs">
                        Take a photo or upload an image of your food for AI analysis
                      </p>
                      <Button variant="secondary" className="mt-4">
                        <Upload className="mr-2 h-4 w-4" />
                        Choose Image
                      </Button>
                      <input
                        id="image-upload"
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </div>
                  )}

                  {imagePreview && (
                    <Button onClick={analyzeImage} disabled={isUploading} className="w-full">
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Camera className="mr-2 h-4 w-4" />
                          Analyze Food Image
                        </>
                      )}
                    </Button>
                  )}

                  {error && (
                    <Alert variant="destructive">
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manual" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Manual Entry</CardTitle>
                <CardDescription>Enter nutrition information manually</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="manual-name">Food Name</Label>
                    <Input
                      id="manual-name"
                      value={manualEntry.name}
                      onChange={(e) => setManualEntry({ ...manualEntry, name: e.target.value })}
                      placeholder="e.g., Grilled chicken breast"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="manual-calories">Calories</Label>
                    <Input
                      id="manual-calories"
                      type="number"
                      value={manualEntry.calories}
                      onChange={(e) => setManualEntry({ ...manualEntry, calories: Number(e.target.value) })}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="manual-protein">Protein (g)</Label>
                      <Input
                        id="manual-protein"
                        type="number"
                        value={manualEntry.protein}
                        onChange={(e) => setManualEntry({ ...manualEntry, protein: Number(e.target.value) })}
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="manual-carbs">Carbs (g)</Label>
                      <Input
                        id="manual-carbs"
                        type="number"
                        value={manualEntry.carbs}
                        onChange={(e) => setManualEntry({ ...manualEntry, carbs: Number(e.target.value) })}
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="manual-fat">Fat (g)</Label>
                      <Input
                        id="manual-fat"
                        type="number"
                        value={manualEntry.fat}
                        onChange={(e) => setManualEntry({ ...manualEntry, fat: Number(e.target.value) })}
                        className="h-9"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleManualSave} disabled={isSaving} className="w-full">
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add to Food Log
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      ) : null}

      {!nutritionData && !isSearching && !isUploading && !error && activeTab === "search" && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-3 mb-4">
            <Utensils className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">Search for food</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            Enter a food name to get detailed nutrition information. You can search for specific foods, meals, or
            ingredients.
          </p>
        </div>
      )}

      {nutritionData && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{nutritionData.foodDetails.name}</CardTitle>
            <CardDescription>{nutritionData.foodDetails.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Calories</h3>
                <p className="text-3xl font-bold">{nutritionData.macronutrients.calories}</p>
                <p className="text-sm text-muted-foreground">kcal</p>
              </div>

              <div className="flex gap-3 sm:gap-4">
                <div className="text-center">
                  <div className="flex h-14 w-14 sm:h-16 sm:w-16 flex-col items-center justify-center rounded-full bg-green-500/10 border border-green-500/20">
                    <span className="text-base sm:text-lg font-bold text-green-500">
                      {nutritionData.macronutrients.proteinGrams}
                    </span>
                    <span className="text-xs text-green-500">g</span>
                  </div>
                  <p className="mt-1 text-xs font-medium">Protein</p>
                </div>

                <div className="text-center">
                  <div className="flex h-14 w-14 sm:h-16 sm:w-16 flex-col items-center justify-center rounded-full bg-purple-500/10 border border-purple-500/20">
                    <span className="text-base sm:text-lg font-bold text-purple-500">
                      {nutritionData.macronutrients.carbohydrates.totalGrams}
                    </span>
                    <span className="text-xs text-purple-500">g</span>
                  </div>
                  <p className="mt-1 text-xs font-medium">Carbs</p>
                </div>

                <div className="text-center">
                  <div className="flex h-14 w-14 sm:h-16 sm:w-16 flex-col items-center justify-center rounded-full bg-yellow-500/10 border border-yellow-500/20">
                    <span className="text-base sm:text-lg font-bold text-yellow-500">
                      {nutritionData.macronutrients.fat.totalGrams}
                    </span>
                    <span className="text-xs text-yellow-500">g</span>
                  </div>
                  <p className="mt-1 text-xs font-medium">Fat</p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-4">
                <h3 className="font-medium">Carbohydrates</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total</span>
                    <span>{nutritionData.macronutrients.carbohydrates.totalGrams}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fiber</span>
                    <span>{nutritionData.macronutrients.carbohydrates.fiberGrams}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sugar</span>
                    <span>{nutritionData.macronutrients.carbohydrates.sugarGrams}g</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Fats</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total</span>
                    <span>{nutritionData.macronutrients.fat.totalGrams}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Saturated</span>
                    <span>{nutritionData.macronutrients.fat.saturatedGrams}g</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSave} disabled={isSaving} className="w-full">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add to Food Log
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
