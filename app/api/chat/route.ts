import { NextRequest, NextResponse } from 'next/server'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

export async function POST(request: NextRequest) {
  try {
    const { message, recipeTitle, context } = await request.json()

    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { message: 'API key not configured' },
        { status: 500 }
      )
    }

    const systemPrompt = `Tu es un assistant chef expert et un nutritionniste certifié. Tu aides l'utilisateur en temps réel pendant qu'il prépare la recette "${recipeTitle}".

RÈGLES IMPORTANTES:
- Réponds de manière concise et pratique (max 2-3 phrases)
- Donne des conseils concrets et des astuces de chef
- Sois encourageant et motivant
- Aide avec les techniques de cuisson, les substitutions d'ingrédients, les ajustements de goût
- Réponds en français, de manière naturelle et conversationnelle
- Si l'utilisateur a un problème, propose des solutions immédiates

CONTEXTE: ${context}
RECETTE: ${recipeTitle}

Réponds comme si tu étais un chef professionnel à ses côtés dans la cuisine.`

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
            content: systemPrompt
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const assistantMessage = data.choices[0]?.message?.content || 'Désolé, je ne peux pas répondre pour le moment.'

    return NextResponse.json({
      message: assistantMessage
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { message: 'Erreur lors de la communication avec l\'assistant' },
      { status: 500 }
    )
  }
}
