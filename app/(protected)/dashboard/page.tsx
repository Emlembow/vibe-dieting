import { Suspense } from "react"
import { getDashboardData, getWeeklyData } from "@/app/actions/dashboard"
import DashboardClient from "./dashboard-client"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface DashboardPageProps {
  searchParams: Promise<{ date?: string }>
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-24" />
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-64 w-full" />
        </Card>
        <Card className="p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-64 w-full" />
        </Card>
      </div>
    </div>
  )
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const resolvedSearchParams = await searchParams
  const selectedDate = resolvedSearchParams.date ? new Date(resolvedSearchParams.date) : new Date()
  
  const [dashboardData, weeklyData] = await Promise.all([
    getDashboardData(selectedDate),
    getWeeklyData()
  ])

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardClient 
        initialData={dashboardData}
        initialWeeklyData={weeklyData}
        initialDate={selectedDate}
      />
    </Suspense>
  )
}