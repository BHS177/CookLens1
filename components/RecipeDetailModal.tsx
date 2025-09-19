'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Clock, 
  Users, 
  ChefHat, 
  Star, 
  Heart, 
  Trash2,
  ArrowLeft,
  ArrowRight,
  Utensils,
  Flame,
  Timer,
  BookOpen
} from 'lucide-react'
import { SavedRecipe } from '@/types'
import { useUser } from '@clerk/nextjs'
import { removeRecipe } from '@/lib/user-storage'

interface RecipeDetailModalProps {
  recipe: SavedRecipe | null
  isOpen: boolean
  onClose: () => void
  onRecipeDeleted: (recipeId: string) => void
}

export default function RecipeDetailModal({ 
  recipe, 
  isOpen, 
  onClose, 
  onRecipeDeleted 
}: RecipeDetailModalProps) {
  const { user } = useUser()
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!recipe) return null

  const handleDelete = () => {
    if (user && confirm('Êtes-vous sûr de vouloir supprimer cette recette ?')) {
      removeRecipe(user.id, recipe.id)
      onRecipeDeleted(recipe.id)
      onClose()
    }
  }

  const nextStep = () => {
    if (currentStep < recipe.instructions.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{recipe.title}</h2>
                  <p className="text-gray-600 mb-4">{recipe.description}</p>
                  
                  {/* Recipe Meta */}
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center space-x-1 bg-primary-50 px-3 py-1 rounded-lg">
                      <Clock className="w-4 h-4 text-primary-600" />
                      <span className="text-sm font-medium text-primary-700">
                        {recipe.prepTime + recipe.cookTime} min
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 bg-primary-50 px-3 py-1 rounded-lg">
                      <Users className="w-4 h-4 text-primary-600" />
                      <span className="text-sm font-medium text-primary-700">
                        {recipe.servings} personnes
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 bg-primary-50 px-3 py-1 rounded-lg">
                      <ChefHat className="w-4 h-4 text-primary-600" />
                      <span className="text-sm font-medium text-primary-700">
                        {recipe.difficulty === 'easy' ? 'Facile' : recipe.difficulty === 'medium' ? 'Moyen' : 'Difficile'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 bg-gray-100 px-3 py-1 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">
                        {recipe.cuisine}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={handleDelete}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer la recette"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="p-6">
                {/* Ingredients */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Utensils className="w-5 h-5 mr-2 text-primary-600" />
                    Ingrédients
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {recipe.ingredients.map((ingredient, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                        <span className="text-gray-700">{ingredient}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instructions */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-primary-600" />
                    Instructions
                  </h3>
                  
                  {recipe.instructions.length > 0 ? (
                    <div className="space-y-4">
                      {/* Step Navigation */}
                      <div className="flex items-center justify-between mb-6">
                        <button
                          onClick={prevStep}
                          disabled={currentStep === 0}
                          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>Précédent</span>
                        </button>
                        
                        <span className="text-sm font-medium text-gray-600">
                          Étape {currentStep + 1} sur {recipe.instructions.length}
                        </span>
                        
                        <button
                          onClick={nextStep}
                          disabled={currentStep === recipe.instructions.length - 1}
                          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <span>Suivant</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Current Step */}
                      <div className="bg-primary-50 rounded-xl p-6">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold">
                            {currentStep + 1}
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-800 text-lg leading-relaxed">
                              {recipe.instructions[currentStep]}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* All Steps Overview */}
                      <div className="mt-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Toutes les étapes :</h4>
                        <div className="space-y-2">
                          {recipe.instructions.map((instruction, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentStep(index)}
                              className={`w-full text-left p-3 rounded-lg transition-colors ${
                                index === currentStep
                                  ? 'bg-primary-100 border-2 border-primary-300'
                                  : 'bg-gray-50 hover:bg-gray-100'
                              }`}
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                                  index === currentStep
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-300 text-gray-600'
                                }`}>
                                  {index + 1}
                                </div>
                                <p className={`text-sm ${
                                  index === currentStep ? 'text-primary-800' : 'text-gray-600'
                                }`}>
                                  {instruction}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Aucune instruction détaillée disponible pour cette recette.</p>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {recipe.tags && recipe.tags.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {recipe.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recipe Info */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Timer className="w-6 h-6 text-primary-600" />
                      </div>
                      <p className="text-sm font-medium text-gray-700">Préparation</p>
                      <p className="text-lg font-semibold text-gray-900">{recipe.prepTime} min</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Flame className="w-6 h-6 text-primary-600" />
                      </div>
                      <p className="text-sm font-medium text-gray-700">Cuisson</p>
                      <p className="text-lg font-semibold text-gray-900">{recipe.cookTime} min</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Users className="w-6 h-6 text-primary-600" />
                      </div>
                      <p className="text-sm font-medium text-gray-700">Portions</p>
                      <p className="text-lg font-semibold text-gray-900">{recipe.servings}</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <ChefHat className="w-6 h-6 text-primary-600" />
                      </div>
                      <p className="text-sm font-medium text-gray-700">Difficulté</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {recipe.difficulty === 'easy' ? 'Facile' : recipe.difficulty === 'medium' ? 'Moyen' : 'Difficile'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
