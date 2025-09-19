'use client'

import { motion } from 'framer-motion'
import SimpleUserDashboard from '@/components/SimpleUserDashboard'

export default function SettingsPage() {

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Mon Tableau de Bord</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Gérez vos recettes sauvegardées, préférences et statistiques personnelles
          </p>
        </motion.div>

        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <SimpleUserDashboard />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
