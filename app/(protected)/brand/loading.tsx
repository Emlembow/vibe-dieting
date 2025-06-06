import { Skeleton } from '@/components/ui/skeleton'

export default function BrandLoading() {
  return (
    <div className="container py-6 space-y-6">
      <div>
        <Skeleton className="h-9 w-48 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>

      {/* Logo showcase skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-6 space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="flex items-center justify-center h-24">
              <Skeleton className="h-16 w-32" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <Skeleton className="h-8 w-56 mb-4" />
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-start">
              <Skeleton className="h-2 w-2 rounded-full mt-2 mr-3" />
              <Skeleton className="h-5 w-full max-w-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}