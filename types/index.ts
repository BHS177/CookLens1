export interface DetectedIngredient {
  id: string
  name: string
  confidence: number
  category: string
  boundingBox?: {
    x: number
    y: number
    width: number
    height: number
  }
}

export interface Recipe {
  id: string
  title: string
  description: string
  cuisine: string
  diet: string
  difficulty: 'facile' | 'moyen' | 'difficile'
  prepTime: number // in minutes
  cookTime: number // in minutes
  servings: number
  ingredients: RecipeIngredient[]
  instructions: RecipeStep[]
  nutrition: NutritionInfo
  imageUrl?: string
  createdAt: Date
}

export interface RecipeSuggestion {
  id: string
  title: string
  description: string
  cuisine: string
  difficulty: 'facile' | 'moyen' | 'difficile'
  prepTime: number
  cookTime: number
  servings: number
  imageUrl?: string
  tags: string[]
  rating?: number
}

export interface RecipeRequest {
  ingredients: DetectedIngredient[]
  cuisine?: string
  country?: string
  chefMode: 'expert' | 'country' | 'simple'
  maxPrepTime: number
  maxCookTime: number
  difficulty: string[]
  diet: string[]
  allergies: string[]
}

export interface RecipeIngredient {
  name: string
  amount: string
  unit: string
  notes?: string
}

export interface RecipeStep {
  step: number
  instruction: string
  duration?: number // in minutes
  temperature?: number // in celsius
  tips?: string // professional chef tips for this step
}

export interface NutritionInfo {
  calories: number
  protein: number // in grams
  carbs: number // in grams
  fat: number // in grams
  fiber: number // in grams
  sugar: number // in grams
  sodium: number // in mg
  saturatedFat?: number // in grams
  cholesterol?: number // in mg
  vitamins?: string[] // e.g., ["Vitamin A: 15%", "Vitamin C: 25%"]
  minerals?: string[] // e.g., ["Calcium: 8%", "Potassium: 18%"]
}

export interface UserPreferences {
  cuisine: string[]
  diet: string[]
  allergies: string[]
  maxPrepTime: number
  maxCookTime: number
  difficulty: string[]
  chefMode: 'expert' | 'country' | 'simple'
  selectedCountry: string | null
  autoUpdateRecipe: boolean
  modifiedIngredients?: DetectedIngredient[]
}

export interface SavedRecipe extends Recipe {
  isFavorite: boolean
  rating?: number
  notes?: string
  lastCooked?: Date
}

export type CuisineType = 
  | 'française'
  | 'italienne'
  | 'asiatique'
  | 'mexicaine'
  | 'indienne'
  | 'méditerranéenne'
  | 'américaine'
  | 'japonaise'
  | 'chinoise'
  | 'thaïlandaise'
  | 'libanaise'
  | 'grecque'

export type DietType = 
  | 'omnivore'
  | 'végétarien'
  | 'végétalien'
  | 'végétarien lacto-ovo'
  | 'pescétarien'
  | 'paléo'
  | 'cétogène'
  | 'sans gluten'
  | 'halal'
  | 'casher'
  | 'low-carb'
  | 'sans lactose'
