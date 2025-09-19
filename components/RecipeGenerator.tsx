'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ChefHat, 
  Clock, 
  Users, 
  Flame, 
  Star, 
  Heart, 
  ArrowLeft,
  RefreshCw,
  Timer,
  Utensils,
  MessageCircle,
  Phone,
  Crown,
  Lock
} from 'lucide-react'
import { Recipe, DetectedIngredient, UserPreferences } from '@/types'
import { generateRecipeSuggestions, generateDetailedRecipe } from '@/lib/api'
import { formatTime, formatDifficulty, formatCuisine, formatDiet } from '@/lib/utils'
import { useLanguage } from '@/contexts/LanguageContext'
import { useSubscription } from '@/contexts/SubscriptionContext'
import ChatGPTLive from './ChatGPTLive'
import SubscriptionPrompt from './SubscriptionPrompt'
import { useUser } from '@clerk/nextjs'
import { saveRecipe, isRecipeSaved } from '@/lib/hybrid-storage'

interface RecipeGeneratorProps {
  ingredients: DetectedIngredient[]
  preferences: UserPreferences
  onBack: () => void
  onLoadingChange: (loading: boolean) => void
}

export default function RecipeGenerator({ 
  ingredients, 
  preferences, 
  onBack, 
  onLoadingChange 
}: RecipeGeneratorProps) {
  const { t } = useLanguage()
  const { user } = useUser()
  const { isSubscribed } = useSubscription()
  // Cloud storage functions are imported directly
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingRecipe, setIsGeneratingRecipe] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [savedRecipes, setSavedRecipes] = useState<Set<string>>(new Set())
  const [savedRecipesState, setSavedRecipesState] = useState<Set<string>>(new Set())
  const [showSubscriptionPrompt, setShowSubscriptionPrompt] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Debug log for chat state
  console.log('RecipeGenerator state:', { isChatOpen, selectedRecipe: !!selectedRecipe })

  // Check if recipe is saved (synchronous for UI)
  const isRecipeSavedState = (recipeTitle: string) => {
    return savedRecipesState.has(recipeTitle)
  }

  // Load saved recipes on component mount
  useEffect(() => {
    const loadSavedRecipes = async () => {
      if (!user) return
      
      // Load all saved recipes and create a set of titles
      const savedTitles = new Set<string>()
      // For now, we'll use the local state
      // In a full implementation, you'd load from the cloud storage
      setSavedRecipesState(savedTitles)
    }
    
    loadSavedRecipes()
  }, [user])

  // Handle save/unsave recipe
  const handleOpenChat = () => {
    if (!isSubscribed) {
      setShowSubscriptionPrompt(true)
      return
    }
    setIsChatOpen(true)
  }

  const handleSaveRecipe = async (recipe: Recipe) => {
    if (!user || isSaving) return
    
    if (!isSubscribed) {
      setShowSubscriptionPrompt(true)
      return
    }

    setIsSaving(true)
    try {
      const recipeData = {
        title: recipe.title,
        description: recipe.description,
        ingredients: recipe.ingredients.map(ing => ing.name),
        instructions: recipe.instructions.map(step => step.instruction),
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        servings: recipe.servings,
        difficulty: (recipe.difficulty === 'facile' ? 'easy' : recipe.difficulty === 'moyen' ? 'medium' : 'hard') as 'easy' | 'medium' | 'hard',
        cuisine: recipe.cuisine,
        tags: recipe.tags || [],
        imageUrl: recipe.imageUrl,
        isFavorite: true, // When saving, it's a favorite
        createdAt: new Date().toISOString(),
        generatedBy: 'ai' as const
      }

      const isSaved = isRecipeSavedState(recipe.title)
      if (isSaved) {
        console.log('Recipe already saved')
        return
      }

      // Save recipe to cloud
      const success = await saveRecipe(user.id, recipeData)
      if (success) {
        setSavedRecipes(prev => new Set(prev).add(recipe.title))
        setSavedRecipesState(prev => new Set(prev).add(recipe.title))
        console.log('Recipe saved successfully to cloud!')
      } else {
        console.log('Failed to save recipe to cloud, using localStorage fallback')
        // Fallback to localStorage if cloud fails
        setSavedRecipes(prev => new Set(prev).add(recipe.title))
        setSavedRecipesState(prev => new Set(prev).add(recipe.title))
      }
    } catch (error) {
      console.error('Error saving recipe:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleGenerateSuggestions = async () => {
    try {
      setIsGenerating(true)
      onLoadingChange(true)
      setError(null)

      console.log('🚀 Generating suggestions with:', {
        ingredients: ingredients.map(i => i.name),
        preferences
      })

      const generatedSuggestions = await generateRecipeSuggestions(ingredients, preferences)
      setSuggestions(generatedSuggestions)
      
      console.log('✅ Generated suggestions:', generatedSuggestions.length)
    } catch (err) {
      console.error('❌ Error generating suggestions:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors de la génération des suggestions')
    } finally {
      setIsGenerating(false)
      onLoadingChange(false)
    }
  }

  const handleSuggestionClick = async (suggestion: any) => {
    try {
      setIsGeneratingRecipe(true)
      onLoadingChange(true)
      setError(null)

      console.log('🚀 Generating detailed recipe for:', suggestion.title)

      const detailedRecipe = await generateDetailedRecipe(ingredients, preferences, suggestion)
      setSelectedRecipe(detailedRecipe)
      
      console.log('✅ Generated detailed recipe:', detailedRecipe.title)
    } catch (err) {
      console.error('❌ Error generating detailed recipe:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors de la génération de la recette détaillée')
    } finally {
      setIsGeneratingRecipe(false)
      onLoadingChange(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'facile': return 'text-green-600 bg-green-100'
      case 'moyen': return 'text-yellow-600 bg-yellow-100'
      case 'difficile': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'facile': return 'Facile'
      case 'moyen': return 'Moyen'
      case 'difficile': return 'Difficile'
      default: return difficulty
    }
  }

  if (selectedRecipe) {
    return (
      <>
        {showSubscriptionPrompt && (
          <SubscriptionPrompt onClose={() => setShowSubscriptionPrompt(false)} />
        )}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Recipe Header */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-8 mb-4 sm:mb-6">
          <div className="flex items-start justify-between mb-4 sm:mb-6">
            <button
              onClick={() => setSelectedRecipe(null)}
              className="flex items-center space-x-1 sm:space-x-2 text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Retour aux recettes</span>
              <span className="sm:hidden">Retour</span>
            </button>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button 
                onClick={() => selectedRecipe && handleSaveRecipe(selectedRecipe)}
                className={`p-1 sm:p-2 transition-colors ${
                  selectedRecipe && isRecipeSavedState(selectedRecipe.title)
                    ? 'text-red-600 hover:text-red-700'
                    : 'text-gray-600 hover:text-red-600'
                }`}
                title={selectedRecipe && isRecipeSavedState(selectedRecipe.title) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              >
                <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${selectedRecipe && isRecipeSavedState(selectedRecipe.title) ? 'fill-current' : ''}`} />
                <Crown className="w-3 h-3 text-yellow-500" />
              </button>
              {selectedRecipe && (
                <button 
                  onClick={() => {
                    console.log('Chat button clicked, opening chat...')
                    handleOpenChat()
                  }}
                  className="p-1 sm:p-2 text-gray-600 hover:text-purple-600 transition-colors bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 flex items-center space-x-1"
                  title="Chat en direct avec ChatGPT (Pro)"
                >
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  <Crown className="w-3 h-3 text-yellow-400" />
                </button>
              )}
            </div>
          </div>

          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">{selectedRecipe.title}</h1>
            <p className="text-sm sm:text-lg text-gray-600 mb-4 sm:mb-6 px-4">{selectedRecipe.description}</p>
            
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4 text-xs sm:text-sm">
              <div className="flex items-center space-x-1 text-gray-600">
                <ChefHat className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{formatCuisine(selectedRecipe.cuisine)}</span>
              </div>
              <div className="flex items-center space-x-1 text-gray-600">
                <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{selectedRecipe.servings} personnes</span>
              </div>
              <div className="flex items-center space-x-1 text-gray-600">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{formatTime(selectedRecipe.prepTime + selectedRecipe.cookTime)}</span>
              </div>
              <div className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getDifficultyColor(selectedRecipe.difficulty)}`}>
                {getDifficultyText(selectedRecipe.difficulty)}
              </div>
            </div>
          </div>

          {/* Recipe Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Ingredients */}
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                <Utensils className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Ingrédients
              </h3>
              <div className="space-y-2 sm:space-y-3">
                {selectedRecipe.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-900 text-sm sm:text-base">{ingredient.name}</span>
                    <span className="text-gray-600 text-xs sm:text-sm">
                      {ingredient.amount} {ingredient.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                <ChefHat className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Instructions
              </h3>
              <div className="space-y-3 sm:space-y-4">
                {selectedRecipe.instructions.map((step) => (
                  <div key={step.step} className="flex space-x-2 sm:space-x-4">
                    <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold">
                      {step.step}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm text-gray-900 mb-2">{step.instruction}</p>
                      {(step.duration || step.temperature) && (
                        <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm text-gray-500 mb-2">
                          {step.duration && (
                            <div className="flex items-center space-x-1">
                              <Timer className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>{formatTime(step.duration)}</span>
                            </div>
                          )}
                          {step.temperature && (
                            <div className="flex items-center space-x-1">
                              <Flame className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>{step.temperature}°C</span>
                            </div>
                          )}
                        </div>
                      )}
                      {step.tips && (
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-2 sm:p-3 rounded-r-lg">
                          <div className="flex items-start space-x-2">
                            <ChefHat className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs sm:text-sm font-medium text-blue-900 mb-1">💡 Conseil du chef</p>
                              <p className="text-xs sm:text-sm text-blue-800">{step.tips}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Nutrition */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Valeurs nutritionnelles (par portion)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Calories', value: selectedRecipe.nutrition.calories, unit: 'kcal' },
                { label: 'Protéines', value: selectedRecipe.nutrition.protein, unit: 'g' },
                { label: 'Glucides', value: selectedRecipe.nutrition.carbs, unit: 'g' },
                { label: 'Lipides', value: selectedRecipe.nutrition.fat, unit: 'g' },
                { label: 'Fibres', value: selectedRecipe.nutrition.fiber, unit: 'g' },
                { label: 'Sucre', value: selectedRecipe.nutrition.sugar, unit: 'g' },
                { label: 'Sodium', value: selectedRecipe.nutrition.sodium, unit: 'mg' },
                ...(selectedRecipe.nutrition.saturatedFat ? [{ label: 'Lipides saturés', value: selectedRecipe.nutrition.saturatedFat, unit: 'g' }] : []),
                ...(selectedRecipe.nutrition.cholesterol ? [{ label: 'Cholestérol', value: selectedRecipe.nutrition.cholesterol, unit: 'mg' }] : []),
              ].map((nutrient) => (
                <div key={nutrient.label} className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl font-bold text-primary-600 mb-1">
                    {nutrient.value}
                  </div>
                  <div className="text-sm text-gray-500">
                    {nutrient.unit}
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {nutrient.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ChatGPT Button for Recipe Detail */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="text-center">
              <button
                onClick={() => {
                  console.log('Recipe detail chat button clicked, opening chat...')
                  handleOpenChat()
                }}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl hover:from-green-600 hover:to-blue-600 transition-all duration-300 flex items-center space-x-3 mx-auto shadow-lg hover:shadow-xl"
              >
                <MessageCircle className="w-6 h-6" />
                <span className="text-lg font-semibold">💬 Chat avec ChatGPT sur cette recette</span>
                <Crown className="w-5 h-5 text-yellow-400" />
              </button>
              <p className="text-sm text-gray-500 mt-3">
                Posez des questions sur les ingrédients, techniques ou modifications
              </p>
            </div>
          </div>

          {/* ChatGPT Live Chat for Recipe Detail */}
          <ChatGPTLive 
            recipe={selectedRecipe} 
            isOpen={isChatOpen} 
            onClose={() => setIsChatOpen(false)} 
          />
        </div>
      </motion.div>
      </>
    )
  }

  return (
    <>
      {showSubscriptionPrompt && (
        <SubscriptionPrompt onClose={() => setShowSubscriptionPrompt(false)} />
      )}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          {t('recipe.title')}
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          {t('recipe.subtitle')}
        </p>
        
        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500 mb-8">
          <div className="flex items-center space-x-1">
            <ChefHat className="w-4 h-4" />
            <span>{t('recipe.mode')}: {preferences.chefMode === 'expert' ? t('recipe.mode.expert') : preferences.chefMode === 'country' ? `${t('recipe.mode.country')}: ${preferences.selectedCountry}` : t('recipe.mode.simple')}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{t('recipe.time')}: {preferences.maxPrepTime + preferences.maxCookTime} min</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{t('recipe.diet')}: {preferences.diet.join(', ')}</span>
          </div>
        </div>

        <button
          onClick={handleGenerateSuggestions}
          disabled={isGenerating}
          className="bg-primary-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 mx-auto"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>{t('recipe.generating')}</span>
            </>
          ) : (
            <>
              <ChefHat className="w-5 h-5" />
              <span>{t('recipe.generate.button')}</span>
            </>
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Suggestions Grid */}
      {suggestions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {suggestions.map((suggestion, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <h3 className="text-sm sm:text-xl font-semibold text-gray-900 line-clamp-2 flex-1">
                    {suggestion.title}
                  </h3>
                  <div className="flex items-center space-x-1 text-yellow-500 ml-2">
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
                    <span className="text-xs sm:text-sm font-medium">{suggestion.rating || 4.0}</span>
                  </div>
                </div>
                
                <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2">
                  {suggestion.cuisine} - {suggestion.type}
                </p>
                
                <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(suggestion.difficulty)}`}>
                    {getDifficultyText(suggestion.difficulty)}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {suggestion.cuisine}
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    {suggestion.type}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
                  <div className="flex items-center space-x-2 sm:space-x-4">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{formatTime(suggestion.total_time_min)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{suggestion.servings}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {user && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          const recipeData = {
                            title: suggestion.title,
                            description: `${suggestion.cuisine} - ${suggestion.type}`,
                            ingredients: suggestion.ingredients || [],
                            instructions: [],
                            prepTime: suggestion.prep_time_min || 0,
                            cookTime: suggestion.cook_time_min || 0,
                            servings: suggestion.servings || 1,
                            difficulty: suggestion.difficulty as 'easy' | 'medium' | 'hard',
                            cuisine: suggestion.cuisine,
                            tags: [suggestion.type],
                            generatedBy: 'ai' as const
                          }
                          handleSaveRecipe(recipeData as any)
                        }}
                        className={`p-1 transition-colors ${
                          isRecipeSavedState(suggestion.title)
                            ? 'text-red-600 hover:text-red-700'
                            : 'text-gray-400 hover:text-red-600'
                        }`}
                        title={isRecipeSavedState(suggestion.title) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                      >
                        <Heart className={`w-3 h-3 sm:w-4 sm:h-4 ${isRecipeSavedState(suggestion.title) ? 'fill-current' : ''}`} />
                        <Crown className="w-2 h-2 text-yellow-500" />
                      </button>
                    )}
                    <span className="text-primary-600 font-medium">Voir la recette</span>
                  </div>
                </div>
                
                {suggestion.manquants_optionnels && suggestion.manquants_optionnels.length > 0 && (
                  <div className="mt-3 p-2 bg-yellow-50 rounded-lg">
                    <p className="text-xs text-yellow-800">
                      <strong>Ingrédients optionnels manquants:</strong> {suggestion.manquants_optionnels.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Back Button */}
      <div className="text-center mt-8">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mx-auto"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t('nav.backToPreferences')}</span>
        </button>
        
        {/* Chat Button */}
        <div className="mt-4">
          <button
            onClick={() => {
              console.log('Chat button clicked')
              handleOpenChat()
            }}
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl hover:from-green-600 hover:to-blue-600 transition-all duration-300 flex items-center space-x-3 mx-auto shadow-lg hover:shadow-xl"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="text-lg font-semibold">💬 Chat avec ChatGPT</span>
            <Crown className="w-5 h-5 text-yellow-400" />
          </button>
        </div>
      </div>

      {/* ChatGPT Live Chat */}
      <ChatGPTLive 
        recipe={selectedRecipe || { title: "Test Recipe", cuisine: "Test" }} 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />

      {/* Floating Chat Button for Mobile */}
      {selectedRecipe && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            console.log('Mobile chat button clicked, opening chat...')
            handleOpenChat()
          }}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-green-500 to-blue-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 md:hidden"
          title="Chat avec ChatGPT"
        >
          <MessageCircle className="w-6 h-6" />
        </motion.button>
      )}
    </motion.div>
    </>
  )
}
