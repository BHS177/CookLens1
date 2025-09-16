# 🚀 Guide de Démarrage Rapide - Fridge AI

## ⚡ Installation Express

### 1. Prérequis
- Node.js 18+ installé
- Compte LogMeal (optionnel pour la démo)
- Compte ChefGPT (optionnel pour la démo)

### 2. Installation
```bash
# Cloner le projet
git clone <votre-repo>
cd fridge-ai

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

### 3. Accès
Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 🎯 Utilisation

### Page d'accueil
1. **Uploadez une image** de votre frigo
2. **Attendez la détection** des ingrédients (mode démo avec données fictives)
3. **Générez une recette** personnalisée
4. **Consultez la recette** avec instructions et nutrition

### Page "Mes recettes"
- Consultez l'historique de vos recettes
- Filtrez par cuisine, difficulté, temps
- Marquez vos favoris
- Supprimez les recettes

### Page "Paramètres"
- Configurez vos préférences culinaires
- Choisissez les types de cuisine
- Définissez votre régime alimentaire
- Indiquez vos allergies

## 🔧 Configuration des APIs (Optionnel)

### Mode Démo
L'application fonctionne en mode démo avec des données fictives si les APIs ne sont pas configurées.

### Configuration LogMeal
1. Créez un compte sur [LogMeal](https://logmeal.es/)
2. Obtenez votre token API
3. Ajoutez dans `.env.local` :
```env
LOGMEAL_API_TOKEN=votre_token_ici
```

### Configuration ChefGPT
1. Créez un compte sur [ChefGPT](https://chefgpt.com/)
2. Obtenez votre clé API
3. Ajoutez dans `.env.local` :
```env
CHEFGPT_API_KEY=votre_cle_ici
```

## 🎨 Fonctionnalités

### ✨ Interface Moderne
- Design Apple minimaliste
- Animations fluides avec Framer Motion
- Interface responsive mobile-first
- Navigation intuitive

### 🤖 Intelligence Artificielle
- Détection automatique d'ingrédients
- Génération de recettes personnalisées
- Filtres intelligents par préférences
- Gestion des allergies et régimes

### 📱 Mobile-Friendly
- Interface optimisée pour mobile
- Upload d'images par glisser-déposer
- Navigation tactile fluide
- Performance optimisée

### 💾 Sauvegarde
- Historique des recettes
- Système de favoris
- Préférences utilisateur
- Stockage local sécurisé

## 🚀 Déploiement

### Vercel (Recommandé)
1. Connectez votre repo GitHub à Vercel
2. Configurez les variables d'environnement
3. Déployez automatiquement

### Autres plateformes
- Netlify
- Railway
- Heroku
- AWS Amplify

## 🛠️ Développement

### Scripts disponibles
```bash
npm run dev      # Serveur de développement
npm run build    # Build de production
npm run start    # Serveur de production
npm run lint     # Vérification ESLint
```

### Structure du projet
```
fridge-ai/
├── app/                 # Pages Next.js 14
├── components/          # Composants React
├── lib/                # Utilitaires et APIs
├── types/              # Types TypeScript
└── public/             # Assets statiques
```

## 🎯 Prochaines étapes

1. **Testez l'application** en mode démo
2. **Configurez les APIs** pour la production
3. **Personnalisez** selon vos besoins
4. **Déployez** sur votre plateforme préférée
5. **Partagez** avec vos utilisateurs !

## 🆘 Support

- Consultez le [README.md](README.md) pour plus de détails
- Voir [DEPLOYMENT.md](DEPLOYMENT.md) pour le déploiement
- Ouvrez une issue sur GitHub pour les problèmes

## 🎉 Félicitations !

Votre application Fridge AI est prête à l'emploi ! 

**Bon développement ! 🚀**

