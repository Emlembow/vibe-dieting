"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format, subDays, addDays } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getTrendData, type TrendData, type TrendSummary } from "@/app/actions/trends"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/context/auth-context"
import type { MacroGoal } from "@/types/database"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

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
        const { dailyTotals, summary, macroGoal } = await getTrendData(dateRange.from, dateRange.to, user.id)
        setTrendData(dailyTotals)
        setSummary(summary)
        setMacroGoal(macroGoal)
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
                {isLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
                  </div>
                ) : trendData.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    No data available for the selected period
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis 
                        dataKey="date" 
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        interval={0}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        domain={[0, 'dataMax + 100']}
                      />
                      <Tooltip 
                        formatter={(value: number) => [`${value} cal`, 'Calories']}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="calories" radius={[8, 8, 0, 0]}>
                        {trendData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill="url(#colorCalories)" />
                        ))}
                      </Bar>
                      <defs>
                        <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ef4444" stopOpacity={1} />
                          <stop offset="100%" stopColor="#f97316" stopOpacity={1} />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                )}
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
                {isLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
                  </div>
                ) : trendData.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    No data available for the selected period
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis 
                        dataKey="date" 
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        interval={0}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        domain={[0, 'dataMax + 10']}
                      />
                      <Tooltip 
                        formatter={(value: number) => [`${value}g`, 'Protein']}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="protein" radius={[8, 8, 0, 0]}>
                        {trendData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill="url(#colorProtein)" />
                        ))}
                      </Bar>
                      <defs>
                        <linearGradient id="colorProtein" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                          <stop offset="100%" stopColor="#22c55e" stopOpacity={1} />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                )}
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
                {isLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
                  </div>
                ) : trendData.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    No data available for the selected period
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis 
                        dataKey="date" 
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        interval={0}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        domain={[0, 'dataMax + 10']}
                      />
                      <Tooltip 
                        formatter={(value: number) => [`${value}g`, 'Carbs']}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="carbs" radius={[8, 8, 0, 0]}>
                        {trendData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill="url(#colorCarbs)" />
                        ))}
                      </Bar>
                      <defs>
                        <linearGradient id="colorCarbs" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1} />
                          <stop offset="100%" stopColor="#a855f7" stopOpacity={1} />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                )}
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
                {isLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
                  </div>
                ) : trendData.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    No data available for the selected period
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis 
                        dataKey="date" 
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        interval={0}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        domain={[0, 'dataMax + 10']}
                      />
                      <Tooltip 
                        formatter={(value: number) => [`${value}g`, 'Fat']}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="fat" radius={[8, 8, 0, 0]}>
                        {trendData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill="url(#colorFat)" />
                        ))}
                      </Bar>
                      <defs>
                        <linearGradient id="colorFat" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#eab308" stopOpacity={1} />
                          <stop offset="100%" stopColor="#f59e0b" stopOpacity={1} />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                )}
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
            {isLoading ? (
              <div className="flex h-[300px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
              </div>
            ) : summary ? (
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
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Goal Completion</CardTitle>
            <CardDescription>How often you've met your nutrition goals</CardDescription>
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
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                {!macroGoal ? "Set your macro goals to track completion" : "No data available"}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}