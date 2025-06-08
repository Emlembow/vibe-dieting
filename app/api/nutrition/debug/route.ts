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

    console.log(`Debug lookup for barcode: ${barcode}`)

    // Look up product by barcode
    const product = await openFoodFactsClient.getProductByBarcode(barcode)
    
    if (!product) {
      return NextResponse.json({
        error: "Product not found in Open Food Facts database",
        barcode,
        message: "This barcode will fallback to AI nutrition lookup in the main system"
      }, { status: 404 })
    }

    // Return raw Open Food Facts data for debugging
    const debugInfo = {
      productName: product.product_name,
      brands: product.brands,
      servingSize: product.serving_size,
      servingQuantity: product.serving_quantity,
      rawNutriments: product.nutriments,
      
      // Show our conversion logic step by step
      conversionAnalysis: {
        hasServingSize: !!product.serving_size,
        useServing: !!product.serving_size,
        use100g: !product.serving_size,
        
        // Raw values
        energy_kcal_100g: product.nutriments?.['energy-kcal_100g'],
        energy_kcal_serving: product.nutriments?.['energy-kcal_serving'],
        
        // Our logic result
        selectedCalories: !product.serving_size 
          ? product.nutriments?.['energy-kcal_100g'] || 0
          : product.nutriments?.['energy-kcal_serving'] || product.nutriments?.['energy-kcal_100g'] || 0,
      },
      
      // Our converted result
      convertedResult: openFoodFactsClient.convertToNutritionResponse(product)
    }

    return NextResponse.json(debugInfo)

  } catch (error: any) {
    console.error("Error in debug API:", error)
    return NextResponse.json({ 
      error: error.message || "Failed to debug barcode lookup" 
    }, { status: 500 })
  }
}