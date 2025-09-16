'use client'

import React from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { Globe } from 'lucide-react'

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="flex items-center space-x-2">
      <Globe className="w-4 h-4 text-gray-600" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as 'fr' | 'en')}
        className="text-sm font-medium text-gray-700 bg-transparent border-none outline-none cursor-pointer hover:text-primary-600 transition-colors duration-200"
      >
        <option value="fr">🇫🇷 FR</option>
        <option value="en">🇺🇸 EN</option>
      </select>
    </div>
  )
}

