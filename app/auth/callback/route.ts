import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.redirect(new URL('/login?error=Configuration error', requestUrl.origin))
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(new URL(next, requestUrl.origin))
    }
  }

  // Handle hash-based tokens (for email confirmations)
  const hashParams = requestUrl.hash.substring(1)
  if (hashParams) {
    // Redirect to the home page with the hash parameters
    // The client-side auth will handle the token
    return NextResponse.redirect(new URL(`/?${hashParams}`, requestUrl.origin))
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(new URL('/login?error=Unable to verify email', requestUrl.origin))
}