import { Suspense } from "react"
import { getTrendData } from "@/app/actions/trends"
import TrendsClient from "./trends-client"
import { subDays } from "date-fns"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface TrendsPageProps {
  searchParams: Promise<{ 
    from?: string
    to?: string
    interval?: "day" | "week" | "month"
  }>
}

function TrendsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-60" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Card className="p-6">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-48 mb-4" />
          <Skeleton className="h-[400px] w-full" />
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-56 mb-4" />
          <Skeleton className="h-[300px] w-full" />
        </Card>
        <Card className="p-6">
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-56 mb-4" />
          <Skeleton className="h-[300px] w-full" />
        </Card>
      </div>
    </div>
  )
}

export default async function TrendsPage({ searchParams }: TrendsPageProps) {
  const resolvedSearchParams = await searchParams
  const fromDate = resolvedSearchParams.from ? new Date(resolvedSearchParams.from) : subDays(new Date(), 7)
  const toDate = resolvedSearchParams.to ? new Date(resolvedSearchParams.to) : new Date()
  const interval = resolvedSearchParams.interval || "day"

  const { dailyTotals, summary, macroGoal } = await getTrendData(fromDate, toDate)

  return (
    <Suspense fallback={<TrendsSkeleton />}>
      <TrendsClient 
        initialData={dailyTotals}
        initialSummary={summary}
        initialMacroGoal={macroGoal}
        initialDateRange={{ from: fromDate, to: toDate }}
        initialInterval={interval}
      />
    </Suspense>
  )
}