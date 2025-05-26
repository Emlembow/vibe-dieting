import { createServerClient } from "@/lib/supabase"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function getAuthenticatedUser() {
  try {
    const supabase = createServerClient()
    
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    return user
  } catch (error) {
    console.error("Error getting authenticated user:", error)
    return null
  }
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { error: "Unauthorized. Please sign in to access this resource." },
    { status: 401 }
  )
}