'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChefHat, Sparkles, Globe, Heart } from 'lucide-react'

interface ChefModeSelectorProps {
  mode: 'expert' | 'country' | null
  onModeSelect: (mode: 'expert' | 'country' | null) => void
}

export default function ChefModeSelector({ mode, onModeSelect }: ChefModeSelectorProps) {
  return (
    <div className="card">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ChefHat className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Mode Chef Expert
        </h2>
        <p className="text-gray-600">
          Choisissez comment vous voulez que le chef IA crée votre recette
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onModeSelect('expert')}
          className={`p-6 rounded-xl border-2 transition-all duration-200 ${
            mode === 'expert'
              ? 'border-purple-500 bg-purple-50'
              : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
          }`}
        >
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Création Libre
            </h3>
            <p className="text-sm text-gray-600">
              Le chef IA utilise son expertise pour créer la meilleure recette possible avec vos ingrédients
            </p>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onModeSelect('country')}
          className={`p-6 rounded-xl border-2 transition-all duration-200 ${
            mode === 'country'
              ? 'border-orange-500 bg-orange-50'
              : 'border-gray-200 hover:border-orange-300 hover:bg-orange-25'
          }`}
        >
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Globe className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Cuisine du Monde
            </h3>
            <p className="text-sm text-gray-600">
              Choisissez un pays et découvrez sa cuisine traditionnelle adaptée à vos ingrédients
            </p>
          </div>
        </motion.button>
      </div>

      {mode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200"
        >
          <div className="flex items-center space-x-2 text-green-700">
            <Heart className="w-5 h-5" />
            <span className="font-medium">
              Focus sur la santé et l'équilibre nutritionnel
            </span>
          </div>
          <p className="text-sm text-green-600 mt-1">
            Toutes les recettes sont optimisées pour être saines, équilibrées et délicieuses
          </p>
        </motion.div>
      )}
    </div>
  )
}

