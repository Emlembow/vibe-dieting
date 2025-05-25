"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format, subDays, eachDayOfInterval } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function TrendsPage() {
  const [dateRange, setDateRange] = useState<{
    from: Date
    to: Date
  }>({
    from: subDays(new Date(), 7),
    to: new Date(),
  })

  // Generate sample data for the charts
  const days = eachDayOfInterval({
    start: dateRange.from,
    end: dateRange.to,
  })

  const generateRandomData = (min: number, max: number, days: Date[]) => {
    return days.map((day) => ({
      date: format(day, "MMM dd"),
      value: Math.floor(Math.random() * (max - min + 1)) + min,
    }))
  }

  const caloriesData = generateRandomData(1500, 2500, days)
  const proteinData = generateRandomData(80, 150, days)
  const carbsData = generateRandomData(150, 250, days)
  const fatData = generateRandomData(40, 80, days)

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
                onSelect={(range) => range && setDateRange(range)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Select defaultValue="day">
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
                {/* Simple bar chart for calories */}
                <div className="flex h-[350px] items-end justify-between gap-2">
                  {caloriesData.map((item, i) => (
                    <div key={i} className="flex flex-1 flex-col items-center">
                      <div
                        className="w-full rounded-t-sm bg-gradient-to-t from-orange-500 to-red-500"
                        style={{ height: `${(item.value / 2500) * 100}%` }}
                      ></div>
                      <div className="mt-2 text-xs text-muted-foreground">{item.date}</div>
                      <div className="text-xs font-medium">{item.value}</div>
                    </div>
                  ))}
                </div>
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
                {/* Simple bar chart for protein */}
                <div className="flex h-[350px] items-end justify-between gap-2">
                  {proteinData.map((item, i) => (
                    <div key={i} className="flex flex-1 flex-col items-center">
                      <div
                        className="w-full rounded-t-sm bg-gradient-to-t from-green-500 to-emerald-500"
                        style={{ height: `${(item.value / 150) * 100}%` }}
                      ></div>
                      <div className="mt-2 text-xs text-muted-foreground">{item.date}</div>
                      <div className="text-xs font-medium">{item.value}g</div>
                    </div>
                  ))}
                </div>
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
                {/* Simple bar chart for carbs */}
                <div className="flex h-[350px] items-end justify-between gap-2">
                  {carbsData.map((item, i) => (
                    <div key={i} className="flex flex-1 flex-col items-center">
                      <div
                        className="w-full rounded-t-sm bg-gradient-to-t from-purple-500 to-violet-500"
                        style={{ height: `${(item.value / 250) * 100}%` }}
                      ></div>
                      <div className="mt-2 text-xs text-muted-foreground">{item.date}</div>
                      <div className="text-xs font-medium">{item.value}g</div>
                    </div>
                  ))}
                </div>
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
                {/* Simple bar chart for fat */}
                <div className="flex h-[350px] items-end justify-between gap-2">
                  {fatData.map((item, i) => (
                    <div key={i} className="flex flex-1 flex-col items-center">
                      <div
                        className="w-full rounded-t-sm bg-gradient-to-t from-yellow-500 to-amber-500"
                        style={{ height: `${(item.value / 80) * 100}%` }}
                      ></div>
                      <div className="mt-2 text-xs text-muted-foreground">{item.date}</div>
                      <div className="text-xs font-medium">{item.value}g</div>
                    </div>
                  ))}
                </div>
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
                    strokeDasharray="75.36 251.2"
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
                    strokeDasharray="100.48 251.2"
                    strokeDashoffset="-75.36"
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
                    strokeDasharray="75.36 251.2"
                    strokeDashoffset="-175.84"
                    strokeLinecap="round"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold">2,100</span>
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
                <div className="mt-1 text-2xl font-bold">30%</div>
                <div className="text-xs text-muted-foreground">120g avg.</div>
              </div>
              <div>
                <div className="flex items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-purple-500 mr-1.5"></div>
                  <span className="text-sm font-medium">Carbs</span>
                </div>
                <div className="mt-1 text-2xl font-bold">40%</div>
                <div className="text-xs text-muted-foreground">210g avg.</div>
              </div>
              <div>
                <div className="flex items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-yellow-500 mr-1.5"></div>
                  <span className="text-sm font-medium">Fat</span>
                </div>
                <div className="mt-1 text-2xl font-bold">30%</div>
                <div className="text-xs text-muted-foreground">70g avg.</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Goal Completion</CardTitle>
            <CardDescription>How often you've met your nutrition goals</CardDescription>
          </CardHeader>
          <CardContent>
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
                      strokeDasharray={`${(85 * 251.2) / 100} 251.2`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold">85%</span>
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
                  <span className="font-medium">90%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div className="h-full rounded-full bg-green-500" style={{ width: "90%" }}></div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-purple-500 mr-1.5"></div>
                    <span className="text-sm font-medium">Carbs</span>
                  </div>
                  <span className="font-medium">75%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div className="h-full rounded-full bg-purple-500" style={{ width: "75%" }}></div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-yellow-500 mr-1.5"></div>
                    <span className="text-sm font-medium">Fat</span>
                  </div>
                  <span className="font-medium">80%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div className="h-full rounded-full bg-yellow-500" style={{ width: "80%" }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
