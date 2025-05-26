import { NextResponse } from "next/server"

export async function GET() {
  // This endpoint has been disabled for security reasons.
  // Admin SDK should not be used in application code.
  // Use the standard registration flow instead.
  return NextResponse.json(
    { error: "This endpoint has been disabled. Please use the standard registration flow." },
    { status: 410 } // 410 Gone
  )
}