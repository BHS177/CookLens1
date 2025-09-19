'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Heart, 
  Clock, 
  Users, 
  ChefHat, 
  Star, 
  Trash2, 
  Settings, 
  TrendingUp,
  Calendar,
  Globe,
  Bell,
  Shield,
  Award,
  BookOpen,
  Filter,
  Search,
  Loader2,
  Crown,
  CreditCard,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { getUserData, removeRecipe } from '@/lib/hybrid-storage'
import { SavedRecipe, UserPreferences } from '@/types'

export default function SimpleUserDashboard() {
  const { user, isLoaded } = useUser()
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([])
  const [preferences, setPreferences] = useState<UserPreferences>({
    cuisine: [],
    diet: [],
    allergies: [],
    maxPrepTime: 60,
    maxCookTime: 60,
    difficulty: [],
    chefMode: 'simple',
    selectedCountry: null,
    autoUpdateRecipe: true,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'recipes' | 'preferences'>('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [subscription, setSubscription] = useState<any>(null)
  const [subscriptionLoading, setSubscriptionLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      if (!user || !isLoaded) return

      try {
        setLoading(true)
        const userData = await getUserData(user.id)
        setSavedRecipes(userData.savedRecipes)
        setPreferences(userData.preferences)
      } catch (err) {
        console.error('Error loading user data:', err)
        setError('Erreur lors du chargement des données')
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [user, isLoaded])

  // Load subscription data
  useEffect(() => {
    const loadSubscriptionData = async () => {
      if (!user || !isLoaded) return

      try {
        setSubscriptionLoading(true)
        const response = await fetch('/api/subscription/details')
        const data = await response.json()
        setSubscription(data.subscription)
      } catch (err) {
        console.error('Error loading subscription data:', err)
      } finally {
        setSubscriptionLoading(false)
      }
    }

    loadSubscriptionData()
  }, [user, isLoaded])

  const handleDeleteRecipe = async (recipeId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette recette ?')) {
      if (user) {
        const success = await removeRecipe(user.id, recipeId)
        if (success) {
          setSavedRecipes(prev => prev.filter(recipe => recipe.id !== recipeId))
        } else {
          alert('Erreur lors de la suppression de la recette')
        }
      }
    }
  }

  const filteredRecipes = savedRecipes.filter(recipe => 
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (timestamp: number) => {
    if (!timestamp || isNaN(timestamp)) {
      return 'N/A'
    }
    return new Date(timestamp * 1000).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getDaysUntilExpiry = (timestamp: number) => {
    if (!timestamp || isNaN(timestamp)) {
      return 0
    }
    const now = new Date().getTime()
    const expiry = new Date(timestamp * 1000).getTime()
    const diffTime = expiry - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays) // Ensure non-negative
  }

  const handleCancelSubscription = async () => {
    if (!confirm('Êtes-vous sûr de vouloir annuler votre abonnement ? Vous perdrez immédiatement l\'accès aux fonctionnalités Pro.')) {
      return
    }

    try {
      setCancelling(true)
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data.success) {
        // Reload subscription data
        const subscriptionResponse = await fetch('/api/subscription/details')
        const subscriptionData = await subscriptionResponse.json()
        setSubscription(subscriptionData.subscription)
        alert('Votre abonnement a été annulé. Vous n\'avez plus accès aux fonctionnalités Pro.')
      } else {
        alert('Erreur lors de l\'annulation de l\'abonnement: ' + (data.error || 'Erreur inconnue'))
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      alert('Erreur lors de l\'annulation de l\'abonnement')
    } finally {
      setCancelling(false)
    }
  }

  const handleSubscribe = async () => {
    try {
      const response = await fetch('/api/subscription/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url
      } else {
        alert('Erreur lors de la création de la session de paiement: ' + (data.error || 'Erreur inconnue'))
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      alert('Erreur lors de la création de la session de paiement')
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Connexion requise</h3>
        <p className="text-gray-600">Connectez-vous pour accéder à votre tableau de bord</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-2 sm:space-x-8 overflow-x-auto">
          {[
            { id: 'overview', name: 'Vue', icon: TrendingUp },
            { id: 'recipes', name: 'Mes recettes', icon: BookOpen },
            { id: 'preferences', name: 'Préférences', icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-1 sm:space-x-2 py-2 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{tab.name}</span>
              <span className="sm:hidden">{tab.name.split(' ')[0]}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600" />
                </div>
                <div className="ml-3 sm:ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                      Recettes sauvegardées
                    </dt>
                    <dd className="text-base sm:text-lg font-medium text-gray-900">
                      {savedRecipes.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
                </div>
                <div className="ml-3 sm:ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                      Favoris
                    </dt>
                    <dd className="text-base sm:text-lg font-medium text-gray-900">
                      {savedRecipes.filter(r => r.isFavorite).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 sm:p-6 sm:col-span-2 md:col-span-1">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChefHat className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                </div>
                <div className="ml-3 sm:ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                      Mode chef
                    </dt>
                    <dd className="text-base sm:text-lg font-medium text-gray-900 capitalize">
                      {preferences.chefMode}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Status Card */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 flex items-center">
                <Crown className="w-5 h-5 mr-2 text-yellow-500" />
                Statut d&apos;abonnement
              </h3>
            </div>
            <div className="p-4 sm:p-6">
              {subscriptionLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
                </div>
              ) : subscription ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      <span className="text-sm font-medium text-gray-900">Abonnement actif</span>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Pro
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Prix</dt>
                      <dd className="text-sm text-gray-900">
                        {(subscription.price / 100).toFixed(2)}€ / {subscription.interval === 'month' ? 'mois' : 'an'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Statut</dt>
                      <dd className="text-sm text-gray-900 capitalize">
                        {subscription.status === 'active' ? 'Actif' : subscription.status}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Fin de période</dt>
                      <dd className="text-sm text-gray-900">
                        {formatDate(subscription.currentPeriodEnd)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Jours restants</dt>
                      <dd className="text-sm text-gray-900">
                        {getDaysUntilExpiry(subscription.currentPeriodEnd)} jours
                      </dd>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handleCancelSubscription}
                      disabled={cancelling}
                      className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {cancelling ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Annulation...
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 mr-2" />
                          Annuler l&apos;abonnement
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Aucun abonnement actif</h4>
                  <p className="text-sm text-gray-500 mb-4">
                    Passez à CookLens Pro pour débloquer toutes les fonctionnalités
                  </p>
                  <button 
                    onClick={handleSubscribe}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    S&apos;abonner
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
              <h3 className="text-base sm:text-lg font-medium text-gray-900">Recettes récentes</h3>
            </div>
            <div className="p-4 sm:p-6">
              {savedRecipes.slice(0, 5).length === 0 ? (
                <p className="text-gray-500 text-center py-4 text-sm sm:text-base">Aucune recette sauvegardée</p>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {savedRecipes.slice(0, 5).map((recipe) => (
                    <div key={recipe.id} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-medium text-gray-900 truncate">{recipe.title}</h4>
                        <p className="text-xs text-gray-500 truncate">{recipe.cuisine}</p>
                      </div>
                      <div className="flex items-center space-x-2 ml-2">
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {recipe.prepTime + recipe.cookTime} min
                        </span>
                        <button
                          onClick={() => handleDeleteRecipe(recipe.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recipes Tab */}
      {activeTab === 'recipes' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une recette..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredRecipes.map((recipe) => (
              <div key={recipe.id} className="bg-white rounded-lg shadow p-4 sm:p-6">
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-1 truncate">
                      {recipe.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                      {recipe.description}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteRecipe(recipe.id)}
                    className="text-red-500 hover:text-red-700 ml-2 p-1"
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
                  <div className="flex items-center space-x-1 bg-primary-50 px-2 py-1 rounded-lg">
                    <Clock className="w-3 h-3 text-primary-600" />
                    <span className="text-xs font-medium text-primary-700">
                      {recipe.prepTime + recipe.cookTime} min
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
                      {recipe.difficulty === 'easy' ? 'Facile' : recipe.difficulty === 'medium' ? 'Moyen' : 'Difficile'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-500 truncate">{recipe.cuisine}</span>
                  {recipe.isFavorite && (
                    <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 fill-current flex-shrink-0" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredRecipes.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery ? 'Aucune recette trouvée' : 'Aucune recette sauvegardée'}
              </h3>
              <p className="text-gray-600">
                {searchQuery 
                  ? 'Essayez de modifier vos critères de recherche.'
                  : 'Commencez par sauvegarder votre première recette !'
                }
              </p>
            </div>
          )}
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Préférences de cuisine</h3>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Mode chef
                </label>
                <span className="text-xs sm:text-sm text-gray-600 capitalize">
                  {preferences.chefMode}
                </span>
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Temps de préparation maximum
                </label>
                <span className="text-xs sm:text-sm text-gray-600">
                  {preferences.maxPrepTime} minutes
                </span>
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Temps de cuisson maximum
                </label>
                <span className="text-xs sm:text-sm text-gray-600">
                  {preferences.maxCookTime} minutes
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Synchronisation</h3>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
              <span className="text-xs sm:text-sm text-gray-600">
                Vos données sont synchronisées sur tous vos appareils
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Connectez-vous avec le même compte Clerk sur n&apos;importe quel appareil pour accéder à vos recettes.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
