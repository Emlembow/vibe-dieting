/**
 * Open Food Facts API integration
 * Provides deterministic nutrition data lookup using the world's largest open food database
 */

export interface OpenFoodFactsProduct {
  code: string
  product_name?: string
  brands?: string
  categories?: string
  ingredients_text?: string
  nutriments?: {
    'energy-kcal_100g'?: number
    'energy-kcal_serving'?: number
    'proteins_100g'?: number
    'proteins_serving'?: number
    'carbohydrates_100g'?: number
    'carbohydrates_serving'?: number
    'fat_100g'?: number
    'fat_serving'?: number
    'fiber_100g'?: number
    'fiber_serving'?: number
    'sugars_100g'?: number
    'sugars_serving'?: number
    'saturated-fat_100g'?: number
    'saturated-fat_serving'?: number
    'sodium_100g'?: number
    'sodium_serving'?: number
  }
  serving_size?: string
  serving_quantity?: number
  nutriscore_grade?: string
  nova_group?: number
}

export interface OpenFoodFactsResponse {
  code: string
  status: number
  status_verbose: string
  product?: OpenFoodFactsProduct
}

export interface OpenFoodFactsSearchResult {
  products: OpenFoodFactsProduct[]
  count: number
  page: number
  page_count: number
  page_size: number
  skip: number
}

/**
 * Open Food Facts API client
 */
export class OpenFoodFactsClient {
  private baseUrl = 'https://world.openfoodfacts.org'
  private userAgent = 'MacroTracker/1.0 (https://github.com/yourusername/macro-tracker)'

