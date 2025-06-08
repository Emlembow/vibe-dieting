import type { NutritionResponse } from "@/types/database"
import { NextRequest, NextResponse } from "next/server"
import { authenticateRequest, unauthorizedResponse } from "@/lib/auth-api"
import { openFoodFactsClient } from "@/lib/openfoodfacts"

export async function GET(request: NextRequest) {
  try {
    // Authenticate the request
    const { user, error } = await authenticateRequest(request)
    
    if (error || !user) {
      return unauthorizedResponse(error || "Authentication required")
    }

    // Get barcode from search params
    const { searchParams } = new URL(request.url)
    const barcode = searchParams.get('barcode')

    if (!barcode) {
      return NextResponse.json({ 
        error: "Barcode parameter is required" 
      }, { status: 400 })
    }

    // Validate barcode format (basic validation)
    if (!/^\d{8,14}$/.test(barcode)) {
      return NextResponse.json({ 
        error: "Invalid barcode format. Must be 8-14 digits." 
      }, { status: 400 })
    }

    console.log(`Looking up barcode: ${barcode}`)

    // Look up product by barcode
    const product = await openFoodFactsClient.getProductByBarcode(barcode)
    
    if (!product) {
      return NextResponse.json({
        error: "Product not found",
        barcode,
        suggestions: "Try searching by product name instead"
      }, { status: 404 })
    }

    // Convert to our nutrition format
    const nutritionData = openFoodFactsClient.convertToNutritionResponse(product)
    
    if (!nutritionData) {
      return NextResponse.json({
        error: "Product found but nutrition data incomplete",
        productName: product.product_name,
        barcode,
        suggestions: "Try searching by product name for more detailed analysis"
      }, { status: 404 })
    }

    // Add metadata about the product
    const responseWithMeta = {
      ...nutritionData,
      dataSource: 'openfoodfacts_barcode',
      barcode,
      productInfo: {
        brands: product.brands,
        categories: product.categories,
        ingredients: product.ingredients_text,
        nutriScore: product.nutriscore_grade,
        novaGroup: product.nova_group,
        servingSize: product.serving_size
      }
    }

    console.log(`✅ Successfully found product: ${product.product_name}`)

    return NextResponse.json(responseWithMeta)

  } catch (error: any) {
    console.error("Error in barcode nutrition API:", error)
    return NextResponse.json({ 
      error: error.message || "Failed to process barcode lookup" 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate the request
    const { user, error } = await authenticateRequest(request)
    
    if (error || !user) {
      return unauthorizedResponse(error || "Authentication required")
    }

    // Parse the request body
    const body = await request.json().catch(() => ({}))
    const { barcode, servingSize } = body || {}

    if (!barcode) {
      return NextResponse.json({ 
        error: "Barcode is required" 
      }, { status: 400 })
    }

    // Validate barcode format
    if (!/^\d{8,14}$/.test(barcode)) {
      return NextResponse.json({ 
        error: "Invalid barcode format. Must be 8-14 digits." 
      }, { status: 400 })
    }

    console.log(`Looking up barcode with custom serving: ${barcode}`)

    // Look up product by barcode
    const product = await openFoodFactsClient.getProductByBarcode(barcode)
    
    if (!product) {
      return NextResponse.json({
        error: "Product not found",
        barcode,
      }, { status: 404 })
    }

    // Convert to our nutrition format with custom serving size
    const nutritionData = openFoodFactsClient.convertToNutritionResponse(product, servingSize)
    
    if (!nutritionData) {
      return NextResponse.json({
        error: "Product found but nutrition data incomplete",
        productName: product.product_name,
        barcode,
      }, { status: 404 })
    }

    // Add metadata
    const responseWithMeta = {
      ...nutritionData,
      dataSource: 'openfoodfacts_barcode',
      barcode,
      customServing: servingSize,
      productInfo: {
        brands: product.brands,
        categories: product.categories,
        nutriScore: product.nutriscore_grade,
        novaGroup: product.nova_group,
        originalServingSize: product.serving_size
      }
    }

    return NextResponse.json(responseWithMeta)

  } catch (error: any) {
    console.error("Error in barcode nutrition POST API:", error)
    return NextResponse.json({ 
      error: error.message || "Failed to process barcode lookup" 
    }, { status: 500 })
  }
}