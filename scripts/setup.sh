#!/bin/bash

echo "🍳 Configuration de Fridge AI..."

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez installer Node.js 18+ d'abord."
    exit 1
fi

# Vérifier la version de Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ requis. Version actuelle: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) détecté"

# Installer les dépendances
echo "📦 Installation des dépendances..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de l'installation des dépendances"
    exit 1
fi

echo "✅ Dépendances installées"

# Créer le fichier .env.local s'il n'existe pas
if [ ! -f .env.local ]; then
    echo "📝 Création du fichier .env.local..."
    cp env.example .env.local
    echo "✅ Fichier .env.local créé"
    echo "⚠️  N'oubliez pas de configurer vos clés API dans .env.local"
else
    echo "✅ Fichier .env.local existe déjà"
fi

echo ""
echo "🎉 Configuration terminée !"
echo ""
echo "Prochaines étapes :"
echo "1. Configurez vos clés API dans .env.local"
echo "2. Lancez le serveur avec : npm run dev"
echo "3. Ouvrez http://localhost:3000 dans votre navigateur"
echo ""
echo "Bon développement ! 🚀"

