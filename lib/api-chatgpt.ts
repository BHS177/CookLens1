import { DetectedIngredient, Recipe, UserPreferences, RecipeSuggestion, RecipeRequest } from '@/types'

// OpenAI Vision API Configuration (using GPT-4V for image analysis)
const OPENAI_VISION_MODEL = 'gpt-4-vision-preview'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

// Demo ingredients for fallback - only when API completely fails
function getDemoIngredients(): DetectedIngredient[] {
  return [
    {
      name: 'Tomate',
      confidence: 0.95,
      category: 'vegetable',
      boundingBox: { x: 100, y: 100, width: 50, height: 50 }
    },
    {
      name: 'Oignon',
      confidence: 0.90,
      category: 'vegetable',
      boundingBox: { x: 200, y: 150, width: 40, height: 40 }
    },
    {
      name: 'Ail',
      confidence: 0.85,
      category: 'vegetable',
      boundingBox: { x: 300, y: 200, width: 30, height: 30 }
    }
  ]
}

// Image optimization for better ChatGPT Vision detection
async function optimizeImageForDetection(imageUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'))
        return
      }
      
      // Set canvas size to optimal dimensions for ChatGPT Vision
      const maxWidth = 1024
      const maxHeight = 1024
      
      let { width, height } = img
      
      // Calculate new dimensions maintaining aspect ratio
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
      }
      
      canvas.width = width
      canvas.height = height
      
      // Draw image with high quality settings
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, width, height)
      
      // Convert to base64 with high quality
      const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.9)
      resolve(optimizedDataUrl)
    }
    
    img.onerror = () => {
      reject(new Error('Failed to load image for optimization'))
    }
    
    img.src = imageUrl
  })
}

// Convert base64 to blob for API upload
function base64ToBlob(base64: string): Blob {
  const arr = base64.split(',')
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg'
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  
  return new Blob([u8arr], { type: mime })
}

