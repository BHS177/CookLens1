'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Clock, Users, Zap } from 'lucide-react'
import { DetectedIngredient, Recipe } from '@/types'
import { generateRecipe } from '@/lib/api'
import { useApp } from '@/components/Providers'
import { useLanguage } from '@/contexts/LanguageContext'

interface RecipeGenerationProps {
  ingredients: DetectedIngredient[]
  onRecipeGenerated: (recipe: Recipe) => void
  onLoadingChange: (loading: boolean) => void
  chefMode?: 'expert' | 'country' | null
  selectedCountry?: string | null
}

export default function RecipeGeneration({
  ingredients,
  onRecipeGenerated,
  onLoadingChange,
  chefMode,
  selectedCountry
}: RecipeGenerationProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { preferences } = useApp()
  const { t } = useLanguage()

  useEffect(() => {
    const generateRecipeData = async () => {
      try {
        setLoading(true)
        onLoadingChange(true)
        setError(null)
        
        const recipe = await generateRecipe(ingredients, preferences)
        onRecipeGenerated(recipe)
      } catch (err) {
        console.error('Erreur lors de la génération:', err)
        setError('Erreur lors de la génération de la recette. Veuillez réessayer.')
      } finally {
        setLoading(false)
        onLoadingChange(false)
      }
    }

    generateRecipeData()
  }, [ingredients, preferences, onRecipeGenerated, onLoadingChange])

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card text-center"
      >
        <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-primary-600 animate-pulse" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {chefMode === 'expert' ? t('recipe.generating.expert') : 
           chefMode === 'country' ? t('recipe.generating.country').replace('{country}', selectedCountry || '') : 
           t('recipe.generating.simple')}
        </h3>
        <p className="text-gray-600 mb-4">
          {chefMode === 'expert' ? t('recipe.generating.subtitle.expert') :
           chefMode === 'country' ? t('recipe.generating.subtitle.country').replace('{country}', selectedCountry || '') :
           t('recipe.generating.subtitle.simple')}
        </p>
        
        <div className="space-y-3">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>Analyse des ingrédients...</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Users className="w-4 h-4" />
            <span>Adaptation aux préférences...</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Zap className="w-4 h-4" />
            <span>Génération de la recette...</span>
          </div>
        </div>
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card text-center"
      >
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t('common.error')}
        </h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn-primary"
        >
          {t('common.retry')}
        </button>
      </motion.div>
    )
  }

  return null
}
