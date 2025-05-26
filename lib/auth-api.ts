import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function authenticateRequest(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        user: null,
        error: "Missing or invalid authorization header",
      }
    }

    const token = authHeader.substring(7)
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
        },
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    )

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return {
        user: null,
        error: error?.message || "Invalid or expired token",
      }
    }

    return {
      user,
      error: null,
    }
  } catch (error) {
    return {
      user: null,
      error: "Authentication failed",
    }
  }
}

export function unauthorizedResponse(message: string = "Unauthorized") {
  return NextResponse.json(
    { error: message },
    { status: 401 }
  )
}