import { createClient } from "@supabase/supabase-js"

// Create a single supabase client for the browser
export const supabase = (() => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your_supabase_project_url') {
    // Return a dummy client during build time or when env vars are not set
    return null as any
  }
  
  return createClient(supabaseUrl, supabaseAnonKey)
})()

// Create a helper to get the server supabase client
// NOTE: This now uses the anon key for security. Service role key should only be used in secure backend services.
export const createServerClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your_supabase_project_url') {
    throw new Error("Missing or invalid Supabase environment variables")
  }
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  })
}
