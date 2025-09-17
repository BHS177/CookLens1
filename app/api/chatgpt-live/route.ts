import { NextRequest, NextResponse } from 'next/server'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

export async function POST(request: NextRequest) {
  try {
    const { message, recipe, conversationHistory } = await request.json()

    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    // Construire le contexte de la recette
    const recipeContext = recipe ? `
CONTEXTE DE LA RECETTE:
- Titre: ${recipe.title}
- Cuisine: ${recipe.cuisine || 'Générale'}
- Difficulté: ${recipe.difficulty || 'Facile'}
- Portions: ${recipe.servings || 'N/A'}
- Temps de préparation: ${recipe.time?.prep_min || 'N/A'} minutes
- Temps de cuisson: ${recipe.time?.cook_min || 'N/A'} minutes
- Ingrédients: ${recipe.ingredients?.map((ing: any) => `${ing.name} (${ing.quantity} ${ing.unit})`).join(', ') || 'N/A'}
- Instructions: ${recipe.steps?.map((step: any) => `${step.n}. ${step.action}`).join(' ') || 'N/A'}
- Boisson complémentaire: ${recipe.boisson_complementaire || 'Aucune'}
` : ''

    // Construire l'historique de conversation
    const conversationContext = conversationHistory
      .slice(-10) // Garder seulement les 10 derniers messages
      .map((msg: any) => `${msg.type === 'user' ? 'Utilisateur' : 'Assistant'}: ${msg.content}`)
      .join('\n')

    const systemPrompt = `Tu es un chef professionnel et expert culinaire. Réponds directement aux questions de l'utilisateur de manière détaillée et professionnelle.

${recipeContext}

RÈGLES IMPORTANTES:
- Réponds en français de manière claire, professionnelle et détaillée
- Ne mentionne jamais "Test Recipe" ou des références génériques
- Sois informatif et complet (maximum 300 mots par réponse)
- Utilise le contexte de la recette pour donner des réponses précises
- Donne des conseils pratiques, des astuces de chef et des techniques professionnelles
- Pour les substitutions d'ingrédients, propose des alternatives réalistes avec explications
- Pour les techniques de cuisson, explique en détail avec les températures et temps
- Si la question n'est pas liée à la cuisine, redirige poliment vers des sujets culinaires
- Sois direct et évite les phrases d'introduction génériques

HISTORIQUE DE LA CONVERSATION:
${conversationContext}

Question de l'utilisateur: ${message}`

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
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
        stream: false
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('OpenAI API Error:', errorData)
      return NextResponse.json(
        { error: 'Erreur lors de la communication avec ChatGPT' },
        { status: 500 }
      )
    }

    const data = await response.json()
    const chatResponse = data.choices[0]?.message?.content || 'Désolé, je n\'ai pas pu générer de réponse.'

    return NextResponse.json({ response: chatResponse })

  } catch (error) {
    console.error('Erreur ChatGPT Live:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
