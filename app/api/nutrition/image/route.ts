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

    // Parse the multipart form data to get the image
    const formData = await request.formData()
    const foodImage = formData.get("foodImage") as File | null

    if (!foodImage) {
      return NextResponse.json({ error: "Food image is required" }, { status: 400 })
    }

    // Load the nutrition analysis prompt
    const promptPath = join(process.cwd(), 'prompts', 'nutrition-analysis.md')
    const systemPrompt = readFileSync(promptPath, 'utf-8')

    // Load the JSON schema for structured output
    const schemaPath = join(process.cwd(), 'openai-assistant-schema.json')
    const schemaContent = readFileSync(schemaPath, 'utf-8')
    const schema = JSON.parse(schemaContent)

    // Convert image to base64 for the Responses API
    const imageArrayBuffer = await foodImage.arrayBuffer()
    const imageBuffer = Buffer.from(imageArrayBuffer)
    const base64Image = imageBuffer.toString('base64')
    const mimeType = foodImage.type || 'image/jpeg'

    // Create the response using OpenAI Responses API with image input
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-nano",
        input: [
          {
            role: "system",
            content: [
              {
                type: "input_text",
                text: systemPrompt
              }
            ]
          },
          {
            role: "user",
            content: [
              {
                type: "input_image",
                image: {
                  data: base64Image,
                  media_type: mimeType
                }
              }
            ]
          }
        ],
        text: {
          format: {
            type: "text"
          }
        },
        reasoning: {},
        tools: [{
          type: "function",
          function: {
            name: schema.name,
            description: "A schema for defining food items and their macronutrient details.",
            parameters: schema.schema,
            strict: schema.strict
          }
        }],
        temperature: 1,
        max_output_tokens: 2048,
        top_p: 1,
        store: true
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Error creating response:", errorData)
      throw new Error(`Failed to create response: ${errorData.error?.message || "Unknown error"}`)
    }

    const responseData = await response.json()

    // Extract the nutrition data from the function call
    const functionCall = responseData.input?.find((item: any) => item.type === "function_call")
    if (functionCall?.arguments) {
      try {
        const nutritionData: NutritionResponse = JSON.parse(functionCall.arguments)
        return NextResponse.json(nutritionData)
      } catch (parseError) {
        throw new Error("Failed to parse nutrition data")
      }
    } else {
      throw new Error("No function call found in response")
    }
  } catch (error: any) {
    console.error("Error in nutrition image API:", error)
    return NextResponse.json({ error: error.message || "Failed to process request" }, { status: 500 })
  }
}
