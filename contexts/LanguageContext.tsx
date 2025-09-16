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
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('fr')

  // Charger la langue depuis localStorage au montage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('fridge-ai-language') as Language
    if (savedLanguage && (savedLanguage === 'fr' || savedLanguage === 'en')) {
      setLanguage(savedLanguage)
    }
  }, [])

  // Sauvegarder la langue dans localStorage quand elle change
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('fridge-ai-language', lang)
  }

  // Fonction de traduction avec support des variables
  const t = (key: string, variables?: Record<string, string | number>): string => {
    let translation = translations[language][key as keyof typeof translations[typeof language]] || key
    
    // Remplacer les variables dans la traduction
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
