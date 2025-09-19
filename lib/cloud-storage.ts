import { supabase } from './supabase'
import { SavedRecipe, UserPreferences } from '@/types'
import { v4 as uuidv4 } from 'uuid'

const DEFAULT_PREFERENCES: UserPreferences = {
  cuisine: [],
  diet: [],
  allergies: [],
  maxPrepTime: 60,
  maxCookTime: 60,
  difficulty: [],
  chefMode: 'simple',
  selectedCountry: null,
  autoUpdateRecipe: true,
}

// Convert SavedRecipe to database format
const recipeToDbFormat = (recipe: Omit<SavedRecipe, 'id' | 'likedAt'>) => ({
  title: recipe.title,
  description: recipe.description,
  ingredients: recipe.ingredients,
  instructions: recipe.instructions,
  prep_time: recipe.prepTime,
  cook_time: recipe.cookTime,
  servings: recipe.servings,
  difficulty: recipe.difficulty,
  cuisine: recipe.cuisine,
  tags: recipe.tags || [],
  image_url: recipe.imageUrl || null,
  is_favorite: recipe.isFavorite,
})

// Convert database format to SavedRecipe
const dbToRecipeFormat = (dbRecipe: any): SavedRecipe => ({
  id: dbRecipe.id,
  title: dbRecipe.title,
  description: dbRecipe.description,
  ingredients: dbRecipe.ingredients,
  instructions: dbRecipe.instructions,
  prepTime: dbRecipe.prep_time,
  cookTime: dbRecipe.cook_time,
  servings: dbRecipe.servings,
  difficulty: dbRecipe.difficulty,
  cuisine: dbRecipe.cuisine,
  tags: dbRecipe.tags || [],
  imageUrl: dbRecipe.image_url,
  isFavorite: dbRecipe.is_favorite,
  likedAt: dbRecipe.created_at,
  createdAt: dbRecipe.created_at,
  generatedBy: 'ai' as const
})

// Convert UserPreferences to database format
const preferencesToDbFormat = (preferences: UserPreferences) => ({
  cuisine: preferences.cuisine,
  diet: preferences.diet,
  allergies: preferences.allergies,
  max_prep_time: preferences.maxPrepTime,
  max_cook_time: preferences.maxCookTime,
  difficulty: preferences.difficulty,
  chef_mode: preferences.chefMode,
  selected_country: preferences.selectedCountry,
  auto_update_recipe: preferences.autoUpdateRecipe,
})

// Convert database format to UserPreferences
const dbToPreferencesFormat = (dbPreferences: any): UserPreferences => ({
  cuisine: dbPreferences.cuisine || [],
  diet: dbPreferences.diet || [],
  allergies: dbPreferences.allergies || [],
  maxPrepTime: dbPreferences.max_prep_time || 60,
  maxCookTime: dbPreferences.max_cook_time || 60,
  difficulty: dbPreferences.difficulty || [],
  chefMode: dbPreferences.chef_mode || 'simple',
  selectedCountry: dbPreferences.selected_country,
  autoUpdateRecipe: dbPreferences.auto_update_recipe ?? true,
})

export const getUserData = async (userId: string): Promise<{ savedRecipes: SavedRecipe[], preferences: UserPreferences, generatedRecipes: SavedRecipe[] }> => {
  try {
    // Get saved recipes
    const { data: recipes, error: recipesError } = await supabase
      .from('user_recipes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (recipesError) {
      console.error('Error fetching recipes:', recipesError)
      return { savedRecipes: [], preferences: DEFAULT_PREFERENCES, generatedRecipes: [] }
    }

    // Get user preferences
    const { data: preferences, error: preferencesError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (preferencesError && preferencesError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error fetching preferences:', preferencesError)
      return { 
        savedRecipes: recipes?.map(dbToRecipeFormat) || [], 
        preferences: DEFAULT_PREFERENCES, 
        generatedRecipes: [] 
      }
    }

    return {
      savedRecipes: recipes?.map(dbToRecipeFormat) || [],
      preferences: preferences ? dbToPreferencesFormat(preferences) : DEFAULT_PREFERENCES,
      generatedRecipes: [] // For now, we'll treat all recipes as saved recipes
    }
  } catch (error) {
    console.error('Error in getUserData:', error)
    return { savedRecipes: [], preferences: DEFAULT_PREFERENCES, generatedRecipes: [] }
  }
}

export const saveRecipe = async (userId: string, recipe: Omit<SavedRecipe, 'id' | 'likedAt'>): Promise<boolean> => {
  try {
    const recipeData = {
      id: uuidv4(),
      user_id: userId,
      ...recipeToDbFormat(recipe),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('user_recipes')
      .insert(recipeData)

    if (error) {
      console.error('Error saving recipe:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in saveRecipe:', error)
    return false
  }
}

export const removeRecipe = async (userId: string, recipeId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_recipes')
      .delete()
      .eq('id', recipeId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error removing recipe:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in removeRecipe:', error)
    return false
  }
}

export const isRecipeSaved = async (userId: string, recipeTitle: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('user_recipes')
      .select('id')
      .eq('user_id', userId)
      .eq('title', recipeTitle)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking if recipe is saved:', error)
      return false
    }

    return !!data
  } catch (error) {
    console.error('Error in isRecipeSaved:', error)
    return false
  }
}

export const toggleFavorite = async (userId: string, recipeId: string): Promise<boolean> => {
  try {
    // First get the current favorite status
    const { data: recipe, error: fetchError } = await supabase
      .from('user_recipes')
      .select('is_favorite')
      .eq('id', recipeId)
      .eq('user_id', userId)
      .single()

    if (fetchError) {
      console.error('Error fetching recipe for toggle:', fetchError)
      return false
    }

    // Toggle the favorite status
    const { error: updateError } = await supabase
      .from('user_recipes')
      .update({ 
        is_favorite: !recipe.is_favorite,
        updated_at: new Date().toISOString()
      })
      .eq('id', recipeId)
      .eq('user_id', userId)

    if (updateError) {
      console.error('Error toggling favorite:', updateError)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in toggleFavorite:', error)
    return false
  }
}

export const updatePreferences = async (userId: string, newPreferences: Partial<UserPreferences>): Promise<boolean> => {
  try {
    // First check if preferences exist
    const { data: existingPrefs, error: fetchError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    const preferencesData = {
      id: uuidv4(),
      user_id: userId,
      ...preferencesToDbFormat({ ...DEFAULT_PREFERENCES, ...newPreferences }),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    if (fetchError && fetchError.code === 'PGRST116') {
      // No preferences exist, create new ones
      const { error: insertError } = await supabase
        .from('user_preferences')
        .insert(preferencesData)

      if (insertError) {
        console.error('Error creating preferences:', insertError)
        return false
      }
    } else {
      // Update existing preferences
      const { error: updateError } = await supabase
        .from('user_preferences')
        .update({
          ...preferencesToDbFormat({ ...DEFAULT_PREFERENCES, ...newPreferences }),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (updateError) {
        console.error('Error updating preferences:', updateError)
        return false
      }
    }

    return true
  } catch (error) {
    console.error('Error in updatePreferences:', error)
    return false
  }
}

export const addGeneratedRecipe = async (userId: string, recipe: Omit<SavedRecipe, 'id' | 'likedAt'>): Promise<boolean> => {
  // For now, treat generated recipes the same as saved recipes
  return await saveRecipe(userId, recipe)
}
