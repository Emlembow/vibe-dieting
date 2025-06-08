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
  } | null {
    const { nutriments, product_name, brands, serving_size } = product

    if (!nutriments || !product_name) {
      return null
    }

    // Use provided serving size or default to 100g
    const useServing = servingSize || serving_size
    const use100g = !useServing

    // Extract nutrition values (prefer serving if available, otherwise use 100g)
    const calories = use100g 
      ? nutriments['energy-kcal_100g'] || 0
      : nutriments['energy-kcal_serving'] || nutriments['energy-kcal_100g'] || 0

    const protein = use100g
      ? nutriments['proteins_100g'] || 0
      : nutriments['proteins_serving'] || nutriments['proteins_100g'] || 0

    const carbs = use100g
      ? nutriments['carbohydrates_100g'] || 0
      : nutriments['carbohydrates_serving'] || nutriments['carbohydrates_100g'] || 0

    const fat = use100g
      ? nutriments['fat_100g'] || 0
      : nutriments['fat_serving'] || nutriments['fat_100g'] || 0

    const fiber = use100g
      ? nutriments['fiber_100g'] || 0
      : nutriments['fiber_serving'] || nutriments['fiber_100g'] || 0

    const sugar = use100g
      ? nutriments['sugars_100g'] || 0
      : nutriments['sugars_serving'] || nutriments['sugars_100g'] || 0

    const saturatedFat = use100g
      ? nutriments['saturated-fat_100g'] || 0
      : nutriments['saturated-fat_serving'] || nutriments['saturated-fat_100g'] || 0

    // Build description
    const brandInfo = brands ? `by ${brands}` : ''
    const servingInfo = useServing ? ` (per ${useServing})` : ' (per 100g)'
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