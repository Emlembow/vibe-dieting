"use client"

import type React from "react"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, Suspense } from "react"
import { MobileNav } from "@/components/mobile-nav"
import { SidebarNav } from "@/components/sidebar-nav"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Don't render children if not authenticated
  if (!user) {
    return null
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen flex-col">
        <Suspense fallback={<Skeleton className="h-16 w-full" />}>
          <MobileNav />
        </Suspense>
        <div className="flex flex-1">
          <Suspense fallback={<Skeleton className="h-full w-64" />}>
            <SidebarNav />
          </Suspense>
          <SidebarInset className="bg-background">
            <main className="flex-1 p-4 md:p-8">{children}</main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  )
}
