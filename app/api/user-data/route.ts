import { NextRequest, NextResponse } from 'next/server'
import { getUserData, saveRecipe, removeRecipe, isRecipeSaved, toggleFavorite, updatePreferences } from '@/lib/cloud-storage'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const userData = await getUserData(userId)
    return NextResponse.json(userData)
  } catch (error) {
    console.error('Error in GET /api/user-data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, userId, ...data } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    let result = false

    switch (action) {
      case 'saveRecipe':
        result = await saveRecipe(userId, data.recipe)
        break
      case 'removeRecipe':
        result = await removeRecipe(userId, data.recipeId)
        break
      case 'isRecipeSaved':
        const isSaved = await isRecipeSaved(userId, data.recipeTitle)
        return NextResponse.json({ isSaved })
      case 'toggleFavorite':
        result = await toggleFavorite(userId, data.recipeId)
        break
      case 'updatePreferences':
        result = await updatePreferences(userId, data.preferences)
        break
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({ success: result })
  } catch (error) {
    console.error('Error in POST /api/user-data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
