import type { NutritionResponse } from "@/types/database"
import { NextRequest, NextResponse } from "next/server"
import { authenticateRequest, unauthorizedResponse } from "@/lib/auth-api"
import { openFoodFactsClient } from "@/lib/openfoodfacts"
import { readFileSync } from "fs"
import { join } from "path"
import OpenAI from "openai"

export async function POST(request: NextRequest) {
  try {
    // Authenticate the request
    const { user, error } = await authenticateRequest(request)
    
    if (error || !user) {
      return unauthorizedResponse(error || "Authentication required")
    }

    // Parse the request body
    const body = await request.json().catch(() => ({}))
    const { foodName, barcode, searchTerms } = body || {}

    if (!foodName && !barcode && !searchTerms) {
      return NextResponse.json({ 
        error: "Either foodName, barcode, or searchTerms is required" 
      }, { status: 400 })
    }

    let nutritionData: NutritionResponse | null = null

    // Strategy 1: Barcode lookup (most accurate)
    if (barcode) {
      console.log(`Attempting barcode lookup for: ${barcode}`)
      const product = await openFoodFactsClient.getProductByBarcode(barcode)
      
      if (product) {
        const converted = openFoodFactsClient.convertToNutritionResponse(product)
        if (converted) {
          nutritionData = converted
          console.log(`✅ Found product via barcode: ${product.product_name}`)
        }
      }
    }

    // Strategy 2: Search by product name/terms (if barcode failed or not provided)
    if (!nutritionData && (searchTerms || foodName)) {
      const query = searchTerms || foodName
      console.log(`Attempting product search for: ${query}`)
      
      const products = await openFoodFactsClient.searchProducts(query, 5)
      
      if (products.length > 0) {
        // Use the first/best match
        const bestMatch = products[0]
        const converted = openFoodFactsClient.convertToNutritionResponse(bestMatch)
        
        if (converted) {
          nutritionData = converted
          console.log(`✅ Found product via search: ${bestMatch.product_name}`)
        }
      }
    }

    // Strategy 3: AI fallback (last resort)
    if (!nutritionData) {
      console.log(`🤖 Falling back to AI for: ${foodName || searchTerms || barcode}`)
      
      // Get configuration from environment variables
      const OPENAI_API_KEY = process.env.OPENAI_API_KEY

      if (!OPENAI_API_KEY) {
        return NextResponse.json(
          { error: "No nutrition data found and AI fallback unavailable" },
          { status: 404 }
        )
      }

      try {
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

        // Use the foodName or searchTerms for AI analysis
        const analysisInput = foodName || searchTerms || `Product with barcode ${barcode}`

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
                  text: analysisInput
                }
              ]
            }
          ],
          text: {
            format: {
              type: "json_schema",
              name: schema.name,
              strict: schema.strict,
              schema: schema.schema
            }
          },
          reasoning: {},
          tools: [{
            type: "function",
            name: schema.name,
            strict: schema.strict,
            parameters: schema.schema,
            description: "A schema for defining food items and their macronutrient details."
          }],
          tool_choice: {
            type: "function",
            name: schema.name
          },
          temperature: 1,
          max_output_tokens: 2048,
          top_p: 1,
          store: true
        })

        // Extract the nutrition data from the function call in output
        const functionCall = (response as any).output?.find((item: any) => item.type === "function_call")
        if (functionCall?.arguments) {
          nutritionData = JSON.parse(functionCall.arguments)
          console.log(`🤖 AI analysis completed for: ${analysisInput}`)
        }
      } catch (aiError) {
        console.error("AI fallback failed:", aiError)
        return NextResponse.json(
          { error: "No nutrition data found and AI analysis failed" },
          { status: 500 }
        )
      }
    }

    if (!nutritionData) {
      return NextResponse.json(
        { error: "No nutrition data could be found for this item" },
        { status: 404 }
      )
    }

    // Add metadata about the data source
    const responseWithMeta = {
      ...nutritionData,
      dataSource: barcode && nutritionData ? 'openfoodfacts_barcode' :
                  (searchTerms || foodName) && nutritionData ? 'openfoodfacts_search' :
                  'ai_analysis'
    }

    return NextResponse.json(responseWithMeta)

  } catch (error: any) {
    console.error("Error in enhanced nutrition API:", error)
    return NextResponse.json({ 
      error: error.message || "Failed to process request" 
    }, { status: 500 })
  }
}