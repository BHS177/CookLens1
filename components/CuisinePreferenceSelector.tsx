'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChefHat, Globe, Clock, ArrowRight, ArrowLeft, Plus, Edit2, Trash2, Check, X, AlertCircle, Crown, Lock } from 'lucide-react'
import { DetectedIngredient, UserPreferences } from '@/types'
import { useLanguage } from '@/contexts/LanguageContext'
import { useSubscription } from '@/contexts/SubscriptionContext'
import { SignInButton } from '@clerk/nextjs'
import SubscriptionPrompt from './SubscriptionPrompt'

interface CuisinePreferenceSelectorProps {
  ingredients: DetectedIngredient[]
  onPreferencesSet: (preferences: UserPreferences) => void
  onBack: () => void
}

export default function CuisinePreferenceSelector({
  ingredients,
  onPreferencesSet,
  onBack
}: CuisinePreferenceSelectorProps) {
  const { t } = useLanguage()
  const { isSubscribed } = useSubscription()
  const [chefMode, setChefMode] = useState<'expert' | 'country' | 'simple'>('expert')
  const [showSubscriptionPrompt, setShowSubscriptionPrompt] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState<string>('')
  const [countrySearch, setCountrySearch] = useState<string>('')
  const [maxPrepTime, setMaxPrepTime] = useState<number>(60)
  const [maxCookTime, setMaxCookTime] = useState<number>(120)
  const [difficulty, setDifficulty] = useState<string[]>(['moyen'])
  const [diet, setDiet] = useState<string[]>([])
  const [allergies, setAllergies] = useState<string[]>([])
  const [editableIngredients, setEditableIngredients] = useState<DetectedIngredient[]>(ingredients)
  const [newIngredient, setNewIngredient] = useState<string>('')
  const [editingIngredient, setEditingIngredient] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState<string>('')
  const [showCountryError, setShowCountryError] = useState<boolean>(false)

  // Sync ingredients when they change
  useEffect(() => {
    setEditableIngredients(ingredients)
  }, [ingredients])

  const countries = [
    'Afghanistan', 'Afrique du Sud', 'Albanie', 'Algérie', 'Allemagne', 'Andorre', 'Angola',
    'Antigua-et-Barbuda', 'Arabie saoudite', 'Argentine', 'Arménie', 'Australie', 'Autriche',
    'Azerbaïdjan', 'Bahamas', 'Bahreïn', 'Bangladesh', 'Barbade', 'Belgique', 'Belize', 'Bénin',
    'Bhoutan', 'Bolivie', 'Bosnie-Herzégovine', 'Botswana', 'Brésil', 'Brunei', 'Bulgarie',
    'Burkina Faso', 'Burundi', 'Cambodge', 'Cameroun', 'Canada', 'Cap-Vert', 'Chili', 'Chine',
    'Chypre', 'Colombie', 'Comores', 'Congo', 'République démocratique du Congo', 'Corée du Nord',
    'Corée du Sud', 'Costa Rica', 'Côte d\'Ivoire', 'Croatie', 'Cuba', 'Danemark', 'Djibouti',
    'Dominique', 'Égypte', 'Émirats arabes unis', 'Équateur', 'Érythrée', 'Espagne', 'Estonie',
    'Eswatini', 'États-Unis', 'Éthiopie', 'Fidji', 'Finlande', 'France', 'Gabon', 'Gambie',
    'Géorgie', 'Ghana', 'Grèce', 'Grenade', 'Guatemala', 'Guinée', 'Guinée-Bissau',
    'Guinée équatoriale', 'Guyana', 'Haïti', 'Honduras', 'Hongrie', 'Inde', 'Indonésie', 'Irak',
    'Iran', 'Irlande', 'Islande', 'Italie', 'Jamaïque', 'Japon', 'Jordanie', 'Kazakhstan',
    'Kenya', 'Kirghizistan', 'Kiribati', 'Koweït', 'Laos', 'Lesotho', 'Lettonie', 'Liban',
    'Libéria', 'Libye', 'Liechtenstein', 'Lituanie', 'Luxembourg', 'Madagascar', 'Malaisie',
    'Malawi', 'Maldives', 'Mali', 'Malte', 'Maroc', 'Marshall', 'Maurice', 'Mauritanie',
    'Mexique', 'Micronésie', 'Moldavie', 'Monaco', 'Mongolie', 'Monténégro', 'Mozambique',
    'Namibie', 'Nauru', 'Népal', 'Nicaragua', 'Niger', 'Nigéria', 'Norvège', 'Nouvelle-Zélande',
    'Oman', 'Ouganda', 'Ouzbékistan', 'Pakistan', 'Palaos', 'Panama', 'Papouasie-Nouvelle-Guinée',
    'Paraguay', 'Pays-Bas', 'Pérou', 'Philippines', 'Pologne', 'Portugal', 'Qatar',
    'République centrafricaine', 'République dominicaine', 'République tchèque',
    'Roumanie', 'Royaume-Uni', 'Russie', 'Rwanda', 'Saint-Kitts-et-Nevis', 'Saint-Marin',
    'Saint-Vincent-et-les-Grenadines', 'Sainte-Lucie', 'Salomon', 'Salvador', 'Samoa',
    'São Tomé-et-Príncipe', 'Sénégal', 'Serbie', 'Seychelles', 'Sierra Leone', 'Singapour',
    'Slovaquie', 'Slovénie', 'Somalie', 'Soudan', 'Soudan du Sud', 'Sri Lanka', 'Suède',
    'Suisse', 'Suriname', 'Syrie', 'Tadjikistan', 'Tanzanie', 'Tchad', 'Thaïlande', 'Timor oriental',
    'Togo', 'Tonga', 'Trinité-et-Tobago', 'Tunisie', 'Turkménistan', 'Turquie', 'Tuvalu',
    'Ukraine', 'Uruguay', 'Vanuatu', 'Vatican', 'Venezuela', 'Vietnam', 'Yémen', 'Zambie',
    'Zimbabwe'
  ]

  const dietOptions = [
    { value: 'omnivore', label: t('preferences.diet.omnivore') },
    { value: 'végétarien', label: t('preferences.diet.vegetarian') },
    { value: 'végétalien', label: t('preferences.diet.vegan') },
    { value: 'pescétarien', label: t('preferences.diet.pescatarian') },
    { value: 'paléo', label: t('preferences.diet.paleo') },
    { value: 'cétogène', label: t('preferences.diet.keto') },
    { value: 'sans gluten', label: t('preferences.diet.gluten-free') },
    { value: 'halal', label: t('preferences.diet.halal') },
    { value: 'casher', label: t('preferences.diet.kosher') },
    { value: 'low-carb', label: t('preferences.diet.low-carb') },
    { value: 'sans lactose', label: t('preferences.diet.lactose-free') }
  ]

  const allergyOptions = [
    { value: 'gluten', label: t('preferences.allergies.gluten') },
    { value: 'lactose', label: t('preferences.allergies.lactose') },
    { value: 'noix', label: t('preferences.allergies.nuts') },
    { value: 'arachides', label: t('preferences.allergies.peanuts') },
    { value: 'œufs', label: t('preferences.allergies.eggs') },
    { value: 'poisson', label: t('preferences.allergies.fish') },
    { value: 'crustacés', label: t('preferences.allergies.shellfish') },
    { value: 'soja', label: t('preferences.allergies.soy') },
    { value: 'sésame', label: t('preferences.allergies.sesame') },
    { value: 'moutarde', label: t('preferences.allergies.mustard') },
    { value: 'céleri', label: t('preferences.allergies.celery') },
    { value: 'sulfites', label: t('preferences.allergies.sulfites') }
  ]

  const difficultyOptions = [
    { value: 'facile', label: t('preferences.difficulty.easy'), description: t('preferences.difficulty.easy.desc') },
    { value: 'moyen', label: t('preferences.difficulty.medium'), description: t('preferences.difficulty.medium.desc') },
    { value: 'difficile', label: t('preferences.difficulty.hard'), description: t('preferences.difficulty.hard.desc') }
  ]

  // Ingredient management functions
  const addIngredient = () => {
    if (newIngredient.trim()) {
      const newIng: DetectedIngredient = {
        id: `manual-${Date.now()}`,
        name: newIngredient.trim(),
        confidence: 1.0,
        category: 'food',
        boundingBox: undefined
      }
      setEditableIngredients([...editableIngredients, newIng])
      setNewIngredient('')
    }
  }

  const removeIngredient = (id: string) => {
    setEditableIngredients(editableIngredients.filter(ing => ing.id !== id))
  }

  const startEditing = (id: string, currentName: string) => {
    setEditingIngredient(id)
    setEditingValue(currentName)
  }

  const saveEdit = () => {
    if (editingValue.trim()) {
      setEditableIngredients(editableIngredients.map(ing => 
        ing.id === editingIngredient 
          ? { ...ing, name: editingValue.trim() }
          : ing
      ))
    }
    setEditingIngredient(null)
    setEditingValue('')
  }

  const cancelEdit = () => {
    setEditingIngredient(null)
    setEditingValue('')
  }

  const handleContinue = () => {
    // Validation: Check if country is selected when chef mode is 'country'
    if (chefMode === 'country' && (!selectedCountry || selectedCountry.trim() === '' || selectedCountry === 'Sélectionnez un pays')) {
      setShowCountryError(true)
      return // Don't proceed if no country selected
    }

    // Clear error if country is selected
    setShowCountryError(false)

    const preferences: UserPreferences = {
      cuisine: chefMode === 'country' && selectedCountry ? [selectedCountry] : [],
      diet,
      allergies,
      maxPrepTime,
      maxCookTime,
      difficulty,
      chefMode,
      selectedCountry: chefMode === 'country' ? selectedCountry : null,
      autoUpdateRecipe: false,
      modifiedIngredients: editableIngredients
    }

    onPreferencesSet(preferences)
  }

  // Filter countries based on search
  const filteredCountries = countries.filter(country =>
    country.toLowerCase().includes(countrySearch.toLowerCase())
  )

  // Clear search when country is selected
  const handleCountryChange = (country: string) => {
    setSelectedCountry(country)
    if (country) {
      setCountrySearch('')
      // Clear error when country is selected
      setShowCountryError(false)
    }
  }

  const handleChefModeChange = (mode: 'expert' | 'country' | 'simple') => {
    // Restrict country mode to Pro users
    if (mode === 'country' && !isSubscribed) {
      setShowSubscriptionPrompt(true)
      return
    }
    
    setChefMode(mode)
    // Clear error when chef mode changes away from country
    if (mode !== 'country') {
      setShowCountryError(false)
    }
  }

  const toggleArrayItem = (array: string[], setter: (arr: string[]) => void, item: string) => {
    if (array.includes(item)) {
      setter(array.filter(i => i !== item))
    } else {
      setter([...array, item])
    }
  }

  return (
    <>
      {showSubscriptionPrompt && (
        <SubscriptionPrompt onClose={() => setShowSubscriptionPrompt(false)} />
      )}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          {t('preferences.title')}
        </h2>
        <p className="text-gray-600 text-lg">
          {t('preferences.subtitle')}
        </p>
      </div>

      {/* Editable Ingredients */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          {editableIngredients.length > 0 ? t('preferences.ingredients.detected') : t('preferences.ingredients.add')}
        </h3>
        
        {/* Ingredients List */}
        <div className="flex flex-wrap gap-2 mb-4">
          {editableIngredients.length === 0 && (
            <div className="w-full text-center py-8 text-gray-500">
              <p className="text-sm mb-2">{t('preferences.ingredients.empty')}</p>
              <p className="text-xs">{t('preferences.ingredients.empty.subtitle')}</p>
            </div>
          )}
          {editableIngredients.map((ingredient) => (
            <div
              key={ingredient.id}
              className="flex items-center gap-1 px-3 py-1 bg-white rounded-full text-sm text-gray-700 border hover:border-primary-300 transition-colors"
            >
              {editingIngredient === ingredient.id ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    className="text-sm border-none outline-none bg-transparent min-w-0 flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                    autoFocus
                  />
                  <button
                    onClick={saveEdit}
                    className="text-green-600 hover:text-green-700"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <span>{ingredient.name}</span>
                  <button
                    onClick={() => startEditing(ingredient.id, ingredient.name)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => removeIngredient(ingredient.id)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add New Ingredient */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={t('preferences.ingredients.add.placeholder')}
            value={newIngredient}
            onChange={(e) => setNewIngredient(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <button
            onClick={addIngredient}
            className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">{t('common.add')}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Chef Mode Selection */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ChefHat className="w-5 h-5 mr-2 text-primary-600" />
              {t('preferences.chef.title')}
            </h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="chefMode"
                  value="simple"
                  checked={chefMode === 'simple'}
                  onChange={(e) => handleChefModeChange(e.target.value as any)}
                  className="w-4 h-4 text-primary-600"
                />
                <div>
                  <div className="font-medium">{t('preferences.chef.simple')}</div>
                  <div className="text-sm text-gray-600">{t('preferences.chef.simple.desc')}</div>
                </div>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="chefMode"
                  value="expert"
                  checked={chefMode === 'expert'}
                  onChange={(e) => handleChefModeChange(e.target.value as any)}
                  className="w-4 h-4 text-primary-600"
                />
                <div>
                  <div className="font-medium">{t('preferences.chef.expert')}</div>
                  <div className="text-sm text-gray-600">{t('preferences.chef.expert.desc')}</div>
                </div>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="chefMode"
                  value="country"
                  checked={chefMode === 'country'}
                  onChange={(e) => handleChefModeChange(e.target.value as any)}
                  className="w-4 h-4 text-primary-600"
                />
                <div className="flex-1">
                  <div className="font-medium flex items-center">
                    {t('preferences.chef.country')}
                    <Crown className="w-4 h-4 ml-2 text-yellow-500" />
                  </div>
                  <div className="text-sm text-gray-600">{t('preferences.chef.country.desc')}</div>
                </div>
              </label>
            </div>
          </div>

          {/* Country Selection */}
          {chefMode === 'country' && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Globe className="w-5 h-5 mr-2 text-primary-600" />
                Choisissez un pays
              </h3>
              
              {/* Search Input */}
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder={t('preferences.country.search')}
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    className="w-full p-3 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  {countrySearch && (
                    <button
                      type="button"
                      onClick={() => setCountrySearch('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Country Dropdown */}
              <div className="relative">
                <select
                  value={selectedCountry}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">{t('preferences.country.select')}</option>
                  {filteredCountries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
                
                {/* Search Results Count */}
                {countrySearch && (
                  <div className="mt-2 text-sm text-gray-600">
                    {filteredCountries.length} pays trouvé{filteredCountries.length > 1 ? 's' : ''}
                    {filteredCountries.length === 0 && ' - Aucun pays trouvé'}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Time Preferences */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-primary-600" />
              Temps de cuisine
            </h3>
            <div className="space-y-6">
              {/* Preparation Time */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">
                    Temps de préparation
                  </label>
                  <span className="text-sm font-semibold text-primary-600">
                    {maxPrepTime} min
                  </span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="120"
                  step="15"
                  value={maxPrepTime}
                  onChange={(e) => setMaxPrepTime(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(maxPrepTime - 15) / (120 - 15) * 100}%, #e5e7eb ${(maxPrepTime - 15) / (120 - 15) * 100}%, #e5e7eb 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>15 min</span>
                  <span>2h</span>
                </div>
              </div>
              
              {/* Cooking Time */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">
                    Temps de cuisson
                  </label>
                  <span className="text-sm font-semibold text-primary-600">
                    {maxCookTime} min
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="180"
                  step="15"
                  value={maxCookTime}
                  onChange={(e) => setMaxCookTime(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${maxCookTime / 180 * 100}%, #e5e7eb ${maxCookTime / 180 * 100}%, #e5e7eb 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0 min</span>
                  <span>3h</span>
                </div>
              </div>
              
              {/* Total Time Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center space-x-2 text-sm text-blue-800">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">Temps total maximum : {maxPrepTime + maxCookTime} minutes</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Difficulty Selection */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('preferences.difficulty.title')}
            </h3>
            <div className="space-y-3">
              {difficultyOptions.map((option) => (
                <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={difficulty.includes(option.value)}
                    onChange={() => toggleArrayItem(difficulty, setDifficulty, option.value)}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-gray-600">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Diet Selection */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('preferences.diet.title')}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {dietOptions.map((dietOption) => (
                <label key={dietOption.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={diet.includes(dietOption.value)}
                    onChange={() => toggleArrayItem(diet, setDiet, dietOption.value)}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                  <span className="text-sm">{dietOption.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Allergies */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('preferences.allergies.title')}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {allergyOptions.map((allergy) => (
                <label key={allergy.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allergies.includes(allergy.value)}
                    onChange={() => toggleArrayItem(allergies, setAllergies, allergy.value)}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                  <span className="text-sm">{allergy.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {showCountryError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">{t('preferences.errors.country.required')}</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="btn-secondary flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('common.back')}</span>
        </button>
        
        <button
          onClick={handleContinue}
          className="btn-primary flex items-center space-x-2"
        >
          <span>{t('preferences.actions.generate')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
    </>
  )
}
