'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, Upload, Sparkles, Clock, Users, Zap } from 'lucide-react'
import ImageUpload from '@/components/ImageUpload'
import IngredientDetection from '@/components/IngredientDetection'
import CuisinePreferenceSelector from '@/components/CuisinePreferenceSelector'
import RecipeGenerator from '@/components/RecipeGenerator'
import { Recipe, DetectedIngredient, UserPreferences } from '@/types'
import { useApp } from '@/components/Providers'
import { useLanguage } from '@/contexts/LanguageContext'

export default function HomePage() {
  const { preferences } = useApp()
  const { t } = useLanguage()
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [detectedIngredients, setDetectedIngredients] = useState<DetectedIngredient[]>([])
  const [recipePreferences, setRecipePreferences] = useState<UserPreferences | null>(null)
  const [isDetecting, setIsDetecting] = useState(false)
  const [currentStep, setCurrentStep] = useState<'upload' | 'detect' | 'preferences' | 'recipes'>('upload')

  const handleImageUpload = (imageUrl: string) => {
    setUploadedImage(imageUrl)
    setDetectedIngredients([])
    setRecipePreferences(null)
    setCurrentStep('detect')
  }

  const handleIngredientsDetected = (ingredients: DetectedIngredient[]) => {
    setDetectedIngredients(ingredients)
    setCurrentStep('preferences')
  }

  const handlePreferencesSet = (preferences: UserPreferences) => {
    setRecipePreferences(preferences)
    setCurrentStep('recipes')
  }


  const handleBackToPreferences = () => {
    setCurrentStep('preferences')
  }

  const handleBackToDetection = () => {
    setCurrentStep('detect')
  }

  const resetFlow = () => {
    setUploadedImage(null)
    setDetectedIngredients([])
    setRecipePreferences(null)
    setCurrentStep('upload')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            {t('home.title').split(' ').slice(0, 2).join(' ')}
            <span className="text-primary-600 block">{t('home.title').split(' ').slice(2).join(' ')}</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            {t('home.subtitle')}
          </p>
        </motion.div>

        {/* Features Grid - Hidden on mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="hidden md:grid md:grid-cols-3 gap-6 mb-12"
        >
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Camera className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Photo intelligente</h3>
            <p className="text-gray-600">Détection automatique des ingrédients dans votre frigo</p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Recettes IA</h3>
            <p className="text-gray-600">Génération de recettes personnalisées avec ChefGPT</p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Filtres avancés</h3>
            <p className="text-gray-600">Cuisine, régime alimentaire et préférences</p>
          </div>
        </motion.div>

        {/* Main Flow */}
        <div className="max-w-4xl mx-auto">
          {currentStep === 'upload' && (
            <ImageUpload onImageUpload={handleImageUpload} />
          )}
          
          {currentStep === 'detect' && uploadedImage && (
            <IngredientDetection
              imageUrl={uploadedImage}
              onIngredientsDetected={handleIngredientsDetected}
              onLoadingChange={setIsDetecting}
            />
          )}
          
          {currentStep === 'preferences' && detectedIngredients.length > 0 && (
            <CuisinePreferenceSelector
              ingredients={detectedIngredients}
              onPreferencesSet={handlePreferencesSet}
              onBack={handleBackToDetection}
            />
          )}
          
          {currentStep === 'recipes' && detectedIngredients.length > 0 && recipePreferences && (
            <RecipeGenerator
              ingredients={detectedIngredients}
              preferences={recipePreferences}
              onBack={handleBackToPreferences}
              onLoadingChange={setIsDetecting}
            />
          )}
          
        </div>

        {/* Loading States */}
        {isDetecting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <div className="bg-white rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary-600 animate-spin" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('ingredients.analyzing')}
              </h3>
              <p className="text-gray-600">
                {t('ingredients.analyzing.subtitle')}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
