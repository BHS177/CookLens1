'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { UserPreferences, SavedRecipe } from '@/types'

interface AppContextType {
  preferences: UserPreferences
  savedRecipes: SavedRecipe[]
  updatePreferences: (preferences: Partial<UserPreferences>) => void
  saveRecipe: (recipe: SavedRecipe) => void
  removeRecipe: (recipeId: string) => void
  toggleFavorite: (recipeId: string) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const defaultPreferences: UserPreferences = {
  cuisine: ['française', 'italienne', 'asiatique'],
  diet: [],
  allergies: [],
  maxPrepTime: 60,
  maxCookTime: 120,
  difficulty: ['moyen'],
  chefMode: 'country',
  selectedCountry: null,
  autoUpdateRecipe: false // Désactivé par défaut pour éviter les rechargements automatiques
}

export function Providers({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences)
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([])

  // Load data from localStorage on mount
  useEffect(() => {
    const savedPrefs = localStorage.getItem('fridge-ai-preferences')
    const savedRecipesData = localStorage.getItem('fridge-ai-recipes')
    
    if (savedPrefs) {
      setPreferences(JSON.parse(savedPrefs))
    }
    
    if (savedRecipesData) {
      setSavedRecipes(JSON.parse(savedRecipesData))
    }
  }, [])

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('fridge-ai-preferences', JSON.stringify(preferences))
  }, [preferences])

  // Save recipes to localStorage
  useEffect(() => {
    localStorage.setItem('fridge-ai-recipes', JSON.stringify(savedRecipes))
  }, [savedRecipes])

  const updatePreferences = (newPreferences: Partial<UserPreferences>) => {
    setPreferences(prev => ({ ...prev, ...newPreferences }))
  }

  const saveRecipe = (recipe: SavedRecipe) => {
    setSavedRecipes(prev => {
      const existingIndex = prev.findIndex(r => r.id === recipe.id)
      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex] = recipe
        return updated
      }
      return [...prev, recipe]
    })
  }

  const removeRecipe = (recipeId: string) => {
    setSavedRecipes(prev => prev.filter(r => r.id !== recipeId))
  }

  const toggleFavorite = (recipeId: string) => {
    setSavedRecipes(prev => 
      prev.map(recipe => 
        recipe.id === recipeId 
          ? { ...recipe, isFavorite: !recipe.isFavorite }
          : recipe
      )
    )
  }

  return (
    <AppContext.Provider value={{
      preferences,
      savedRecipes,
      updatePreferences,
      saveRecipe,
      removeRecipe,
      toggleFavorite
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within a Providers')
  }
  return context
}
