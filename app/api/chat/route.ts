import { NextRequest, NextResponse } from 'next/server'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

export async function POST(request: NextRequest) {
  try {
    const { message, recipe } = await request.json()

    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    const prompt = `Tu es un assistant culinaire expert et personnel. L'utilisateur te pose des questions sur cette recette spécifique :

RECETTE:
- Titre: ${recipe.title}
- Cuisine: ${recipe.cuisine}
- Difficulté: ${recipe.difficulty}
- Ingrédients: ${recipe.ingredients.map((ing: any) => `${ing.name} (${ing.amount} ${ing.unit})`).join(', ')}
- Instructions: ${recipe.instructions.map((inst: any) => `${inst.step}. ${inst.instruction}`).join(' ')}
- Nutrition (par portion): ${recipe.nutrition.calories} kcal, ${recipe.nutrition.protein}g protéines, ${recipe.nutrition.carbs}g glucides, ${recipe.nutrition.fat}g lipides

QUESTION DE L'UTILISATEUR: ${message}

RÉPONSE ATTENDUE:
- Réponds de manière personnalisée et détaillée
- Utilise les informations de la recette pour donner des conseils précis
- Sois professionnel mais accessible
- Donne des conseils pratiques et des astuces
- Si la question concerne des substitutions, propose des alternatives réalistes
- Si c'est une question technique, explique clairement les méthodes
- Reste dans le contexte de cette recette spécifique

Réponds en français, de manière concise mais complète.`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: prompt
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const assistantMessage = data.choices[0]?.message?.content || 'Désolé, je n\'ai pas pu générer de réponse.'

    return NextResponse.json({ message: assistantMessage })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    )
  }
}
