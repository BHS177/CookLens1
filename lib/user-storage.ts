// User data storage utilities for cross-device synchronization
import { SavedRecipe, UserPreferences } from '@/types'

// UserPreferences is now imported from @/types

export interface UserStats {
  totalRecipesGenerated: number
  totalRecipesLiked: number
  favoriteCuisines: string[]
  mostUsedIngredients: string[]
  lastActive: string
}

export interface UserData {
  userId: string
  savedRecipes: SavedRecipe[]
  preferences: UserPreferences
  stats: UserStats
  createdAt: string
  updatedAt: string
}

// Storage key prefix for user data
const STORAGE_PREFIX = 'fridge_ai_user_'

// Get user data from localStorage
export function getUserData(userId: string): UserData | null {
  try {
    const data = localStorage.getItem(`${STORAGE_PREFIX}${userId}`)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Error loading user data:', error)
    return null
  }
}

// Save user data to localStorage
export function saveUserData(userData: UserData): void {
  try {
    const updatedData = {
      ...userData,
      updatedAt: new Date().toISOString()
    }
    localStorage.setItem(`${STORAGE_PREFIX}${userData.userId}`, JSON.stringify(updatedData))
  } catch (error) {
    console.error('Error saving user data:', error)
  }
}

// Initialize user data for new users
export function initializeUserData(userId: string): UserData {
  const defaultData: UserData = {
    userId,
    savedRecipes: [],
    preferences: {
      cuisine: [],
      diet: [],
      allergies: [],
      maxPrepTime: 60,
      maxCookTime: 60,
      difficulty: [],
      chefMode: 'simple',
      selectedCountry: null,
      autoUpdateRecipe: true,
    },
    stats: {
      totalRecipesGenerated: 0,
      totalRecipesLiked: 0,
      favoriteCuisines: [],
      mostUsedIngredients: [],
      lastActive: new Date().toISOString()
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  saveUserData(defaultData)
  return defaultData
}

// Add a recipe to saved recipes
export function saveRecipe(userId: string, recipe: Omit<SavedRecipe, 'id' | 'likedAt'>): void {
  const userData = getUserData(userId) || initializeUserData(userId)
  
  const newRecipe: SavedRecipe = {
    ...recipe,
    id: `recipe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    likedAt: new Date().toISOString()
  }
  
  userData.savedRecipes.push(newRecipe)
  userData.stats.totalRecipesLiked += 1
  userData.stats.lastActive = new Date().toISOString()
  
  saveUserData(userData)
}

// Remove a recipe from saved recipes
export function removeRecipe(userId: string, recipeId: string): void {
  const userData = getUserData(userId)
  if (!userData) return
  
  userData.savedRecipes = userData.savedRecipes.filter(recipe => recipe.id !== recipeId)
  userData.stats.totalRecipesLiked = Math.max(0, userData.stats.totalRecipesLiked - 1)
  userData.stats.lastActive = new Date().toISOString()
  
  saveUserData(userData)
}

// Update user preferences
export function updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): void {
  const userData = getUserData(userId) || initializeUserData(userId)
  
  userData.preferences = {
    ...userData.preferences,
    ...preferences
  }
  userData.stats.lastActive = new Date().toISOString()
  
  saveUserData(userData)
}

// Check if a recipe is saved
export function isRecipeSaved(userId: string, recipeTitle: string): boolean {
  const userData = getUserData(userId)
  if (!userData) return false
  
  return userData.savedRecipes.some(recipe => recipe.title === recipeTitle)
}

// Get user statistics
export function getUserStats(userId: string): UserStats | null {
  const userData = getUserData(userId)
  return userData ? userData.stats : null
}

// Clear all user data (for testing or account deletion)
export function clearUserData(userId: string): void {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${userId}`)
  } catch (error) {
    console.error('Error clearing user data:', error)
  }
}
