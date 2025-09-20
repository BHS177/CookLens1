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
import { useLanguage } from '@/contexts/LanguageContext'

export default function SimpleUserDashboard() {
  const { user, isLoaded } = useUser()
  const { t } = useLanguage()
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
        setError('Error loading data')
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
    if (confirm('Are you sure you want to delete this recipe?')) {
      if (user) {
        const success = await removeRecipe(user.id, recipeId)
        if (success) {
          setSavedRecipes(prev => prev.filter(recipe => recipe.id !== recipeId))
        } else {
          alert('Error deleting recipe')
        }
      }
    }
  }

  const filteredRecipes = savedRecipes.filter(recipe => 
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.description.toLowerCase().includes(searchQuery.toLowerCase())
  )


  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will immediately lose access to Pro features.')) {
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
        alert('Your subscription has been cancelled. You no longer have access to Pro features.')
      } else {
        alert('Error cancelling subscription: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      alert('Error cancelling subscription')
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
        alert('Error creating payment session: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      alert('Error creating payment session')
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
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Login required</h3>
        <p className="text-gray-600">Please log in to access your dashboard</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-2 sm:space-x-8 overflow-x-auto">
          {[
            { id: 'overview', name: t('dashboard.overview'), icon: TrendingUp },
            { id: 'recipes', name: t('dashboard.recipes'), icon: BookOpen },
            { id: 'preferences', name: t('dashboard.preferences'), icon: Settings },
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
                      <span className="text-sm font-medium text-gray-900">{t('dashboard.subscriptionStatus')}</span>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Pro
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Price</dt>
                      <dd className="text-sm text-gray-900">
                        {(subscription.price / 100).toFixed(2)}€ / {subscription.interval === 'month' ? 'month' : 'year'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Status</dt>
                      <dd className="text-sm text-gray-900 capitalize">
                        {subscription.status === 'active' ? 'Active' : subscription.status}
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
                          Cancelling...
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 mr-2" />
                          Cancel subscription
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h4 className="text-sm font-medium text-gray-900 mb-1">{t('dashboard.noActiveSubscription')}</h4>
                  <p className="text-sm text-gray-500 mb-4">
                    {t('dashboard.upgradeToPro')}
                  </p>
                  <button 
                    onClick={handleSubscribe}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    {t('dashboard.subscribe')}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
              <h3 className="text-base sm:text-lg font-medium text-gray-900">{t('dashboard.recentRecipes')}</h3>
            </div>
            <div className="p-4 sm:p-6">
              {savedRecipes.slice(0, 5).length === 0 ? (
                <p className="text-gray-500 text-center py-4 text-sm sm:text-base">{t('dashboard.noSavedRecipes')}</p>
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
                placeholder="Search for a recipe..."
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
                {searchQuery ? 'No recipes found' : 'No saved recipes'}
              </h3>
              <p className="text-gray-600">
                {searchQuery 
                  ? 'Try modifying your search criteria.'
                  : 'Start by saving your first recipe!'
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
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Synchronization</h3>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
              <span className="text-xs sm:text-sm text-gray-600">
                Your data is synchronized across all your devices
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Log in with the same Clerk account on any device to access your recipes.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
