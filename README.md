# Service d'Authentification

Ce service fournit une authentification complète via OAuth (GitHub, Google) avec stockage des utilisateurs dans MongoDB.

## Fonctionnalités

- 🔐 Authentification via GitHub et Google
- 🔄 Sessions persistantes avec cookies sécurisés
- 📊 Stockage des profils utilisateurs dans MongoDB
- 🛡️ Sécurité renforcée (headers, rate limiting, HTTPS en prod)
- 🌐 Compatible avec une architecture microservices

## Technologies utilisées

- Node.js & TypeScript
- Express.js
- Passport.js avec stratégies OAuth
- MongoDB (local ou Atlas)
- Mongoose

## Installation

1. Cloner le dépôt
```bash
git clone <url-du-repo>
cd authentication-service
```

2. Installer les dépendances
```bash
pnpm install
```

3. Configurer les variables d'environnement
```bash
cp .env.example .env
# Éditer le fichier .env avec vos propres valeurs
```

## Configuration

### Variables d'environnement

Le service nécessite les variables d'environnement suivantes dans le fichier `.env` :

```
# Server Configuration
PORT=3000
NODE_ENV=development

# Security
COOKIE_SECRET=your-secret-key-here

# Rate Limiting
RATE_LIMIT_WINDOW_MS=15
RATE_LIMIT_MAX=100

# OAuth Providers
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# URLs
CALLBACK_URL=http://localhost:3000/auth/callback
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/auth-service?retryWrites=true&w=majority
```

### OAuth Configuration

Pour utiliser l'authentification OAuth :

1. **GitHub**
   - Créer une OAuth App sur [GitHub Developer Settings](https://github.com/settings/developers)
   - URL de callback: `http://localhost:3000/auth/callback/github`

2. **Google**
   - Créer un projet et des identifiants OAuth sur [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - URI de redirection autorisés: `http://localhost:3000/auth/callback/google`

### Base de données

Le service utilise MongoDB pour stocker les profils utilisateurs :

- En développement: MongoDB local ou Atlas
- En production: MongoDB Atlas recommandé

## Démarrage

```bash
# Développement
pnpm dev

# Production
pnpm build
pnpm start
```

## Routes API

### Authentification

- `GET /auth/github` - Initier l'authentification GitHub
- `GET /auth/google` - Initier l'authentification Google
- `GET /auth/callback/github` - Callback pour GitHub
- `GET /auth/callback/google` - Callback pour Google
- `GET /auth/logout` - Déconnexion
- `GET /auth/status` - Vérifier l'état d'authentification

### Profil utilisateur

- `GET /profile` - Obtenir le profil de l'utilisateur connecté

## Structure du projet

```
├── src/
│   ├── config/             # Configuration (env, passport, database)
│   ├── controllers/        # Contrôleurs de routes
│   ├── middlewares/        # Middlewares (sécurité, erreurs)
│   ├── models/             # Modèles Mongoose
│   ├── routes/             # Définitions des routes
│   ├── utils/              # Utilitaires
│   └── index.ts            # Point d'entrée
├── .env                    # Variables d'environnement
└── package.json            # Dépendances et scripts
```

## Modèle utilisateur

Chaque utilisateur authentifié est stocké avec la structure suivante :

```typescript
interface IUser {
  id: string;          // ID fourni par le provider (GitHub, Google)
  provider: string;    // 'github' ou 'google'
  displayName: string; // Nom d'affichage
  email: string;       // Email
  avatar?: string;     // URL de l'avatar
  createdAt: Date;     // Date de création
  updatedAt: Date;     // Date de dernière mise à jour
}
```

## Sécurité

Le service implémente plusieurs mesures de sécurité :

- Headers de sécurité via Helmet
- Protection contre les attaques par force brute (rate limiting)
- Cookies httpOnly et secure (en prod)
- Redirection HTTPS en production
- Validation du Content-Type

## Intégration avec le frontend

1. Rediriger l'utilisateur vers `/auth/github` ou `/auth/google` pour l'authentification
2. Après authentification, l'utilisateur est redirigé vers l'URL spécifiée dans `FRONTEND_URL`
3. Le frontend peut alors appeler `/profile` pour obtenir les informations de l'utilisateur connecté

## Développement

```bash
# Lancer en mode développement avec rechargement à chaud
pnpm dev

# Linter
pnpm lint

# Tests
pnpm test
```

## Production

Pour le déploiement en production :

1. Configurer les variables d'environnement pour la production
2. Utiliser un serveur MongoDB sécurisé (Atlas recommandé)
3. Définir `NODE_ENV=production`
4. Utiliser un proxy inverse (Nginx, etc.) pour gérer HTTPS

## Licence

MIT 