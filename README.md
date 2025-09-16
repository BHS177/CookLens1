# Fridge AI 🍳

Une application React moderne avec Next.js 14 qui utilise l'IA pour détecter les ingrédients dans votre frigo et générer des recettes personnalisées.

## ✨ Fonctionnalités

- 📸 **Upload d'images** : Prenez une photo de votre frigo ou uploadez une image
- 🤖 **Détection d'ingrédients** : Utilise l'API LogMeal pour identifier automatiquement les ingrédients
- 👨‍🍳 **Génération de recettes** : ChefGPT crée des recettes personnalisées avec vos ingrédients
- 🎨 **Interface moderne** : Design Apple minimaliste avec TailwindCSS et Framer Motion
- 📱 **Mobile-friendly** : Interface responsive optimisée pour mobile
- ⚙️ **Filtres avancés** : Filtres par type de cuisine, régime alimentaire, allergies
- 💾 **Sauvegarde** : Historique des recettes avec favoris et notes
- 🌍 **Multilingue** : Interface en français

## 🚀 Technologies

- **Next.js 14** avec App Router
- **React 18** avec hooks et context
- **TypeScript** pour la sécurité des types
- **TailwindCSS** pour le styling
- **Framer Motion** pour les animations
- **Lucide React** pour les icônes

## 📦 Installation

1. **Cloner le repository**
   ```bash
   git clone <repository-url>
   cd fridge-ai
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement**
   ```bash
   cp env.example .env.local
   ```
   
   Puis éditer `.env.local` avec vos clés API :
   ```env
   # LogMeal API Configuration
   NEXT_PUBLIC_LOGMEAL_API_URL=https://api.logmeal.es/v2/image/segmentation/complete
   LOGMEAL_API_TOKEN=your_logmeal_api_token_here

   # ChefGPT API Configuration
   NEXT_PUBLIC_CHEFGPT_API_URL=https://api.chefgpt.com/v1/recipes
   CHEFGPT_API_KEY=your_chefgpt_api_key_here

   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```

5. **Ouvrir dans le navigateur**
   ```
   http://localhost:3000
   ```

## 🔧 Configuration des APIs

### LogMeal API
1. Créer un compte sur [LogMeal](https://logmeal.es/)
2. Obtenir votre token API
3. Ajouter le token dans `.env.local`

### ChefGPT API
1. Créer un compte sur [ChefGPT](https://chefgpt.com/)
2. Obtenir votre clé API
3. Ajouter la clé dans `.env.local`

## 🚀 Déploiement sur Vercel

1. **Installer Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Déployer**
   ```bash
   vercel
   ```

3. **Configurer les variables d'environnement**
   - Aller dans le dashboard Vercel
   - Sélectionner votre projet
   - Aller dans Settings > Environment Variables
   - Ajouter toutes les variables de `.env.local`

## 📱 Utilisation

1. **Page d'accueil** : Uploadez une photo de votre frigo
2. **Détection** : L'IA analyse et identifie les ingrédients
3. **Génération** : ChefGPT crée une recette personnalisée
4. **Affichage** : Consultez la recette avec instructions et nutrition
5. **Sauvegarde** : Sauvegardez vos recettes favorites
6. **Paramètres** : Personnalisez vos préférences culinaires

## 🎨 Design

L'application suit les principes de design Apple avec :
- Interface minimaliste et épurée
- Animations fluides avec Framer Motion
- Typographie claire et lisible
- Couleurs douces et apaisantes
- Navigation intuitive
- Responsive design

## 🔒 Sécurité

- Variables d'environnement pour les clés API
- Validation des types avec TypeScript
- Gestion d'erreurs robuste
- Pas de stockage de données sensibles côté client

## 📄 Structure du projet

```
fridge-ai/
├── app/                    # Pages Next.js 14 (App Router)
│   ├── globals.css        # Styles globaux
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx          # Page d'accueil
│   ├── recipes/          # Page des recettes
│   └── settings/         # Page des paramètres
├── components/            # Composants React
│   ├── ImageUpload.tsx   # Upload d'images
│   ├── IngredientDetection.tsx # Détection d'ingrédients
│   ├── RecipeGeneration.tsx    # Génération de recettes
│   ├── RecipeDisplay.tsx       # Affichage des recettes
│   ├── Navigation.tsx          # Navigation
│   └── Providers.tsx           # Context providers
├── lib/                   # Utilitaires
│   ├── api.ts            # Intégration APIs
│   └── utils.ts          # Fonctions utilitaires
├── types/                 # Types TypeScript
│   └── index.ts          # Définitions des types
└── public/               # Assets statiques
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🙏 Remerciements

- [LogMeal](https://logmeal.es/) pour l'API de détection d'ingrédients
- [ChefGPT](https://chefgpt.com/) pour l'API de génération de recettes
- [Next.js](https://nextjs.org/) pour le framework React
- [TailwindCSS](https://tailwindcss.com/) pour le styling
- [Framer Motion](https://www.framer.com/motion/) pour les animations

