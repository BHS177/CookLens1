# 🚀 Guide de Déploiement - Fridge AI

Ce guide vous accompagne pour déployer l'application Fridge AI sur Vercel.

## 📋 Prérequis

- Compte GitHub
- Compte Vercel
- Clés API LogMeal et ChefGPT

## 🔑 Configuration des APIs

### 1. LogMeal API
1. Visitez [LogMeal](https://logmeal.es/)
2. Créez un compte et obtenez votre token API
3. Notez l'URL de l'API : `https://api.logmeal.es/v2/image/segmentation/complete`

### 2. ChefGPT API
1. Visitez [ChefGPT](https://chefgpt.com/)
2. Créez un compte et obtenez votre clé API
3. Notez l'URL de l'API : `https://api.chefgpt.com/v1/recipes`

## 🌐 Déploiement sur Vercel

### Méthode 1 : Via l'interface Vercel (Recommandée)

1. **Préparez votre repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/votre-username/fridge-ai.git
   git push -u origin main
   ```

2. **Connectez Vercel à GitHub**
   - Allez sur [vercel.com](https://vercel.com)
   - Cliquez sur "New Project"
   - Importez votre repository GitHub

3. **Configurez les variables d'environnement**
   - Dans le dashboard Vercel, allez dans Settings > Environment Variables
   - Ajoutez les variables suivantes :
     ```
     LOGMEAL_API_TOKEN=votre_token_logmeal
     CHEFGPT_API_KEY=votre_cle_chefgpt
     NEXT_PUBLIC_LOGMEAL_API_URL=https://api.logmeal.es/v2/image/segmentation/complete
     NEXT_PUBLIC_CHEFGPT_API_URL=https://api.chefgpt.com/v1/recipes
     NEXT_PUBLIC_APP_URL=https://votre-app.vercel.app
     ```

4. **Déployez**
   - Cliquez sur "Deploy"
   - Attendez la fin du déploiement
   - Votre app sera disponible à l'URL fournie

### Méthode 2 : Via Vercel CLI

1. **Installez Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Connectez-vous à Vercel**
   ```bash
   vercel login
   ```

3. **Déployez**
   ```bash
   vercel
   ```

4. **Configurez les variables d'environnement**
   ```bash
   vercel env add LOGMEAL_API_TOKEN
   vercel env add CHEFGPT_API_KEY
   vercel env add NEXT_PUBLIC_LOGMEAL_API_URL
   vercel env add NEXT_PUBLIC_CHEFGPT_API_URL
   vercel env add NEXT_PUBLIC_APP_URL
   ```

5. **Redéployez avec les variables**
   ```bash
   vercel --prod
   ```

## 🔧 Configuration Post-Déploiement

### 1. Vérifiez les variables d'environnement
- Allez dans Settings > Environment Variables
- Vérifiez que toutes les variables sont correctement configurées

### 2. Testez l'application
- Uploadez une image de test
- Vérifiez que la détection d'ingrédients fonctionne
- Testez la génération de recettes

### 3. Configurez le domaine personnalisé (optionnel)
- Allez dans Settings > Domains
- Ajoutez votre domaine personnalisé
- Configurez les DNS selon les instructions

## 🐛 Dépannage

### Erreur de build
- Vérifiez que toutes les dépendances sont dans `package.json`
- Vérifiez la configuration TypeScript
- Consultez les logs de build dans Vercel

### Erreur d'API
- Vérifiez que les clés API sont correctes
- Vérifiez que les URLs d'API sont accessibles
- Consultez les logs de fonction dans Vercel

### Erreur de déploiement
- Vérifiez que le repository GitHub est public
- Vérifiez que Vercel a accès au repository
- Vérifiez la configuration `vercel.json`

## 📊 Monitoring

### 1. Analytics Vercel
- Consultez les métriques de performance
- Surveillez les erreurs
- Analysez l'utilisation

### 2. Logs
- Consultez les logs de fonction
- Surveillez les erreurs d'API
- Analysez les performances

## 🔄 Mises à jour

### Déploiement automatique
- Chaque push sur la branche `main` déclenche un déploiement
- Les pull requests créent des previews

### Déploiement manuel
```bash
vercel --prod
```

## 🛡️ Sécurité

### Variables d'environnement
- Ne jamais commiter les clés API
- Utiliser les variables d'environnement Vercel
- Limiter l'accès aux clés API

### Headers de sécurité
- Configuration dans `vercel.json`
- Headers de sécurité automatiques
- Protection CSRF

## 📈 Optimisations

### Performance
- Images optimisées avec Next.js
- Lazy loading des composants
- Compression automatique

### SEO
- Métadonnées optimisées
- Sitemap automatique
- Robots.txt configuré

## 🆘 Support

En cas de problème :
1. Consultez les logs Vercel
2. Vérifiez la configuration des APIs
3. Testez en local d'abord
4. Consultez la documentation Vercel

## 🎉 Félicitations !

Votre application Fridge AI est maintenant déployée et accessible au monde entier !

### Prochaines étapes
- Configurez un domaine personnalisé
- Ajoutez des analytics
- Optimisez les performances
- Ajoutez de nouvelles fonctionnalités

