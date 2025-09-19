'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Crown, Camera, Sparkles, Check, X } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface SubscriptionPromptProps {
  onClose: () => void
}

export default function SubscriptionPrompt({ onClose }: SubscriptionPromptProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { t } = useLanguage()

  const handleSubscribe = async () => {
    setIsLoading(true)
    try {
      console.log('Creating checkout session...')
      const response = await fetch('/api/subscription/create-checkout', {
        method: 'POST',
      })
      
      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)
      
      if (data.url) {
        console.log('Redirecting to:', data.url)
        window.location.href = data.url
      } else {
        console.error('No checkout URL received:', data)
        const errorMsg = data.details || data.error || 'Erreur inconnue'
        alert(`Erreur: Impossible de créer la session de paiement.\n\nDétails: ${errorMsg}`)
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      alert(`Erreur: Impossible de se connecter au serveur de paiement.\n\nDétails: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const features = [
    {
      icon: Camera,
      title: 'Photos illimitées',
      description: 'Prenez autant de photos que vous voulez de votre frigo'
    },
    {
      icon: Sparkles,
      title: 'IA avancée',
      description: 'Détection d\'ingrédients et génération de recettes illimitées'
    },
    {
      icon: Crown,
      title: 'Support prioritaire',
      description: 'Aide et support en priorité pour tous vos besoins culinaires'
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Passez à CookLens Pro
          </h2>
          <p className="text-gray-600">
            Débloquez toutes les fonctionnalités pour seulement 3€/mois
          </p>
        </div>

        <div className="space-y-4 mb-6">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <feature.icon className="w-4 h-4 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">3€</div>
            <div className="text-sm text-gray-600">par mois</div>
            <div className="text-xs text-gray-500 mt-1">
              Annulation possible à tout moment
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleSubscribe}
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Redirection...' : 'Commencer maintenant'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 sm:flex-none bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors duration-200"
          >
            Plus tard
          </button>
        </div>

        <div className="text-center mt-4">
          <p className="text-xs text-gray-500">
            Paiement sécurisé par Stripe • Annulation à tout moment
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}
