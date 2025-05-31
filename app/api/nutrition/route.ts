import type { NutritionResponse } from "@/types/database"
import { NextRequest, NextResponse } from "next/server"
import { authenticateRequest, unauthorizedResponse } from "@/lib/auth-api"
import { readFileSync } from "fs"
import { join } from "path"
import OpenAI from "openai"

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

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
    })

    // Create the response using OpenAI Responses API
    const response = await openai.responses.create({
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
              type: "input_text",
              text: foodName
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
        name: schema.name,
        description: "A schema for defining food items and their macronutrient details.",
        parameters: schema.schema,
        strict: schema.strict
      }],
      temperature: 1,
      max_output_tokens: 2048,
      top_p: 1,
      store: true
    })

    // Extract the nutrition data from the function call in output
    const functionCall = (response as any).output?.find((item: any) => item.type === "function_call")
    if (functionCall?.arguments) {
      try {
        const nutritionData: NutritionResponse = JSON.parse(functionCall.arguments)
        return NextResponse.json(nutritionData)
      } catch (parseError) {
        console.error("Failed to parse nutrition data:", parseError)
        throw new Error("Failed to parse nutrition data")
      }
    } else {
      console.error("No function call found in response:", JSON.stringify((response as any).output, null, 2))
      throw new Error("No function call found in response")
    }
  } catch (error: any) {
    console.error("Error in nutrition API:", error)
    return NextResponse.json({ error: error.message || "Failed to process request" }, { status: 500 })
  }
}
