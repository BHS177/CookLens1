'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Filter, 
  Clock, 
  Users, 
  ChefHat, 
  Heart, 
  Star,
  Trash2,
  Eye,
  X
} from 'lucide-react'
import { useApp } from '@/components/Providers'
import { SavedRecipe } from '@/types'
import { formatTime, formatDifficulty, formatCuisine } from '@/lib/utils'

export default function RecipesPage() {
  const { savedRecipes, removeRecipe, toggleFavorite } = useApp()
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    cuisine: '',
    difficulty: '',
    isFavorite: false,
    maxTime: 0
  })

  const filteredRecipes = useMemo(() => {
    return savedRecipes.filter(recipe => {
      const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           recipe.description.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCuisine = !filters.cuisine || recipe.cuisine === filters.cuisine
      const matchesDifficulty = !filters.difficulty || recipe.difficulty === filters.difficulty
      const matchesFavorite = !filters.isFavorite || recipe.isFavorite
      const matchesTime = !filters.maxTime || (recipe.prepTime + recipe.cookTime) <= filters.maxTime

      return matchesSearch && matchesCuisine && matchesDifficulty && matchesFavorite && matchesTime
    })
  }, [savedRecipes, searchQuery, filters])

  const clearFilters = () => {
    setFilters({
      cuisine: '',
      difficulty: '',
      isFavorite: false,
      maxTime: 0
    })
  }

  const handleDeleteRecipe = (recipeId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette recette ?')) {
      removeRecipe(recipeId)
    }
  }

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes recettes</h1>
          <p className="text-gray-600">
            {savedRecipes.length} recette{savedRecipes.length > 1 ? 's' : ''} sauvegardée{savedRecipes.length > 1 ? 's' : ''}
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="card mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une recette..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary inline-flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filtres</span>
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cuisine
                  </label>
                  <select
                    value={filters.cuisine}
                    onChange={(e) => setFilters(prev => ({ ...prev, cuisine: e.target.value }))}
                    className="input-field"
                  >
                    <option value="">Toutes les cuisines</option>
                    <option value="française">Française</option>
                    <option value="italienne">Italienne</option>
                    <option value="asiatique">Asiatique</option>
                    <option value="mexicaine">Mexicaine</option>
                    <option value="indienne">Indienne</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulté
                  </label>
                  <select
                    value={filters.difficulty}
                    onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="input-field"
                  >
                    <option value="">Toutes les difficultés</option>
                    <option value="facile">Facile</option>
                    <option value="moyen">Moyen</option>
                    <option value="difficile">Difficile</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Temps max (min)
                  </label>
                  <input
                    type="number"
                    placeholder="Aucune limite"
                    value={filters.maxTime || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxTime: parseInt(e.target.value) || 0 }))}
                    className="input-field"
                  />
                </div>

                <div className="flex items-end">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.isFavorite}
                      onChange={(e) => setFilters(prev => ({ ...prev, isFavorite: e.target.checked }))}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Favoris seulement</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={clearFilters}
                  className="btn-secondary"
                >
                  Effacer les filtres
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Recipes Grid */}
        {filteredRecipes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="card text-center py-12"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ChefHat className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {savedRecipes.length === 0 ? 'Aucune recette sauvegardée' : 'Aucune recette trouvée'}
            </h3>
            <p className="text-gray-600">
              {savedRecipes.length === 0 
                ? 'Commencez par prendre une photo de votre frigo pour générer votre première recette !'
                : 'Essayez de modifier vos critères de recherche.'
              }
            </p>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe, index) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card hover:shadow-md transition-shadow duration-200"
              >
                {/* Recipe Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {recipe.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {recipe.description}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleFavorite(recipe.id)}
                    className={`p-2 rounded-xl transition-colors duration-200 ${
                      recipe.isFavorite 
                        ? 'text-red-500 hover:bg-red-50' 
                        : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${recipe.isFavorite ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Recipe Meta */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <div className="flex items-center space-x-1 bg-primary-50 px-2 py-1 rounded-lg">
                    <Clock className="w-3 h-3 text-primary-600" />
                    <span className="text-xs font-medium text-primary-700">
                      {formatTime(recipe.prepTime + recipe.cookTime)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 bg-primary-50 px-2 py-1 rounded-lg">
                    <Users className="w-3 h-3 text-primary-600" />
                    <span className="text-xs font-medium text-primary-700">
                      {recipe.servings}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 bg-primary-50 px-2 py-1 rounded-lg">
                    <ChefHat className="w-3 h-3 text-primary-600" />
                    <span className="text-xs font-medium text-primary-700">
                      {formatDifficulty(recipe.difficulty)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-lg">
                    <span className="text-xs font-medium text-gray-700">
                      {formatCuisine(recipe.cuisine)}
                    </span>
                  </div>
                </div>

                {/* Recipe Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4" />
                    <span>{recipe.nutrition.calories} cal</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>{recipe.ingredients.length} ingrédients</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <button className="btn-primary text-sm py-2 px-4">
                    <Eye className="w-4 h-4 mr-2" />
                    Voir la recette
                  </button>
                  <button
                    onClick={() => handleDeleteRecipe(recipe.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

