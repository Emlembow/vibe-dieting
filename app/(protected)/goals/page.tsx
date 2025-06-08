import { Suspense } from "react"
import { getGoalsData } from "@/app/actions/goals"
import GoalsClient from "./goals-client"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

function GoalsSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
          
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i}>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
          
          <Skeleton className="h-10 w-full" />
        </div>
      </Card>
    </div>
  )
}

export default async function GoalsPage() {
  const { macroGoal, user } = await getGoalsData()

  return (
    <Suspense fallback={<GoalsSkeleton />}>
      <GoalsClient initialGoal={macroGoal} />
    </Suspense>
  )
}