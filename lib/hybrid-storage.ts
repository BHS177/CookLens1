import { SavedRecipe, UserPreferences } from '@/types'
import { v4 as uuidv4 } from 'uuid'

// Fallback to localStorage if cloud storage is not available
const DEFAULT_PREFERENCES: UserPreferences = {
  cuisine: [],
  diet: [],
  allergies: [],
  maxPrepTime: 60,
  maxCookTime: 60,
  difficulty: [],
  chefMode: 'simple',
  selectedCountry: null,
  autoUpdateRecipe: true,
}

interface UserData {
  savedRecipes: SavedRecipe[]
  preferences: UserPreferences
  generatedRecipes: SavedRecipe[]
}

const getStorageKey = (userId: string) => `fridge_ai_user_data_${userId}`

// Cloud storage functions (will be implemented when Supabase is configured)
const cloudStorage = {
  async getUserData(userId: string): Promise<UserData | null> {
    try {
      const response = await fetch(`/api/user-data?userId=${userId}`)
      if (response.ok) {
        return await response.json()
      }
    } catch (error) {
      console.log('Cloud storage not available, falling back to localStorage')
    }
    return null
  },

  async saveRecipe(userId: string, recipe: Omit<SavedRecipe, 'id' | 'likedAt'>): Promise<boolean> {
    try {
      const response = await fetch('/api/user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'saveRecipe',
          userId,
          recipe
        })
      })
      return response.ok
    } catch (error) {
      console.log('Cloud storage not available, falling back to localStorage')
      return false
    }
  },

  async removeRecipe(userId: string, recipeId: string): Promise<boolean> {
    try {
      const response = await fetch('/api/user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'removeRecipe',
          userId,
          recipeId
        })
      })
      return response.ok
    } catch (error) {
      console.log('Cloud storage not available, falling back to localStorage')
      return false
    }
  },

  async isRecipeSaved(userId: string, recipeTitle: string): Promise<boolean> {
    try {
      const response = await fetch('/api/user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'isRecipeSaved',
          userId,
          recipeTitle
        })
      })
      if (response.ok) {
        const result = await response.json()
        return result.isSaved
      }
    } catch (error) {
      console.log('Cloud storage not available, falling back to localStorage')
    }
    return false
  }
}

// Local storage functions (fallback)
const localStorage = {
  getUserData(userId: string): UserData {
    if (typeof window === 'undefined') {
      return { savedRecipes: [], preferences: DEFAULT_PREFERENCES, generatedRecipes: [] }
    }
    const data = window.localStorage.getItem(getStorageKey(userId))
    if (data) {
      try {
        const parsedData: UserData = JSON.parse(data)
        return {
          savedRecipes: parsedData.savedRecipes || [],
          preferences: { ...DEFAULT_PREFERENCES, ...parsedData.preferences },
          generatedRecipes: parsedData.generatedRecipes || [],
        }
      } catch (e) {
        console.error('Error parsing user data from localStorage', e)
      }
    }
    return { savedRecipes: [], preferences: DEFAULT_PREFERENCES, generatedRecipes: [] }
  },

  saveUserData(userId: string, data: UserData) {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(getStorageKey(userId), JSON.stringify(data))
  },

  saveRecipe(userId: string, recipe: Omit<SavedRecipe, 'id' | 'likedAt'>) {
    const userData = this.getUserData(userId)
    const newRecipe: SavedRecipe = {
      ...recipe,
      id: uuidv4(),
      isFavorite: true,
      likedAt: new Date().toISOString(),
    }
    userData.savedRecipes.push(newRecipe)
    this.saveUserData(userId, userData)
  },

  removeRecipe(userId: string, recipeId: string) {
    const userData = this.getUserData(userId)
    userData.savedRecipes = userData.savedRecipes.filter(r => r.id !== recipeId)
    this.saveUserData(userId, userData)
  },

  isRecipeSaved(userId: string, recipeTitle: string): boolean {
    const userData = this.getUserData(userId)
    return userData.savedRecipes.some(r => r.title === recipeTitle)
  }
}

// Hybrid storage functions
export const getUserData = async (userId: string): Promise<UserData> => {
  // Try cloud storage first
  const cloudData = await cloudStorage.getUserData(userId)
  if (cloudData) {
    return cloudData
  }
  
  // Fallback to localStorage
  return localStorage.getUserData(userId)
}

export const saveRecipe = async (userId: string, recipe: Omit<SavedRecipe, 'id' | 'likedAt'>): Promise<boolean> => {
  // Try cloud storage first
  const cloudSuccess = await cloudStorage.saveRecipe(userId, recipe)
  if (cloudSuccess) {
    return true
  }
  
  // Fallback to localStorage
  localStorage.saveRecipe(userId, recipe)
  return true
}

export const removeRecipe = async (userId: string, recipeId: string): Promise<boolean> => {
  // Try cloud storage first
  const cloudSuccess = await cloudStorage.removeRecipe(userId, recipeId)
  if (cloudSuccess) {
    return true
  }
  
  // Fallback to localStorage
  localStorage.removeRecipe(userId, recipeId)
  return true
}

export const isRecipeSaved = async (userId: string, recipeTitle: string): Promise<boolean> => {
  // Try cloud storage first
  const cloudResult = await cloudStorage.isRecipeSaved(userId, recipeTitle)
  if (cloudResult !== false) {
    return cloudResult
  }
  
  // Fallback to localStorage
  return localStorage.isRecipeSaved(userId, recipeTitle)
}

export const updatePreferences = async (userId: string, newPreferences: Partial<UserPreferences>): Promise<boolean> => {
  // For now, just use localStorage
  const userData = localStorage.getUserData(userId)
  userData.preferences = { ...userData.preferences, ...newPreferences }
  localStorage.saveUserData(userId, userData)
  return true
}

export const addGeneratedRecipe = async (userId: string, recipe: Omit<SavedRecipe, 'id' | 'likedAt'>): Promise<boolean> => {
  return await saveRecipe(userId, recipe)
}
