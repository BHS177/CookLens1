'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Globe, X } from 'lucide-react'
import { countries, Country } from '@/data/countries'

interface CountrySelectorProps {
  selectedCountry: Country | null
  onCountrySelect: (country: Country | null) => void
}

export default function CountrySelector({ selectedCountry, onCountrySelect }: CountrySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.cuisine.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCountrySelect = (country: Country) => {
    onCountrySelect(country)
    setIsOpen(false)
    setSearchTerm('')
  }

  const clearSelection = () => {
    onCountrySelect(null)
  }

  return (
    <div className="relative">
      <div className="card">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Globe className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Choisissez une cuisine du monde
          </h2>
          <p className="text-gray-600">
            Sélectionnez un pays pour découvrir sa cuisine traditionnelle
          </p>
        </div>

        {selectedCountry ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-3xl">{selectedCountry.flag}</span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedCountry.name}
                  </h3>
                  <p className="text-orange-600 font-medium">
                    Cuisine {selectedCountry.cuisine}
                  </p>
                </div>
              </div>
              <button
                onClick={clearSelection}
                className="w-8 h-8 bg-orange-100 hover:bg-orange-200 text-orange-600 rounded-full flex items-center justify-center transition-colors duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ) : (
          <button
            onClick={() => setIsOpen(true)}
            className="w-full btn-primary text-lg py-4"
          >
            <Globe className="w-5 h-5 mr-2" />
            Sélectionner une cuisine
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    Choisissez une cuisine
                  </h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full flex items-center justify-center transition-colors duration-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Rechercher un pays ou une cuisine..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-4">
                  {filteredCountries.map((country) => (
                    <motion.button
                      key={country.code}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleCountrySelect(country)}
                      className="flex items-center space-x-3 p-3 rounded-xl hover:bg-orange-50 transition-colors duration-200 text-left"
                    >
                      <span className="text-2xl">{country.flag}</span>
                      <div>
                        <div className="font-medium text-gray-900">
                          {country.name}
                        </div>
                        <div className="text-sm text-orange-600">
                          {country.cuisine}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

