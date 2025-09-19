# Configuration Supabase pour la synchronisation des données

## Étapes de configuration

### 1. Créer un compte Supabase
1. Allez sur [supabase.com](https://supabase.com)
2. Créez un compte ou connectez-vous
3. Créez un nouveau projet

### 2. Configurer la base de données
1. Dans votre projet Supabase, allez dans l'onglet "SQL Editor"
2. Copiez et exécutez le contenu du fichier `supabase-schema.sql`
3. Cela créera les tables `user_recipes` et `user_preferences`

### 3. Obtenir les clés API
1. Dans votre projet Supabase, allez dans "Settings" > "API"
2. Copiez l'URL du projet (ex: `https://xxxxx.supabase.co`)
3. Copiez la clé publique anon (ex: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### 4. Configurer les variables d'environnement
Ajoutez ces variables à votre fichier `.env.local`:

```bash
# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_publique_anon
```

### 5. Configurer l'authentification Supabase (optionnel)
Si vous voulez utiliser l'authentification Supabase au lieu de Clerk:
1. Allez dans "Authentication" > "Settings"
2. Configurez les providers d'authentification
3. Ajoutez votre domaine localhost dans "Site URL"

### 6. Tester la configuration
1. Redémarrez votre serveur de développement
2. Connectez-vous avec votre compte Clerk
3. Créez une recette et vérifiez qu'elle apparaît dans la base de données Supabase

## Structure de la base de données

### Table `user_recipes`
- `id`: UUID unique
- `user_id`: ID de l'utilisateur Clerk
- `title`: Titre de la recette
- `description`: Description
- `ingredients`: Array des ingrédients
- `instructions`: Array des instructions
- `prep_time`: Temps de préparation (minutes)
- `cook_time`: Temps de cuisson (minutes)
- `servings`: Nombre de portions
- `difficulty`: Difficulté (easy/medium/hard)
- `cuisine`: Type de cuisine
- `tags`: Tags de la recette
- `image_url`: URL de l'image
- `is_favorite`: Si c'est un favori
- `created_at`: Date de création
- `updated_at`: Date de mise à jour

### Table `user_preferences`
- `id`: UUID unique
- `user_id`: ID de l'utilisateur Clerk
- `cuisine`: Types de cuisine préférés
- `diet`: Régimes alimentaires
- `allergies`: Allergies
- `max_prep_time`: Temps max de préparation
- `max_cook_time`: Temps max de cuisson
- `difficulty`: Niveaux de difficulté préférés
- `chef_mode`: Mode chef préféré
- `selected_country`: Pays sélectionné
- `auto_update_recipe`: Mise à jour automatique
- `created_at`: Date de création
- `updated_at`: Date de mise à jour

## Sécurité
- Row Level Security (RLS) est activé
- Les utilisateurs ne peuvent accéder qu'à leurs propres données
- Les politiques de sécurité sont configurées automatiquement
