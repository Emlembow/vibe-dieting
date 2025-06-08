"use client"

import type React from "react"
import { useState, useTransition } from "react"
import { updateMacroGoals } from "@/app/actions/goals"
import type { MacroGoal } from "@/types/database"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save } from "lucide-react"

interface GoalsClientProps {
  initialGoal: MacroGoal | null
}

export default function GoalsClient({ initialGoal }: GoalsClientProps) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const router = useRouter()

  // Form state
  const [calorieGoal, setCalorieGoal] = useState(initialGoal?.daily_calorie_goal || 2000)
  const [proteinPercentage, setProteinPercentage] = useState(initialGoal?.protein_percentage || 30)
  const [carbsPercentage, setCarbsPercentage] = useState(initialGoal?.carbs_percentage || 40)
  const [fatPercentage, setFatPercentage] = useState(initialGoal?.fat_percentage || 30)

  const handleProteinChange = (value: number[]) => {
    const newProtein = value[0]
    setProteinPercentage(newProtein)

    // Adjust carbs and fat to maintain 100% total
    const remaining = 100 - newProtein
    const ratio = remaining / (carbsPercentage + fatPercentage)

    setCarbsPercentage(Math.round(carbsPercentage * ratio))
    setFatPercentage(100 - newProtein - Math.round(carbsPercentage * ratio))
  }

  const handleCarbsChange = (value: number[]) => {
    const newCarbs = value[0]
    setCarbsPercentage(newCarbs)

    // Adjust protein and fat to maintain 100% total
    const remaining = 100 - newCarbs
    const ratio = remaining / (proteinPercentage + fatPercentage)

    setProteinPercentage(Math.round(proteinPercentage * ratio))
    setFatPercentage(100 - newCarbs - Math.round(proteinPercentage * ratio))
  }

  const handleFatChange = (value: number[]) => {
    const newFat = value[0]
    setFatPercentage(newFat)

    // Adjust protein and carbs to maintain 100% total
    const remaining = 100 - newFat
    const ratio = remaining / (proteinPercentage + carbsPercentage)

    setProteinPercentage(Math.round(proteinPercentage * ratio))
    setCarbsPercentage(100 - newFat - Math.round(proteinPercentage * ratio))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Ensure percentages sum to 100
    const total = proteinPercentage + carbsPercentage + fatPercentage
    if (total !== 100) {
      toast({
        title: "Invalid percentages",
        description: "Protein, carbs, and fat percentages must sum to 100%",
        variant: "destructive",
      })
      return
    }

    const formData = new FormData(e.currentTarget)
    formData.set("daily_calorie_goal", calorieGoal.toString())
    formData.set("protein_percentage", proteinPercentage.toString())
    formData.set("carbs_percentage", carbsPercentage.toString())
    formData.set("fat_percentage", fatPercentage.toString())

    startTransition(async () => {
      try {
        const result = await updateMacroGoals(formData)
        
        if (result.error) {
          toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
          })
        } else {
          toast({
            title: "Goals saved",
            description: "Your macro goals have been updated successfully",
          })
          router.push("/dashboard")
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to save goals",
          variant: "destructive",
        })
      }
    })
  }

  // Calculate macro targets in grams
  const proteinGrams = (calorieGoal * (proteinPercentage / 100)) / 4
  const carbsGrams = (calorieGoal * (carbsPercentage / 100)) / 4
  const fatGrams = (calorieGoal * (fatPercentage / 100)) / 9

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" className="mr-2 h-8 w-8 sm:h-10 sm:w-10" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="sr-only">Back to Dashboard</span>
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Macro Goals</h1>
          <p className="text-sm sm:text-base text-muted-foreground hidden sm:block">Set your daily calorie and macronutrient targets</p>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Daily Calorie Target</CardTitle>
              <CardDescription>Set your total daily calorie goal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="calories">Daily Calorie Goal</Label>
                  <span className="text-sm font-medium">{calorieGoal} kcal</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setCalorieGoal(Math.max(1000, calorieGoal - 100))}
                  >
                    -
                  </Button>
                  <Slider
                    id="calories"
                    min={1000}
                    max={5000}
                    step={50}
                    value={[calorieGoal]}
                    onValueChange={(value) => setCalorieGoal(value[0])}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setCalorieGoal(Math.min(5000, calorieGoal + 100))}
                  >
                    +
                  </Button>
                </div>
                <Input
                  type="number"
                  min="1000"
                  max="10000"
                  value={calorieGoal}
                  onChange={(e) => setCalorieGoal(Number.parseInt(e.target.value))}
                  className="mt-2"
                  required
                />
              </div>
            </CardContent>
            <CardHeader className="pb-0">
              <CardTitle>Macronutrient Distribution</CardTitle>
              <CardDescription>Adjust the percentage of calories from each macronutrient</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-green-500 mr-1.5"></div>
                      <Label htmlFor="protein">Protein ({proteinPercentage}%)</Label>
                    </div>
                    <span className="text-sm text-muted-foreground">{Math.round(proteinGrams)}g</span>
                  </div>
                  <Slider
                    id="protein"
                    min={10}
                    max={60}
                    step={1}
                    value={[proteinPercentage]}
                    onValueChange={handleProteinChange}
                    className="[&>span]:bg-green-500"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-purple-500 mr-1.5"></div>
                      <Label htmlFor="carbs">Carbs ({carbsPercentage}%)</Label>
                    </div>
                    <span className="text-sm text-muted-foreground">{Math.round(carbsGrams)}g</span>
                  </div>
                  <Slider
                    id="carbs"
                    min={10}
                    max={70}
                    step={1}
                    value={[carbsPercentage]}
                    onValueChange={handleCarbsChange}
                    className="[&>span]:bg-purple-500"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-yellow-500 mr-1.5"></div>
                      <Label htmlFor="fat">Fat ({fatPercentage}%)</Label>
                    </div>
                    <span className="text-sm text-muted-foreground">{Math.round(fatGrams)}g</span>
                  </div>
                  <Slider
                    id="fat"
                    min={10}
                    max={60}
                    step={1}
                    value={[fatPercentage]}
                    onValueChange={handleFatChange}
                    className="[&>span]:bg-yellow-500"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Goals
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Daily Targets Summary</CardTitle>
              <CardDescription>Your calculated nutrition targets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Calories</h3>
                    <p className="text-3xl font-bold">{calorieGoal}</p>
                    <p className="text-sm text-muted-foreground">kcal per day</p>
                  </div>

                  <div className="relative h-24 w-24">
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
                        strokeDasharray={`${(proteinPercentage * 251.2) / 100} 251.2`}
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
                        strokeDasharray={`${(carbsPercentage * 251.2) / 100} 251.2`}
                        strokeDashoffset={`${-(proteinPercentage * 251.2) / 100}`}
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
                        strokeDasharray={`${(fatPercentage * 251.2) / 100} 251.2`}
                        strokeDashoffset={`${-((proteinPercentage + carbsPercentage) * 251.2) / 100}`}
                        strokeLinecap="round"
                      />
                    </svg>

                    {/* Add text as an overlay instead of inside the SVG to avoid rotation issues */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-lg font-bold">{calorieGoal}</span>
                      <span className="text-xs text-muted-foreground">kcal</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-green-500 mr-1.5"></div>
                      <span className="text-sm font-medium">Protein</span>
                    </div>
                    <p className="text-xl font-bold">{Math.round(proteinGrams)}g</p>
                    <p className="text-xs text-muted-foreground">{proteinPercentage}% of calories</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-purple-500 mr-1.5"></div>
                      <span className="text-sm font-medium">Carbs</span>
                    </div>
                    <p className="text-xl font-bold">{Math.round(carbsGrams)}g</p>
                    <p className="text-xs text-muted-foreground">{carbsPercentage}% of calories</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-yellow-500 mr-1.5"></div>
                      <span className="text-sm font-medium">Fat</span>
                    </div>
                    <p className="text-xl font-bold">{Math.round(fatGrams)}g</p>
                    <p className="text-xs text-muted-foreground">{fatPercentage}% of calories</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recommended Ranges</CardTitle>
              <CardDescription>General guidelines for macronutrient distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-green-500 mr-1.5"></div>
                    <span className="text-sm font-medium">Protein</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Recommended range:</span>
                    <span className="text-sm font-medium">10-35% of calories</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-green-500"
                      style={{
                        width: "25%",
                        marginLeft: "10%",
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>10%</span>
                    <span>35%</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-purple-500 mr-1.5"></div>
                    <span className="text-sm font-medium">Carbs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Recommended range:</span>
                    <span className="text-sm font-medium">45-65% of calories</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-purple-500"
                      style={{
                        width: "20%",
                        marginLeft: "45%",
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>45%</span>
                    <span>65%</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-yellow-500 mr-1.5"></div>
                    <span className="text-sm font-medium">Fat</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Recommended range:</span>
                    <span className="text-sm font-medium">20-35% of calories</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-yellow-500"
                      style={{
                        width: "15%",
                        marginLeft: "20%",
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>20%</span>
                    <span>35%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}