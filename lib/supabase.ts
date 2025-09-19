import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export interface Database {
  public: {
    Tables: {
      user_recipes: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          ingredients: string[]
          instructions: string[]
          prep_time: number
          cook_time: number
          servings: number
          difficulty: 'easy' | 'medium' | 'hard'
          cuisine: string
          tags: string[]
          image_url: string | null
          is_favorite: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          ingredients: string[]
          instructions: string[]
          prep_time: number
          cook_time: number
          servings: number
          difficulty: 'easy' | 'medium' | 'hard'
          cuisine: string
          tags: string[]
          image_url?: string | null
          is_favorite?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          ingredients?: string[]
          instructions?: string[]
          prep_time?: number
          cook_time?: number
          servings?: number
          difficulty?: 'easy' | 'medium' | 'hard'
          cuisine?: string
          tags?: string[]
          image_url?: string | null
          is_favorite?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          cuisine: string[]
          diet: string[]
          allergies: string[]
          max_prep_time: number
          max_cook_time: number
          difficulty: string[]
          chef_mode: string
          selected_country: string | null
          auto_update_recipe: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          cuisine: string[]
          diet: string[]
          allergies: string[]
          max_prep_time: number
          max_cook_time: number
          difficulty: string[]
          chef_mode: string
          selected_country?: string | null
          auto_update_recipe?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          cuisine?: string[]
          diet?: string[]
          allergies?: string[]
          max_prep_time?: number
          max_cook_time?: number
          difficulty?: string[]
          chef_mode?: string
          selected_country?: string | null
          auto_update_recipe?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
