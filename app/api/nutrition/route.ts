import type { NutritionResponse } from "@/types/database"
import { NextRequest, NextResponse } from "next/server"
import { authenticateRequest, unauthorizedResponse } from "@/lib/auth-api"
import { readFileSync } from "fs"
import { join } from "path"

export async function POST(request: NextRequest) {
  try {
    // Get configuration from environment variables
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY

    // Validate required environment variables
    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Missing required environment variable: OPENAI_API_KEY" },
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

    // Load the nutrition analysis prompt
    const promptPath = join(process.cwd(), 'prompts', 'nutrition-analysis.md')
    const systemPrompt = readFileSync(promptPath, 'utf-8')

    // Load the JSON schema for structured output
    const schemaPath = join(process.cwd(), 'openai-assistant-schema.json')
    const schemaContent = readFileSync(schemaPath, 'utf-8')
    const schema = JSON.parse(schemaContent)

    // Create the response using OpenAI Responses API
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        instructions: systemPrompt,
        input: `Provide nutrition information for: ${foodName}`,
        text: {
          format: {
            type: "json_schema",
            name: "nutrition_response",
            json_schema: schema.schema
          }
        }
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Error creating response:", errorData)
      throw new Error(`Failed to create response: ${errorData.error?.message || "Unknown error"}`)
    }

    const responseData = await response.json()

    // Extract the nutrition data from the response
    if (responseData.output?.[0]?.content?.[0]?.type === "output_text") {
      const textContent = responseData.output[0].content[0].text
      try {
        const nutritionData: NutritionResponse = JSON.parse(textContent)
        return NextResponse.json(nutritionData)
      } catch (parseError) {
        throw new Error("Failed to parse nutrition data")
      }
    } else {
      throw new Error("Unexpected response format")
    }
  } catch (error: any) {
    console.error("Error in nutrition API:", error)
    return NextResponse.json({ error: error.message || "Failed to process request" }, { status: 500 })
  }
}
