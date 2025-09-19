'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export type Language = 'fr' | 'en'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Traductions
const translations = {
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.recipes': 'Mes recettes',
    'nav.settings': 'Paramètres',
    
    // Homepage
    'home.title': 'Découvrez des recettes avec vos ingrédients',
    'home.subtitle': 'Prenez une photo de votre frigo et laissez l\'IA créer des recettes personnalisées',
    'home.upload.title': 'Uploadez ou prenez une photo de votre frigo',
    'home.upload.subtitle': 'Glissez-déposez une image ou choisissez une option ci-dessous',
    'home.upload.takePhoto': 'Prendre une photo',
    'home.upload.chooseImage': 'Choisir une image',
    'home.upload.retakePhoto': 'Reprendre une photo',
    'home.upload.changeImage': 'Changer d\'image',
    'home.upload.formats': 'Formats supportés: JPG, PNG, WebP (max 5MB, sera compressé automatiquement)',
    'home.upload.mobileTip': 'Sur mobile: "Prendre une photo" ouvre l\'appareil photo',
    
    // Ingredient Detection
    'ingredients.analyzing': 'Analyse de votre image...',
    'ingredients.analyzing.subtitle': 'L\'IA ChatGPT analyse votre frigo pour détecter les ingrédients',
    'ingredients.detected': 'Ingrédients détectés dans votre frigo',
    'ingredients.detected.subtitle': 'L\'IA ChatGPT a identifié {count} ingrédient{plural} dans votre image',
    'ingredients.confidence': 'Seuls les ingrédients détectés avec une confiance élevée sont affichés',
    'ingredients.confidence.level': '{level}% de confiance',
    'ingredients.demo.notice': 'Mode démonstration - Données d\'exemple utilisées',
    
    // Recipe Generation
    'recipe.generating.simple': 'Génération de votre recette...',
    'recipe.generating.expert': 'Chef Expert en action...',
    'recipe.generating.country': 'Chef spécialisé {country}...',
    'recipe.generating.subtitle.simple': 'ChefGPT crée une recette personnalisée pour vous',
    'recipe.generating.subtitle.expert': 'Le meilleur chef du monde crée une recette exceptionnelle',
    'recipe.generating.subtitle.country': 'Chef expert en cuisine {country} adapte vos ingrédients',
    
    // Recipe Display
    'recipe.servings': 'personnes',
    'recipe.difficulty': 'Difficulté',
    'recipe.prepTime': 'Préparation',
    'recipe.cookTime': 'Cuisson',
    'recipe.totalTime': 'Total',
    'recipe.ingredients': 'Ingrédients nécessaires',
    'recipe.instructions': 'Instructions',
    'recipe.nutrition': 'Valeurs nutritionnelles',
    'recipe.save': 'Sauvegarder',
    'recipe.newPhoto': 'Nouvelle photo',
    'recipe.update': 'Mettre à jour la recette',
    
    // Settings
    'settings.title': 'Paramètres',
    'settings.cuisine.title': 'Types de cuisine',
    'settings.cuisine.subtitle': 'Sélectionnez les types de cuisine que vous préférez (mode Simple uniquement)',
    'settings.diet.title': 'Régime alimentaire',
    'settings.diet.subtitle': 'Choisissez votre régime alimentaire principal',
    'settings.allergies.title': 'Allergies et intolérances',
    'settings.allergies.subtitle': 'Indiquez vos allergies pour éviter ces ingrédients dans vos recettes',
    'settings.cooking.title': 'Préférences de cuisson',
    'settings.difficulty.title': 'Niveau de difficulté',
    'settings.prepTime.title': 'Temps de préparation maximum (minutes)',
    'settings.cookTime.title': 'Temps de cuisson maximum (minutes)',
    'settings.chef.title': 'Mode Chef IA',
    'settings.chef.subtitle': 'Choisissez comment le chef IA doit créer vos recettes',
    'settings.chef.simple': 'Simple',
    'settings.chef.simple.desc': 'Recettes basiques et faciles',
    'settings.chef.expert': 'Expert',
    'settings.chef.expert.desc': 'Meilleur chef du monde',
    'settings.chef.country': 'Cuisine du Monde',
    'settings.chef.country.desc': 'Spécialiste pays',
    'settings.chef.country.select': 'Cuisine préférée',
    'settings.autoUpdate.title': 'Mise à jour automatique',
    'settings.autoUpdate.subtitle': 'Les recettes se mettent à jour automatiquement quand vous changez les paramètres',
    'settings.save': 'Sauvegarder',
    'settings.cancel': 'Annuler',
    
    // Chef Mode Explanations
    'chef.simple.explanation': 'Vous pouvez choisir les types de cuisine que vous préférez. Le chef créera des recettes basiques selon vos préférences.',
    'chef.expert.explanation': 'Le meilleur chef du monde décide automatiquement du style de cuisine optimal pour vos ingrédients. Aucune sélection de cuisine nécessaire.',
    'chef.country.explanation': 'Choisissez un pays et le chef expert de cette cuisine créera des recettes authentiques. Aucune sélection de cuisine générale nécessaire.',
    
    // Common
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.retry': 'Réessayer',
    'common.save': 'Sauvegarder',
    'common.cancel': 'Annuler',
    'common.reset': 'Réinitialiser',
    'common.close': 'Fermer',
    'common.back': 'Retour',
    'common.continue': 'Continuer',
    'common.generate': 'Générer',
    'common.add': 'Ajouter',
    'common.edit': 'Modifier',
    'common.delete': 'Supprimer',
    'common.confirm': 'Confirmer',
    'common.yes': 'Oui',
    'common.no': 'Non',
    
    // Cuisine Preferences
    'preferences.title': 'Personnalisez vos recettes',
    'preferences.subtitle': 'Dites-nous vos préférences pour des suggestions parfaites',
    'preferences.ingredients.detected': 'Ingrédients détectés :',
    'preferences.ingredients.add': 'Ajoutez vos ingrédients :',
    'preferences.ingredients.empty': 'Aucun ingrédient ajouté pour le moment',
    'preferences.ingredients.empty.subtitle': 'Utilisez le champ ci-dessous pour ajouter vos ingrédients',
    'preferences.ingredients.add.placeholder': 'Ajouter un ingrédient...',
    'preferences.chef.title': 'Mode Chef',
    'preferences.chef.simple': 'Simple',
    'preferences.chef.simple.desc': 'Recettes faciles et rapides',
    'preferences.chef.expert': 'Expert',
    'preferences.chef.expert.desc': 'Meilleures recettes du monde',
    'preferences.chef.country': 'Pays spécifique',
    'preferences.chef.country.desc': 'Spécialiste d\'un pays',
    'preferences.country.select': 'Sélectionnez un pays',
    'preferences.country.search': 'Rechercher un pays...',
    'preferences.country.found': 'pays trouvé',
    'preferences.country.found.plural': 'pays trouvés',
    'preferences.country.none': 'Aucun pays trouvé',
    'preferences.time.title': 'Temps de cuisine',
    'preferences.time.prep': 'Temps de préparation',
    'preferences.time.cook': 'Temps de cuisson',
    'preferences.time.total': 'Temps total maximum',
    'preferences.time.minutes': 'minutes',
    'preferences.difficulty.title': 'Niveau de difficulté',
    'preferences.difficulty.easy': 'Facile',
    'preferences.difficulty.easy.desc': 'Recettes simples et rapides',
    'preferences.difficulty.medium': 'Moyen',
    'preferences.difficulty.medium.desc': 'Recettes avec quelques techniques',
    'preferences.difficulty.hard': 'Difficile',
    'preferences.difficulty.hard.desc': 'Recettes complexes et techniques',
    'preferences.diet.title': 'Régime alimentaire',
    'preferences.diet.omnivore': 'Omnivore',
    'preferences.diet.vegetarian': 'Végétarien',
    'preferences.diet.vegan': 'Végétalien',
    'preferences.diet.pescatarian': 'Pescétarien',
    'preferences.diet.paleo': 'Paléo',
    'preferences.diet.keto': 'Cétogène',
    'preferences.diet.gluten-free': 'Sans gluten',
    'preferences.diet.halal': 'Halal',
    'preferences.diet.kosher': 'Casher',
    'preferences.diet.low-carb': 'Low-carb',
    'preferences.diet.lactose-free': 'Sans lactose',
    'preferences.allergies.title': 'Allergies et intolérances',
    'preferences.allergies.gluten': 'Gluten',
    'preferences.allergies.lactose': 'Lactose',
    'preferences.allergies.nuts': 'Noix',
    'preferences.allergies.peanuts': 'Arachides',
    'preferences.allergies.eggs': 'Œufs',
    'preferences.allergies.fish': 'Poisson',
    'preferences.allergies.shellfish': 'Crustacés',
    'preferences.allergies.soy': 'Soja',
    'preferences.allergies.sesame': 'Sésame',
    'preferences.allergies.mustard': 'Moutarde',
    'preferences.allergies.celery': 'Céleri',
    'preferences.allergies.sulfites': 'Sulfites',
    'preferences.actions.back': 'Retour',
    'preferences.actions.generate': 'Générer les suggestions',
    'preferences.errors.country.required': 'Veuillez sélectionner un pays pour continuer',
    
    // Image Upload
    'upload.drag.title': 'Glissez-déposez votre image ici',
    'upload.formats': 'Formats supportés: JPG, PNG, WebP (max 10MB)',
    'upload.optimized': '✨ Qualité optimisée automatiquement pour une meilleure détection',
    'upload.skip.title': 'Ou ajoutez vos ingrédients manuellement',
    'upload.skip.button': 'Ajouter les ingrédients manuellement →',
    'upload.ready': 'Image prête pour l\'analyse',
    
    // Recipe Generator
    'recipe.title': 'Générer des recettes personnalisées',
    'recipe.subtitle': 'Basées sur vos ingrédients détectés et vos préférences',
    'recipe.mode': 'Mode',
    'recipe.mode.expert': 'Expert',
    'recipe.mode.country': 'Pays',
    'recipe.mode.simple': 'Simple',
    'recipe.time': 'Temps',
    'recipe.diet': 'Régime',
    'recipe.generate.button': 'Générer les suggestions',
    'recipe.generating': 'Génération en cours...',
    
    // Ingredient Detection
    'detection.analyzing': 'Analyse de votre image...',
    'detection.analyzing.subtitle': 'L\'IA ChatGPT analyse votre frigo pour détecter les ingrédients',
    'detection.error.title': 'Erreur d\'analyse',
    'detection.error.api': 'API ChatGPT Indisponible',
    'detection.error.retry': 'Réessayer',
    'detection.api.info': 'Information importante',
    'detection.api.limit': 'L\'API ChatGPT a atteint sa limite de requêtes. Veuillez réessayer plus tard.',
    
    // Dashboard
    'dashboard.title': 'Mon Tableau de Bord',
    'dashboard.subtitle': 'Gérez vos recettes sauvegardées, préférences et statistiques personnelles',
    'dashboard.overview': 'Vue d\'ensemble',
    'dashboard.recipes': 'Mes recettes',
    'dashboard.preferences': 'Préférences',
    'dashboard.savedRecipes': 'Recettes sauvegardées',
    'dashboard.favorites': 'Favoris',
    'dashboard.chefMode': 'Mode chef',
    'dashboard.simple': 'Simple',
    'dashboard.subscriptionStatus': 'Statut d\'abonnement',
    'dashboard.noActiveSubscription': 'Aucun abonnement actif',
    'dashboard.upgradeToPro': 'Passez à CookLens Pro pour débloquer toutes les fonctionnalités',
    'dashboard.subscribe': 'S\'abonner',
    'dashboard.recentRecipes': 'Recettes récentes',
    'dashboard.noSavedRecipes': 'Aucune recette sauvegardée',
    'dashboard.signOut': 'Se déconnecter',
    
    // Cooking Time
    'cookingTime.title': 'Temps de cuisine',
    'cookingTime.prepTime': 'Temps de préparation',
    'cookingTime.cookTime': 'Temps de cuisson',
    'cookingTime.totalMax': 'Temps total maximum : {minutes} minutes',
    'cookingTime.minutes': '{minutes} min',
    
    // Difficulty Level
    'difficulty.title': 'Niveau de difficulté',
    'difficulty.easy': 'Facile',
    'difficulty.easy.desc': 'Recettes simples et rapides',
    'difficulty.medium': 'Moyen',
    'difficulty.medium.desc': 'Recettes avec quelques techniques',
    'difficulty.hard': 'Difficile',
    'difficulty.hard.desc': 'Recettes complexes et techniques',
    
    // Navigation
    'nav.backToPreferences': 'Retour aux préférences',
    
    // Features
    'features.smartPhoto': 'Photo intelligente',
    'features.smartPhoto.desc': 'Détection automatique des ingrédients dans votre frigo',
    'features.aiRecipes': 'Recettes IA',
    'features.aiRecipes.desc': 'Génération de recettes personnalisées avec ChefGPT',
    'features.advancedFilters': 'Filtres avancés',
    'features.advancedFilters.desc': 'Cuisine, régime alimentaire et préférences',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.recipes': 'My Recipes',
    'nav.settings': 'Settings',
    
    // Homepage
    'home.title': 'Discover recipes with your ingredients',
    'home.subtitle': 'Take a photo of your fridge and let AI create personalized recipes',
    'home.upload.title': 'Upload or take a photo of your fridge',
    'home.upload.subtitle': 'Drag and drop an image or choose an option below',
    'home.upload.takePhoto': 'Take a photo',
    'home.upload.chooseImage': 'Choose an image',
    'home.upload.retakePhoto': 'Retake photo',
    'home.upload.changeImage': 'Change image',
    'home.upload.formats': 'Supported formats: JPG, PNG, WebP (max 5MB, will be compressed automatically)',
    'home.upload.mobileTip': 'On mobile: "Take a photo" opens the camera',
    
    // Ingredient Detection
    'ingredients.analyzing': 'Analyzing your image...',
    'ingredients.analyzing.subtitle': 'ChatGPT AI analyzes your fridge to detect ingredients',
    'ingredients.detected': 'Ingredients detected in your fridge',
    'ingredients.detected.subtitle': 'ChatGPT AI identified {count} ingredient{plural} in your image',
    'ingredients.confidence': 'Only ingredients detected with high confidence are displayed',
    'ingredients.confidence.level': '{level}% confidence',
    'ingredients.demo.notice': 'Demo mode - Sample data used',
    
    // Recipe Generation
    'recipe.generating.simple': 'Generating your recipe...',
    'recipe.generating.expert': 'Expert Chef in action...',
    'recipe.generating.country': 'Specialized {country} chef...',
    'recipe.generating.subtitle.simple': 'ChefGPT creates a personalized recipe for you',
    'recipe.generating.subtitle.expert': 'The world\'s best chef creates an exceptional recipe',
    'recipe.generating.subtitle.country': 'Expert chef in {country} cuisine adapts your ingredients',
    
    // Recipe Display
    'recipe.servings': 'servings',
    'recipe.difficulty': 'Difficulty',
    'recipe.prepTime': 'Prep',
    'recipe.cookTime': 'Cook',
    'recipe.totalTime': 'Total',
    'recipe.ingredients': 'Required ingredients',
    'recipe.instructions': 'Instructions',
    'recipe.nutrition': 'Nutritional values',
    'recipe.save': 'Save',
    'recipe.newPhoto': 'New photo',
    'recipe.update': 'Update recipe',
    
    // Settings
    'settings.title': 'Settings',
    'settings.cuisine.title': 'Cuisine types',
    'settings.cuisine.subtitle': 'Select your preferred cuisine types (Simple mode only)',
    'settings.diet.title': 'Diet',
    'settings.diet.subtitle': 'Choose your main diet',
    'settings.allergies.title': 'Allergies and intolerances',
    'settings.allergies.subtitle': 'Indicate your allergies to avoid these ingredients in your recipes',
    'settings.cooking.title': 'Cooking preferences',
    'settings.difficulty.title': 'Difficulty level',
    'settings.prepTime.title': 'Maximum prep time (minutes)',
    'settings.cookTime.title': 'Maximum cook time (minutes)',
    'settings.chef.title': 'AI Chef Mode',
    'settings.chef.subtitle': 'Choose how the AI chef should create your recipes',
    'settings.chef.simple': 'Simple',
    'settings.chef.simple.desc': 'Basic and easy recipes',
    'settings.chef.expert': 'Expert',
    'settings.chef.expert.desc': 'World\'s best chef',
    'settings.chef.country': 'World Cuisine',
    'settings.chef.country.desc': 'Country specialist',
    'settings.chef.country.select': 'Preferred cuisine',
    'settings.autoUpdate.title': 'Automatic update',
    'settings.autoUpdate.subtitle': 'Recipes update automatically when you change settings',
    'settings.save': 'Save',
    'settings.cancel': 'Cancel',
    
    // Chef Mode Explanations
    'chef.simple.explanation': 'You can choose the cuisine types you prefer. The chef will create basic recipes according to your preferences.',
    'chef.expert.explanation': 'The world\'s best chef automatically decides the optimal cuisine style for your ingredients. No cuisine selection needed.',
    'chef.country.explanation': 'Choose a country and the expert chef of that cuisine will create authentic recipes. No general cuisine selection needed.',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.retry': 'Retry',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.reset': 'Reset',
    'common.close': 'Close',
    'common.back': 'Back',
    'common.continue': 'Continue',
    'common.generate': 'Generate',
    'common.add': 'Add',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.confirm': 'Confirm',
    'common.yes': 'Yes',
    'common.no': 'No',
    
    // Cuisine Preferences
    'preferences.title': 'Customize your recipes',
    'preferences.subtitle': 'Tell us your preferences for perfect suggestions',
    'preferences.ingredients.detected': 'Detected ingredients:',
    'preferences.ingredients.add': 'Add your ingredients:',
    'preferences.ingredients.empty': 'No ingredients added yet',
    'preferences.ingredients.empty.subtitle': 'Use the field below to add your ingredients',
    'preferences.ingredients.add.placeholder': 'Add an ingredient...',
    'preferences.chef.title': 'Chef Mode',
    'preferences.chef.simple': 'Simple',
    'preferences.chef.simple.desc': 'Easy and quick recipes',
    'preferences.chef.expert': 'Expert',
    'preferences.chef.expert.desc': 'Best recipes in the world',
    'preferences.chef.country': 'Specific Country',
    'preferences.chef.country.desc': 'Country specialist',
    'preferences.country.select': 'Select a country',
    'preferences.country.search': 'Search for a country...',
    'preferences.country.found': 'country found',
    'preferences.country.found.plural': 'countries found',
    'preferences.country.none': 'No countries found',
    'preferences.time.title': 'Cooking Time',
    'preferences.time.prep': 'Preparation time',
    'preferences.time.cook': 'Cooking time',
    'preferences.time.total': 'Total maximum time',
    'preferences.time.minutes': 'minutes',
    'preferences.difficulty.title': 'Difficulty level',
    'preferences.difficulty.easy': 'Easy',
    'preferences.difficulty.easy.desc': 'Simple and quick recipes',
    'preferences.difficulty.medium': 'Medium',
    'preferences.difficulty.medium.desc': 'Recipes with some techniques',
    'preferences.difficulty.hard': 'Hard',
    'preferences.difficulty.hard.desc': 'Complex and technical recipes',
    'preferences.diet.title': 'Diet',
    'preferences.diet.omnivore': 'Omnivore',
    'preferences.diet.vegetarian': 'Vegetarian',
    'preferences.diet.vegan': 'Vegan',
    'preferences.diet.pescatarian': 'Pescatarian',
    'preferences.diet.paleo': 'Paleo',
    'preferences.diet.keto': 'Keto',
    'preferences.diet.gluten-free': 'Gluten-free',
    'preferences.diet.halal': 'Halal',
    'preferences.diet.kosher': 'Kosher',
    'preferences.diet.low-carb': 'Low-carb',
    'preferences.diet.lactose-free': 'Lactose-free',
    'preferences.allergies.title': 'Allergies and intolerances',
    'preferences.allergies.gluten': 'Gluten',
    'preferences.allergies.lactose': 'Lactose',
    'preferences.allergies.nuts': 'Nuts',
    'preferences.allergies.peanuts': 'Peanuts',
    'preferences.allergies.eggs': 'Eggs',
    'preferences.allergies.fish': 'Fish',
    'preferences.allergies.shellfish': 'Shellfish',
    'preferences.allergies.soy': 'Soy',
    'preferences.allergies.sesame': 'Sesame',
    'preferences.allergies.mustard': 'Mustard',
    'preferences.allergies.celery': 'Celery',
    'preferences.allergies.sulfites': 'Sulfites',
    'preferences.actions.back': 'Back',
    'preferences.actions.generate': 'Generate suggestions',
    'preferences.errors.country.required': 'Please select a country to continue',
    
    // Image Upload
    'upload.drag.title': 'Drag and drop your image here',
    'upload.formats': 'Supported formats: JPG, PNG, WebP (max 10MB)',
    'upload.optimized': '✨ Automatically optimized quality for better detection',
    'upload.skip.title': 'Or add your ingredients manually',
    'upload.skip.button': 'Add ingredients manually →',
    'upload.ready': 'Image ready for analysis',
    
    // Recipe Generator
    'recipe.title': 'Generate personalized recipes',
    'recipe.subtitle': 'Based on your detected ingredients and preferences',
    'recipe.mode': 'Mode',
    'recipe.mode.expert': 'Expert',
    'recipe.mode.country': 'Country',
    'recipe.mode.simple': 'Simple',
    'recipe.time': 'Time',
    'recipe.diet': 'Diet',
    'recipe.generate.button': 'Generate suggestions',
    'recipe.generating': 'Generating...',
    
    // Ingredient Detection
    'detection.analyzing': 'Analyzing your image...',
    'detection.analyzing.subtitle': 'ChatGPT AI analyzes your fridge to detect ingredients',
    'detection.error.title': 'Analysis error',
    'detection.error.api': 'ChatGPT API Unavailable',
    'detection.error.retry': 'Retry',
    'detection.api.info': 'Important information',
    'detection.api.limit': 'ChatGPT API has reached its request limit. Please try again later.',
    
    // Dashboard
    'dashboard.title': 'My Dashboard',
    'dashboard.subtitle': 'Manage your saved recipes, preferences and personal statistics',
    'dashboard.overview': 'Overview',
    'dashboard.recipes': 'My Recipes',
    'dashboard.preferences': 'Preferences',
    'dashboard.savedRecipes': 'Saved Recipes',
    'dashboard.favorites': 'Favorites',
    'dashboard.chefMode': 'Chef Mode',
    'dashboard.simple': 'Simple',
    'dashboard.subscriptionStatus': 'Subscription Status',
    'dashboard.noActiveSubscription': 'No active subscription',
    'dashboard.upgradeToPro': 'Upgrade to CookLens Pro to unlock all features',
    'dashboard.subscribe': 'Subscribe',
    'dashboard.recentRecipes': 'Recent recipes',
    'dashboard.noSavedRecipes': 'No saved recipes',
    'dashboard.signOut': 'Sign Out',
    
    // Cooking Time
    'cookingTime.title': 'Cooking Time',
    'cookingTime.prepTime': 'Prep Time',
    'cookingTime.cookTime': 'Cook Time',
    'cookingTime.totalMax': 'Total maximum time: {minutes} minutes',
    'cookingTime.minutes': '{minutes} min',
    
    // Difficulty Level
    'difficulty.title': 'Difficulty Level',
    'difficulty.easy': 'Easy',
    'difficulty.easy.desc': 'Simple and quick recipes',
    'difficulty.medium': 'Medium',
    'difficulty.medium.desc': 'Recipes with some techniques',
    'difficulty.hard': 'Hard',
    'difficulty.hard.desc': 'Complex and technical recipes',
    
    // Navigation
    'nav.backToPreferences': 'Back to preferences',
    
    // Features
    'features.smartPhoto': 'Smart Photo',
    'features.smartPhoto.desc': 'Automatic ingredient detection in your fridge',
    'features.aiRecipes': 'AI Recipes',
    'features.aiRecipes.desc': 'Personalized recipe generation with ChefGPT',
    'features.advancedFilters': 'Advanced Filters',
    'features.advancedFilters.desc': 'Cuisine, diet and preferences',
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en')

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('cooklens-language') as Language
    if (savedLanguage && (savedLanguage === 'fr' || savedLanguage === 'en')) {
      setLanguage(savedLanguage)
    }
  }, [])

  // Save language to localStorage when it changes
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('cooklens-language', lang)
  }

  // Translation function with variable support
  const t = (key: string, variables?: Record<string, string | number>): string => {
    let translation = translations[language][key as keyof typeof translations[typeof language]] || key
    
    // Replace variables in translation
    if (variables) {
      Object.entries(variables).forEach(([varKey, varValue]) => {
        translation = translation.replace(`{${varKey}}`, String(varValue))
      })
    }
    
    return translation
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
