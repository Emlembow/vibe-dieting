import type { NutritionResponse } from "@/types/database"
import { NextResponse } from "next/server"
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit"
import { nutritionRequestSchema, sanitizeInput } from "@/lib/validations"
import { headers } from "next/headers"
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth"

// Type for the OpenAI Assistant response format
interface AssistantResponse {
  foodDetails: {
    name: string
    description: string
  }
  macronutrients: {
    calories: number
    proteinGrams: number
    carbohydrates: {
      totalGrams: number
      fiberGrams: number
      sugarGrams: number
    }
    fat: {
      totalGrams: number
      saturatedGrams: number
    }
  }
}

// Transform assistant response to our database format
function transformAssistantResponse(assistantData: AssistantResponse): NutritionResponse {
  return {
    name: assistantData.foodDetails.name,
    description: assistantData.foodDetails.description,
    calories: assistantData.macronutrients.calories,
    protein_grams: assistantData.macronutrients.proteinGrams,
    carbs_total_grams: assistantData.macronutrients.carbohydrates.totalGrams,
    carbs_fiber_grams: assistantData.macronutrients.carbohydrates.fiberGrams,
    carbs_sugar_grams: assistantData.macronutrients.carbohydrates.sugarGrams,
    fat_total_grams: assistantData.macronutrients.fat.totalGrams,
    fat_saturated_grams: assistantData.macronutrients.fat.saturatedGrams,
  }
}

// Get configuration from environment variables
const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

// Validate required environment variables
if (!ASSISTANT_ID) {
  throw new Error("OPENAI_ASSISTANT_ID environment variable is required")
}
if (!OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is required")
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const user = await getAuthenticatedUser()
    if (!user) {
      return unauthorizedResponse()
    }

    // Rate limiting check - use user ID for authenticated users
    const headersList = await headers()
    const identifier = user.id || headersList.get("x-forwarded-for") || "anonymous"
    const { success } = await checkRateLimit(identifier)
    
    if (!success) {
      return rateLimitResponse()
    }

    // Parse and validate the request body
    const body = await request.json().catch(() => ({}))
    
    // Validate input
    const validationResult = nutritionRequestSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Invalid request",
          details: validationResult.error.errors.map(e => e.message).join(", ")
        }, 
        { status: 400 }
      )
    }
    
    const { foodName } = validationResult.data
    const sanitizedFoodName = sanitizeInput(foodName)
    
    console.log("Request received for food:", sanitizedFoodName)

    // Use the environment variable for the API key
    console.log("Using API key from environment variable")

    // Common headers for all requests
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "OpenAI-Beta": "assistants=v2", // Add the required beta header
    }

    // 1. Create a thread
    console.log("Creating thread...")
    const threadResponse = await fetch("https://api.openai.com/v1/threads", {
      method: "POST",
      headers,
      body: JSON.stringify({}),
    })

    if (!threadResponse.ok) {
      const errorData = await threadResponse.json()
      console.error("Error creating thread:", errorData)
      throw new Error(`Failed to create thread: ${errorData.error?.message || "Unknown error"}`)
    }

    const threadData = await threadResponse.json()
    const threadId = threadData.id
    console.log("Thread created:", threadId)

    // 2. Add a message to the thread
    console.log("Adding message to thread...")
    const messageResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        role: "user",
        content: `Provide nutrition information for: ${sanitizedFoodName}`,
      }),
    })

    if (!messageResponse.ok) {
      const errorData = await messageResponse.json()
      console.error("Error adding message:", errorData)
      throw new Error(`Failed to add message: ${errorData.error?.message || "Unknown error"}`)
    }

    console.log("Message added to thread")

    // 3. Run the assistant
    console.log("Running assistant...")
    const runResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        assistant_id: ASSISTANT_ID,
      }),
    })

    if (!runResponse.ok) {
      const errorData = await runResponse.json()
      console.error("Error running assistant:", errorData)
      throw new Error(`Failed to run assistant: ${errorData.error?.message || "Unknown error"}`)
    }

    const runData = await runResponse.json()
    const runId = runData.id
    console.log("Run created:", runId)

    // 4. Poll for the run to complete
    console.log("Polling for run completion...")
    let runStatus = "queued"
    let attempts = 0
    const maxAttempts = 30 // 30 seconds timeout

    while (runStatus !== "completed" && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const statusResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
        method: "GET",
        headers,
      })

      if (!statusResponse.ok) {
        const errorData = await statusResponse.json()
        console.error("Error checking run status:", errorData)
        throw new Error(`Failed to check run status: ${errorData.error?.message || "Unknown error"}`)
      }

      const statusData = await statusResponse.json()
      runStatus = statusData.status
      console.log(`Run status (attempt ${attempts + 1}): ${runStatus}`)
      attempts++

      if (runStatus === "failed" || runStatus === "cancelled" || runStatus === "expired") {
        throw new Error(`Run failed with status: ${runStatus}`)
      }
    }

    if (runStatus !== "completed") {
      throw new Error(`Run timed out or failed with status: ${runStatus}`)
    }

    // 5. Get the messages from the thread
    console.log("Retrieving messages...")
    const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: "GET",
      headers,
    })

    if (!messagesResponse.ok) {
      const errorData = await messagesResponse.json()
      console.error("Error retrieving messages:", errorData)
      throw new Error(`Failed to retrieve messages: ${errorData.error?.message || "Unknown error"}`)
    }

    const messagesData = await messagesResponse.json()
    console.log(`Retrieved ${messagesData.data.length} messages`)

    // Find the assistant's response
    const assistantMessages = messagesData.data.filter((message) => message.role === "assistant")

    if (assistantMessages.length === 0) {
      console.error("No assistant messages found")
      throw new Error("No response from assistant")
    }

    // Parse the JSON response
    const responseContent = assistantMessages[0].content[0]

    if (responseContent.type !== "text") {
      console.error(`Unexpected response type: ${responseContent.type}`)
      throw new Error("Unexpected response format")
    }

    console.log("Assistant response:", responseContent.text.value)

    // Parse the JSON from the text response
    try {
      const assistantData: AssistantResponse = JSON.parse(responseContent.text.value)
      const nutritionData = transformAssistantResponse(assistantData)
      return NextResponse.json(nutritionData)
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError)
      throw new Error("Failed to parse nutrition data")
    }
  } catch (error: any) {
    console.error("Error in nutrition API:", error)
    return NextResponse.json({ error: error.message || "Failed to process request" }, { status: 500 })
  }
}
