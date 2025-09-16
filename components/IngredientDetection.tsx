'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, AlertCircle, Loader2, Info } from 'lucide-react'
import { DetectedIngredient } from '@/types'
import { detectIngredients } from '@/lib/api'
import { useLanguage } from '@/contexts/LanguageContext'

interface IngredientDetectionProps {
  imageUrl: string
  onIngredientsDetected: (ingredients: DetectedIngredient[]) => void
  onLoadingChange: (loading: boolean) => void
}

export default function IngredientDetection({
  imageUrl,
  onIngredientsDetected,
  onLoadingChange
}: IngredientDetectionProps) {
  const [ingredients, setIngredients] = useState<DetectedIngredient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDemoData, setIsDemoData] = useState(false)
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [isApiUnavailable, setIsApiUnavailable] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    const analyzeImage = async () => {
      try {
        setLoading(true)
        onLoadingChange(true)
        setError(null)
        
        const detectedIngredients = await detectIngredients(imageUrl)
        setIngredients(detectedIngredients)
        onIngredientsDetected(detectedIngredients)
        
        // Check if we're using demo data (ingredients with 'demo-' prefix)
        const usingDemoData = detectedIngredients.some(ing => ing.id.startsWith('demo-'))
        setIsDemoData(usingDemoData)
        
        // Check if we're using smart demo ingredients (rate limited)
        const usingSmartDemo = detectedIngredients.some(ing => ing.id.startsWith('demo-') && ing.name !== 'Ingrédients non détectés')
        setIsRateLimited(usingSmartDemo)
      } catch (err) {
        console.error('Erreur lors de la détection:', err)
        const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la détection des ingrédients'
        setError(errorMessage)
        
        // Check if it's an API issue
        if (errorMessage.includes('rate limit') || errorMessage.includes('API')) {
          setIsApiUnavailable(true)
        }
      } finally {
        setLoading(false)
        onLoadingChange(false)
      }
    }

    analyzeImage()
  }, [imageUrl, onIngredientsDetected, onLoadingChange])

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card text-center"
      >
        <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Analyse de votre image...
        </h3>
        <p className="text-gray-600">
          L&apos;IA ChatGPT analyse votre frigo pour détecter les ingrédients
        </p>
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
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {isApiUnavailable ? 'API ChatGPT Indisponible' : 'Erreur d\'analyse'}
        </h3>
        <p className="text-gray-600 mb-4">{error}</p>
        
        {isApiUnavailable && (
          <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-xl">
            <div className="flex items-center justify-center space-x-2 text-orange-700 mb-2">
              <Info className="w-4 h-4" />
              <span className="text-sm font-medium">Information importante</span>
            </div>
            <p className="text-sm text-orange-600">
              L&apos;API ChatGPT a atteint sa limite de requêtes. Veuillez réessayer plus tard.
            </p>
          </div>
        )}
        
        <button
          onClick={() => window.location.reload()}
          className="btn-primary"
        >
          Réessayer
        </button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card"
    >
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('ingredients.detected')}
        </h2>
        <p className="text-gray-600">
          {t('ingredients.detected.subtitle', { 
            count: ingredients.length, 
            plural: ingredients.length > 1 ? 's' : '' 
          })}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          {t('ingredients.confidence')}
        </p>
        
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {ingredients.map((ingredient, index) => (
          <motion.div
            key={ingredient.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-gray-50 rounded-xl p-4 text-center"
          >
            <div className="text-sm font-medium text-gray-900 mb-1">
              {ingredient.name}
            </div>
            <div className="text-xs text-gray-500 capitalize">
              {ingredient.category}
            </div>
            <div className="text-xs text-primary-600 font-medium mt-1">
              {Math.round(ingredient.confidence * 100)}% de confiance
            </div>
          </motion.div>
        ))}
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-600 mb-4">
          Prêt à générer une recette avec ces ingrédients ?
        </p>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 1, delay: 0.5 }}
            className="h-full bg-gradient-to-r from-primary-500 to-primary-600"
          />
        </div>
      </div>
    </motion.div>
  )
}