  /**
   * Look up a product by barcode
   */
  async getProductByBarcode(barcode: string): Promise<OpenFoodFactsProduct | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v2/product/${barcode}.json`, {
        headers: {
          'User-Agent': this.userAgent,
        },
      })

      if (!response.ok) {
        console.error(`Open Food Facts API error: ${response.status}`)
        return null
      }

      const data: OpenFoodFactsResponse = await response.json()
      
      if (data.status === 1 && data.product) {
        return data.product
      }

      return null
    } catch (error) {
      console.error('Error fetching product by barcode:', error)
      return null
    }
  }

  /**
   * Search for products by name
   */
  async searchProducts(query: string, limit = 10): Promise<OpenFoodFactsProduct[]> {
    try {
      const searchParams = new URLSearchParams({
        search_terms: query,
        page_size: limit.toString(),
        json: '1',
      })

      const response = await fetch(`${this.baseUrl}/cgi/search.pl?${searchParams}`, {
        headers: {
          'User-Agent': this.userAgent,
        },
      })

      if (!response.ok) {
        console.error(`Open Food Facts search API error: ${response.status}`)
        return []
      }

      const data: OpenFoodFactsSearchResult = await response.json()
      return data.products || []
    } catch (error) {
      console.error('Error searching products:', error)
      return []
    }
  }

  /**
   * Convert Open Food Facts nutrition data to our format
   */
  convertToNutritionResponse(product: OpenFoodFactsProduct, servingSize?: string): {
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
    requiresServingSize?: boolean
  } | null {
    const { nutriments, product_name, brands, serving_size } = product

    if (!nutriments || !product_name) {
      return null
    }

    // Logic for serving size:
    // 1. If user provides custom serving size, use 100g values and let them adjust
    // 2. If product has REASONABLE serving size and serving values, use serving values
    // 3. Otherwise, use 100g values as fallback
    
    const hasCustomServing = !!servingSize
    
    // Check what data is available
    const serving_quantity = product.serving_quantity
    const hasProductServing = !!nutriments['energy-kcal_serving']
    const has100gData = !!nutriments['energy-kcal_100g']
    
    // If no serving data and no custom serving provided, we need user input
    if (!hasProductServing && !hasCustomServing) {
      return {
        foodDetails: {
          name: product_name,
          description: `${product_name}${brands ? ` by ${brands}` : ''} (serving size needed)`,
        },
        macronutrients: {
          calories: 0,
          proteinGrams: 0,
          carbohydrates: {
            totalGrams: 0,
            fiberGrams: 0,
            sugarGrams: 0,
          },
          fat: {
            totalGrams: 0,
            saturatedGrams: 0,
          },
        },
        requiresServingSize: true
      }
    }
    
    // Parse serving size for display purposes
    let servingSizeNum = 0
    if (serving_quantity) {
      // Handle serving_quantity as string or number  
      servingSizeNum = typeof serving_quantity === 'string' ? parseFloat(serving_quantity) : serving_quantity
    } else if (serving_size) {
      // Try to extract number from serving_size for display
      const parenthesesMatch = serving_size.match(/\((\d+(?:\.\d+)?)\s*[a-z]*\)/)
      if (parenthesesMatch) {
        servingSizeNum = parseFloat(parenthesesMatch[1])
      } else {
        const numberMatch = serving_size.match(/(\d+(?:\.\d+)?)/)
        if (numberMatch) {
          servingSizeNum = parseFloat(numberMatch[1])
        }
      }
    }
    
    let calories: number
    let protein: number
    let carbs: number
    let fat: number
    let fiber: number
    let sugar: number
    let saturatedFat: number

    if (hasCustomServing) {
      // User provided custom serving size, calculate from 100g values
      const customServingGrams = parseFloat(servingSize!) 
      const ratio = customServingGrams / 100
      
      calories = (nutriments['energy-kcal_100g'] || 0) * ratio
      protein = (nutriments['proteins_100g'] || 0) * ratio
      carbs = (nutriments['carbohydrates_100g'] || 0) * ratio
      fat = (nutriments['fat_100g'] || 0) * ratio
      fiber = (nutriments['fiber_100g'] || 0) * ratio
      sugar = (nutriments['sugars_100g'] || 0) * ratio
      saturatedFat = (nutriments['saturated-fat_100g'] || 0) * ratio
    } else if (hasProductServing) {
      // Product has serving data, use it exactly as provided
      calories = nutriments['energy-kcal_serving'] || 0
      protein = nutriments['proteins_serving'] || 0
      carbs = nutriments['carbohydrates_serving'] || 0
      fat = nutriments['fat_serving'] || 0
      fiber = nutriments['fiber_serving'] || 0
      sugar = nutriments['sugars_serving'] || 0
      saturatedFat = nutriments['saturated-fat_serving'] || 0
    } else {
      // This shouldn't happen since we check for this case above
      calories = nutriments['energy-kcal_100g'] || 0
      protein = nutriments['proteins_100g'] || 0
      carbs = nutriments['carbohydrates_100g'] || 0
      fat = nutriments['fat_100g'] || 0
      fiber = nutriments['fiber_100g'] || 0
      sugar = nutriments['sugars_100g'] || 0
      saturatedFat = nutriments['saturated-fat_100g'] || 0
    }

    // Build description
    const brandInfo = brands ? `by ${brands}` : ''
    let servingInfo = ''
    
    if (hasCustomServing) {
      servingInfo = ` (per ${servingSize}g)`
    } else if (hasProductServing) {
      // We have serving data, show what we're using
      if (serving_size) {
        servingInfo = ` (per ${serving_size})`
      } else if (servingSizeNum) {
        servingInfo = ` (per serving: ${servingSizeNum}g)`
      } else {
        servingInfo = ` (per serving)`
      }
    }
    
    const description = `${product_name} ${brandInfo}${servingInfo}`.trim()

    return {
      foodDetails: {
        name: product_name,
        description,
      },
      macronutrients: {
        calories: Math.round(calories),
        proteinGrams: Math.round(protein * 10) / 10, // Round to 1 decimal
        carbohydrates: {
          totalGrams: Math.round(carbs * 10) / 10,
          fiberGrams: Math.round(fiber * 10) / 10,
          sugarGrams: Math.round(sugar * 10) / 10,
        },
        fat: {
          totalGrams: Math.round(fat * 10) / 10,
          saturatedGrams: Math.round(saturatedFat * 10) / 10,
        },
      },
    }
  }
}

// Export singleton instance
export const openFoodFactsClient = new OpenFoodFactsClient()