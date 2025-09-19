'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { SavedRecipe, UserPreferences } from '@/types'

interface UserData {
  savedRecipes: SavedRecipe[]
  preferences: UserPreferences
  generatedRecipes: SavedRecipe[]
}

export const useCloudStorage = () => {
  const { user, isLoaded } = useUser()
  const [userData, setUserData] = useState<UserData>({
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
    generatedRecipes: []
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load user data from cloud
  const loadUserData = useCallback(async () => {
    if (!user || !isLoaded) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/user-data?userId=${user.id}`)
      if (!response.ok) {
        throw new Error('Failed to load user data')
      }
      const data = await response.json()
      setUserData(data)
    } catch (err) {
      console.error('Error loading user data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load user data')
    } finally {
      setLoading(false)
    }
  }, [user, isLoaded])

  // Save recipe to cloud
  const saveRecipe = useCallback(async (recipe: Omit<SavedRecipe, 'id' | 'likedAt'>) => {
    if (!user) return false

    try {
      const response = await fetch('/api/user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'saveRecipe',
          userId: user.id,
          recipe
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save recipe')
      }

      const result = await response.json()
      if (result.success) {
        // Reload user data to get the updated list
        await loadUserData()
        return true
      }
      return false
    } catch (err) {
      console.error('Error saving recipe:', err)
      setError(err instanceof Error ? err.message : 'Failed to save recipe')
      return false
    }
  }, [user, loadUserData])

  // Remove recipe from cloud
  const removeRecipe = useCallback(async (recipeId: string) => {
    if (!user) return false

    try {
      const response = await fetch('/api/user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'removeRecipe',
          userId: user.id,
          recipeId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to remove recipe')
      }

      const result = await response.json()
      if (result.success) {
        // Update local state immediately
        setUserData(prev => ({
          ...prev,
          savedRecipes: prev.savedRecipes.filter(r => r.id !== recipeId)
        }))
        return true
      }
      return false
    } catch (err) {
      console.error('Error removing recipe:', err)
      setError(err instanceof Error ? err.message : 'Failed to remove recipe')
      return false
    }
  }, [user])

  // Check if recipe is saved
  const isRecipeSaved = useCallback(async (recipeTitle: string): Promise<boolean> => {
    if (!user) return false

    try {
      const response = await fetch('/api/user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'isRecipeSaved',
          userId: user.id,
          recipeTitle
        })
      })

      if (!response.ok) {
        throw new Error('Failed to check recipe status')
      }

      const result = await response.json()
      return result.isSaved
    } catch (err) {
      console.error('Error checking recipe status:', err)
      return false
    }
  }, [user])

  // Toggle favorite status
  const toggleFavorite = useCallback(async (recipeId: string) => {
    if (!user) return false

    try {
      const response = await fetch('/api/user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggleFavorite',
          userId: user.id,
          recipeId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to toggle favorite')
      }

      const result = await response.json()
      if (result.success) {
        // Update local state
        setUserData(prev => ({
          ...prev,
          savedRecipes: prev.savedRecipes.map(r => 
            r.id === recipeId ? { ...r, isFavorite: !r.isFavorite } : r
          )
        }))
        return true
      }
      return false
    } catch (err) {
      console.error('Error toggling favorite:', err)
      setError(err instanceof Error ? err.message : 'Failed to toggle favorite')
      return false
    }
  }, [user])

  // Update preferences
  const updatePreferences = useCallback(async (newPreferences: Partial<UserPreferences>) => {
    if (!user) return false

    try {
      const response = await fetch('/api/user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updatePreferences',
          userId: user.id,
          preferences: newPreferences
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update preferences')
      }

      const result = await response.json()
      if (result.success) {
        // Update local state
        setUserData(prev => ({
          ...prev,
          preferences: { ...prev.preferences, ...newPreferences }
        }))
        return true
      }
      return false
    } catch (err) {
      console.error('Error updating preferences:', err)
      setError(err instanceof Error ? err.message : 'Failed to update preferences')
      return false
    }
  }, [user])

  // Load data when user is loaded
  useEffect(() => {
    if (isLoaded && user) {
      loadUserData()
    }
  }, [isLoaded, user, loadUserData])

  return {
    userData,
    loading,
    error,
    loadUserData,
    saveRecipe,
    removeRecipe,
    isRecipeSaved,
    toggleFavorite,
    updatePreferences
  }
}
