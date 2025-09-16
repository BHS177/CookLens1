'use client'

import { motion } from 'framer-motion'

export default function SettingsPage() {

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Paramètres</h1>
          <p className="text-gray-600">
            Personnalisez vos préférences pour des recettes adaptées à vos goûts
          </p>
        </motion.div>


        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="card text-center py-12"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Paramètres
            </h2>
            <p className="text-gray-600 mb-6">
              Toutes les préférences sont gérées dans la page d&apos;accueil
            </p>
            <p className="text-sm text-gray-500">
              Retournez à l&apos;accueil pour configurer vos préférences de cuisine, régime alimentaire, et autres options.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
