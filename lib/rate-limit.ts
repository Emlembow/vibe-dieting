import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { NextResponse } from "next/server"

// Create a new ratelimiter instance lazily
let ratelimit: Ratelimit | null = null

function getRateLimiter() {
  if (!ratelimit && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, "1 m"),
      analytics: true,
    })
  }
  return ratelimit
}

export async function checkRateLimit(identifier: string) {
  const limiter = getRateLimiter()
  
  // If Redis is not configured, allow all requests
  if (!limiter) {
    console.warn("Rate limiting is disabled: Redis environment variables not configured")
    return { success: true }
  }

  try {
    const { success, limit, reset, remaining } = await limiter.limit(identifier)
    
    return {
      success,
      limit,
      reset,
      remaining,
    }
  } catch (error) {
    console.error("Rate limiting error:", error)
    // If rate limiting fails, allow the request but log the error
    return { success: true }
  }
}

export function rateLimitResponse() {
  return NextResponse.json(
    { 
      error: "Too many requests. Please try again later.",
      message: "You have exceeded the rate limit of 10 requests per minute."
    },
    { 
      status: 429,
      headers: {
        "Retry-After": "60",
      }
    }
  )
}