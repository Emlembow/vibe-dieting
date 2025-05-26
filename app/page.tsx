"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Check if we have auth params in the URL (from email verification)
    const hashParams = new URLSearchParams(window.location.search)
    const accessToken = hashParams.get("access_token")
    const refreshToken = hashParams.get("refresh_token")

    if (accessToken && refreshToken) {
      // Set the session with the tokens from email verification
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      }).then(({ error }) => {
        if (error) {
          console.error("Error setting session:", error)
          router.push("/login?error=verification_failed")
        } else {
          // Successfully verified and logged in
          router.push("/dashboard")
        }
      })
    } else {
      // No auth params, redirect to dashboard (will redirect to login if not authenticated)
      router.push("/dashboard")
    }
  }, [router])

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold">Loading...</h2>
        <p className="text-muted-foreground mt-2">Please wait while we redirect you.</p>
      </div>
    </div>
  )
}