// ChatGPT Vision API function (primary method)
async function detectIngredientsWithChatGPT(imageUrl: string): Promise<DetectedIngredient[]> {
  console.log('🤖 Starting ChatGPT Vision API detection...')
  
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured')
  }

  try {
    console.log('🚀 Sending request to ChatGPT Vision API...')
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OPENAI_VISION_MODEL,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this fridge image and identify ALL the food ingredients and products you can see. Be very specific and comprehensive. Return ONLY a JSON array of ingredient names in this exact format: ["ingredient1", "ingredient2", "ingredient3"]. Include everything edible you can identify - fruits, vegetables, meats, dairy, grains, spices, beverages, etc. Be precise with names (e.g., "red bell pepper" not just "pepper", "cheddar cheese" not just "cheese").'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.1
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ ChatGPT Vision API error:', response.status, errorText)
      throw new Error(`ChatGPT Vision API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    const content = data.choices[0].message.content.trim()
    
    console.log('✅ ChatGPT Vision API success!')
    console.log('📊 Raw response:', content)
    
    // Parse JSON response
    let ingredientNames: string[] = []
    
    try {
      // Try to extract JSON array from the response
      const jsonMatch = content.match(/\[.*\]/s)
      if (jsonMatch) {
        ingredientNames = JSON.parse(jsonMatch[0])
      } else {
        // Fallback: try to parse the entire content as JSON
        ingredientNames = JSON.parse(content)
      }
    } catch (parseError) {
      console.error('❌ Failed to parse ChatGPT response as JSON:', parseError)
      console.log('📝 Raw content:', content)
      
      // Fallback: extract ingredient names using regex
      const lines = content.split('\n')
      ingredientNames = lines
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^[-•*]\s*/, '').replace(/['"]/g, '').trim())
        .filter(name => name.length > 0)
    }
    
    console.log('📋 Parsed ingredients:', ingredientNames)
    
    // Convert to DetectedIngredient format
    const detectedIngredients: DetectedIngredient[] = ingredientNames.map((name, index) => ({
      name: name,
      confidence: 0.9 - (index * 0.05), // Decreasing confidence for each ingredient
      category: 'unknown', // ChatGPT doesn't provide categories
      boundingBox: {
        x: 50 + (index * 100),
        y: 50 + (index * 50),
        width: 80,
        height: 80
      }
    }))
    
    console.log('✅ Successfully detected ingredients:', detectedIngredients.length)
    return detectedIngredients
    
  } catch (error) {
    console.error('❌ ChatGPT Vision API failed:', error)
    console.log('🔄 Falling back to demo ingredients...')
    return getDemoIngredients()
  }
}

// Main detection function with fallback
export async function detectIngredients(imageUrl: string): Promise<DetectedIngredient[]> {
  try {
    // First try ChatGPT Vision API
    const ingredients = await detectIngredientsWithChatGPT(imageUrl)
    
    if (ingredients.length > 0) {
      return ingredients
    }
    
    // If no ingredients found, return demo ingredients
    console.log('⚠️ No ingredients detected, using demo ingredients')
    return getDemoIngredients()
    
  } catch (error) {
    console.error('❌ All detection methods failed:', error)
    console.log('🔄 Using demo ingredients as final fallback')
    return getDemoIngredients()
  }
}

// Recipe generation function
export async function generateRecipe(
  ingredients: DetectedIngredient[], 
  preferences: UserPreferences
): Promise<Recipe> {
  
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured')
  }

  const ingredientNames = ingredients.map(ing => ing.name).join(', ')
  
  const prompt = `Tu es un chef professionnel étoilé. Crée une recette délicieuse et authentique en utilisant UNIQUEMENT ces ingrédients: ${ingredientNames}.

Préférences utilisateur:
- Cuisine: ${preferences.cuisine || 'Française'}
- Régime: ${preferences.diet || 'Normal'}
- Allergies: ${preferences.allergies?.join(', ') || 'Aucune'}
- Difficulté: ${preferences.difficulty || 'Moyen'}

Répondez UNIQUEMENT au format JSON avec cette structure exacte:
{
  "title": "Nom de la recette (attractif et précis)",
  "description": "Description appétissante de 2-3 phrases avec techniques clés",
  "cuisine": "Type de cuisine authentique",
  "diet": "Type de régime alimentaire",
  "difficulty": "facile|moyen|difficile",
  "prepTime": 15,
  "cookTime": 30,
  "servings": 4,
  "ingredients": [
    {
      "name": "Nom exact de l'ingrédient",
      "amount": "Quantité précise",
      "unit": "Unité de mesure",
      "notes": "Conseils de préparation ou substitutions"
    }
  ],
  "instructions": [
    {
      "step": 1,
      "instruction": "Instruction détaillée avec techniques précises",
      "duration": 10,
      "temperature": "180°C",
      "technique": "Technique utilisée",
      "proTip": "Conseil de chef pour réussir"
    }
  ],
  "nutrition": {
    "calories": 250,
    "protein": 15,
    "carbs": 30,
    "fat": 8,
    "fiber": 5,
    "sugar": 10,
    "sodium": 400,
    "vitamins": "Vitamines principales",
    "minerals": "Minéraux principaux"
  },
  "tips": [
    "Conseil de préparation",
    "Astuce de cuisson",
    "Conseil de présentation"
  ],
  "variations": [
    "Variation 1 possible",
    "Variation 2 possible"
  ],
  "beveragePairing": {
    "primary": "Boisson principale suggérée",
    "alternatives": ["Alternative 1", "Alternative 2", "Alternative 3"],
    "temperature": "Température de service",
    "servingTips": "Conseils de service",
    "nonAlcoholic": "Alternative sans alcool",
    "universalSuggestions": [
      "Eau (Plate, Pétillante, Infusée)",
      "Jus (Orange, Pomme, Grenade, Citron)",
      "Thé (Vert, Noir, Herbal, Infusion)",
      "Café (Expresso, Américain, Cappuccino)",
      "Smoothie (Fruits, Légumes, Protéiné)",
      "Lait (Entier, Écrémé, Végétal)",
      "Soda (Gazeux, Artisanal, Sans sucre)",
      "Boisson chaude (Chocolat, Infusion, Tisane)",
      "Boisson fraîche (Limonade, Eau aromatisée)",
      "Boisson énergisante naturelle (Kombucha, Kéfir)"
    ]
  },
  "storage": "Conseils de conservation",
  "reheating": "Conseils de réchauffage"
}`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Vous êtes un chef expert. Répondez UNIQUEMENT avec du JSON valide, sans texte supplémentaire.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} - ${response.statusText}`)
    }

    const data = await response.json()
    const content = data.choices[0].message.content.trim()
    
    console.log('✅ ChatGPT recipe received:', content)
    
    // Parse JSON response
    const recipeData = JSON.parse(content)
    
    // Validate that all ingredients in the recipe are from the detected list
    const detectedIngredientNames = ingredients.map(ing => ing.name.toLowerCase())
    const recipeIngredients = recipeData.ingredients || []
    
    const validatedIngredients = recipeIngredients.filter((ing: any) => {
      const ingName = ing.name.toLowerCase()
      return detectedIngredientNames.some(detected => 
        ingName.includes(detected) || detected.includes(ingName)
      )
    })

    // Create the recipe object
    const recipe: Recipe = {
      id: `recipe-${Date.now()}`,
      title: recipeData.title,
      description: recipeData.description,
      cuisine: recipeData.cuisine,
      diet: recipeData.diet,
      difficulty: recipeData.difficulty,
      prepTime: recipeData.prepTime,
      cookTime: recipeData.cookTime,
      servings: recipeData.servings,
      ingredients: validatedIngredients,
      instructions: recipeData.instructions,
      nutrition: recipeData.nutrition,
      tips: recipeData.tips,
      variations: recipeData.variations,
      beveragePairing: recipeData.beveragePairing,
      storage: recipeData.storage,
      reheating: recipeData.reheating,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    console.log('✅ Recipe generated successfully:', recipe.title)
    return recipe

  } catch (error) {
    console.error('❌ Recipe generation failed:', error)
    throw new Error('Failed to generate recipe')
  }
}
