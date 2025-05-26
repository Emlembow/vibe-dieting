import type { NutritionResponse } from "@/types/database"
import { NextRequest, NextResponse } from "next/server"
import { authenticateRequest, unauthorizedResponse } from "@/lib/auth-api"

// Get configuration from environment variables
const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

export async function POST(request: NextRequest) {
  try {
    // Validate required environment variables
    if (!OPENAI_API_KEY || !ASSISTANT_ID) {
      return NextResponse.json(
        { error: "Missing required environment variables: OPENAI_API_KEY and OPENAI_ASSISTANT_ID" },
        { status: 500 }
      )
    }

    // Authenticate the request
    const { user, error } = await authenticateRequest(request)
    
    if (error || !user) {
      return unauthorizedResponse(error || "Authentication required")
    }

    // Parse the request body
    const body = await request.json().catch(() => ({}))
    const { foodName } = body || {}


    if (!foodName) {
      return NextResponse.json({ error: "Food name is required" }, { status: 400 })
    }

    // Use the environment variable for the API key

    // Common headers for all requests
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "OpenAI-Beta": "assistants=v2", // Add the required beta header
    }

    // 1. Create a thread
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

    // 2. Add a message to the thread
    const messageResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        role: "user",
        content: `Provide nutrition information for: ${foodName}`,
      }),
    })

    if (!messageResponse.ok) {
      const errorData = await messageResponse.json()
      console.error("Error adding message:", errorData)
      throw new Error(`Failed to add message: ${errorData.error?.message || "Unknown error"}`)
    }


    // 3. Run the assistant
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

    // 4. Poll for the run to complete
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
      attempts++

      if (runStatus === "failed" || runStatus === "cancelled" || runStatus === "expired") {
        throw new Error(`Run failed with status: ${runStatus}`)
      }
    }

    if (runStatus !== "completed") {
      throw new Error(`Run timed out or failed with status: ${runStatus}`)
    }

    // 5. Get the messages from the thread
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

    // Find the assistant's response
    const assistantMessages = messagesData.data.filter((message) => message.role === "assistant")

    if (assistantMessages.length === 0) {
      throw new Error("No response from assistant")
    }

    // Parse the JSON response
    const responseContent = assistantMessages[0].content[0]

    if (responseContent.type !== "text") {
      throw new Error("Unexpected response format")
    }


    // Parse the JSON from the text response
    try {
      const nutritionData: NutritionResponse = JSON.parse(responseContent.text.value)
      return NextResponse.json(nutritionData)
    } catch (parseError) {
      throw new Error("Failed to parse nutrition data")
    }
  } catch (error: any) {
    console.error("Error in nutrition API:", error)
    return NextResponse.json({ error: error.message || "Failed to process request" }, { status: 500 })
  }
}
