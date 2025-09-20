import { NextRequest, NextResponse } from 'next/server'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 ChatGPT Live API called')
    const { message, recipe, conversationHistory } = await request.json()
    
    console.log('📝 Message:', message)
    console.log('🍳 Recipe:', recipe)
    console.log('💬 History length:', conversationHistory?.length || 0)

    if (!OPENAI_API_KEY) {
      console.error('❌ OpenAI API key not configured')
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }
    
    console.log('✅ OpenAI API key found')

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
- Accords mets-boissons: ${recipe.beveragePairing ? JSON.stringify(recipe.beveragePairing) : 'Non spécifiés'}
` : ''

    // Construire l'historique de conversation
    const conversationContext = conversationHistory
      .slice(-10) // Garder seulement les 10 derniers messages
      .map((msg: any) => `${msg.type === 'user' ? 'Utilisateur' : 'Assistant'}: ${msg.content}`)
      .join('\n')

    const systemPrompt = `Tu es un chef professionnel étoilé et expert culinaire avec une expertise authentique des cuisines du monde. Tu réponds directement aux questions avec précision, authenticité et passion culinaire.

${recipeContext}

🎯 MISSION: Fournir des conseils culinaires de niveau professionnel, précis et scientifiquement exacts.

RÈGLES CRITIQUES POUR UN CHEF PROFESSIONNEL:
- Réponds UNIQUEMENT à la question posée, sans dépasser 300 mots
- Sois 100% précis et authentique dans tes informations culinaires
- Ne mélange JAMAIS les cuisines (ex: ras el hanout = marocain, pas tunisien)
- Utilise des techniques et ingrédients VRAIS et CONCRETS
- Donne des températures, temps et quantités EXACTS
- Évite toute information erronée ou approximative
- Sois direct, sans phrases d'introduction génériques
- Ne mentionne jamais "Test Recipe" ou des références vagues

🌍 AUTHENTICITÉ CULINAIRE ABSOLUE:
- Tunisien: harissa, coriandre, carvi, menthe, citron confit, techniques de tajine
- Marocain: ras el hanout, safran, cannelle, gingembre, couscous traditionnel
- Algérien: cumin, paprika, fenouil, anis étoilé, techniques de braisage
- Libanais: zaatar, sumac, cardamome, piment d'Alep, mezze traditionnels
- Français: techniques classiques, sauces mères, cuisson sous-vide
- Italien: techniques de pâtes fraîches, risotto, osso buco
- Utilise les VRAIS noms d'ingrédients et techniques de chaque région

🍳 TECHNIQUES DE CHEF PROFESSIONNEL:
- Températures précises (ex: 180°C, pas "feu moyen")
- Temps exacts (ex: 15 minutes, pas "quelques minutes")
- Quantités précises (ex: 2 c.à.s, pas "un peu")
- Techniques authentiques de chaque cuisine
- Ordre de préparation logique et professionnel
- Conseils de maîtrise pour chaque technique

📊 PRÉCISION NUTRITIONNELLE:
- Valeurs nutritionnelles scientifiquement exactes
- Calculs basés sur les quantités précises
- Données nutritionnelles officielles (USDA, ANSES)
- Conseils diététiques professionnels

🍷 EXPERTISE EN ACCORDS METS-BOISSONS:
- Accords parfaits entre plats et boissons
- Températures de service optimales
- Conseils de sommelier professionnel
- Alternatives sans alcool de qualité
- Harmonie des saveurs et textures
- Conseils de dégustation et service
- Suggestions universelles (eau, jus, thé, café, smoothies, boissons chaudes)

RÈGLES DE NARRATION POUR VOICEOVER:
- Termine chaque phrase par une virgule (,) pour créer des pauses naturelles
- Utilise des points-virgules (;) pour séparer les idées liées
- Ajoute des points d'exclamation (!) pour l'enthousiasme culinaire
- Utilise des points d'interrogation (?) pour les questions
- Termine seulement le dernier paragraphe par un point final (.)
- Structure tes réponses avec des pauses logiques pour une narration fluide
- Évite les listes à puces, utilise plutôt des phrases complètes séparées par des virgules

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
        max_tokens: 600,
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
    
    console.log('✅ OpenAI response received:', chatResponse.substring(0, 100) + '...')
    console.log('📤 Sending response to client')

    return NextResponse.json({ response: chatResponse })

  } catch (error) {
    console.error('Erreur ChatGPT Live:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
