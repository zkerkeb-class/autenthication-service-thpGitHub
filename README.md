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

### API protégée par JWT

- `GET /api/protected` - Route protégée nécessitant un token JWT valide
- `GET /api/admin` - Route protégée accessible uniquement par les utilisateurs ayant le rôle "admin"

## Authentification JWT

Le service utilise JSON Web Tokens (JWT) pour sécuriser les API :

### Génération de tokens

- `POST /token` - Génère un token JWT pour un utilisateur authentifié via session
- `GET /generate-token-demo` - Page de démonstration pour générer et tester les tokens

### Structure du token JWT

```json
{
  "id": "45873241",         // ID utilisateur
  "email": "user@example.com",
  "provider": "github",     // Fournisseur d'authentification
  "roles": ["user"],        // Rôles utilisateur (optionnel)
  "iat": 1744381340,        // Issued At (timestamp d'émission)
  "exp": 1744382240         // Expiration (timestamp d'expiration)
}
```

### Utilisation des tokens

1. Générer un token via l'API `/token` ou la page `/demo-token`
2. Inclure le token dans l'en-tête HTTP des requêtes API :
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI...
   ```
3. Accéder aux routes protégées commençant par `/api/`

### Sécurité JWT

- Tous les endpoints `/api/*` sont automatiquement protégés par JWT
- Les tokens expirent après 15 minutes par défaut
- Le refresh token (cookie HTTP-only) permet d'obtenir un nouveau token sans reconnexion
- Une route `/token/refresh` permet de rafraîchir un token expiré

## Structure du projet

```
├── src/
│   ├── config/             # Configuration (env, passport, database)
│   ├── controllers/        # Contrôleurs de routes
│   ├── middlewares/        # Middlewares (sécurité, erreurs)
│   ├── models/             # Modèles Mongoose
│   ├── routes/             # Définitions des routes
│   ├── utils/              # Utilitaires
│   ├── __tests__/          # Tests unitaires et d'intégration
│   └── index.ts            # Point d'entrée
├── .eslintrc.js            # Configuration ESLint
├── .prettierrc             # Configuration Prettier
├── jest.config.js          # Configuration Jest
├── babel.config.js         # Configuration Babel
├── .env                    # Variables d'environnement
└── package.json            # Dépendances et scripts
```

## Qualité du code

Le projet intègre plusieurs outils et pratiques pour garantir une haute qualité de code :

### Formatage et linting

- **ESLint** : Analyse statique du code pour identifier les problèmes potentiels
- **Prettier** : Formatage cohérent du code
- **Husky** : Hooks Git pour vérifier le code avant les commits
- **lint-staged** : Exécution des vérifications uniquement sur les fichiers modifiés

### Tests automatisés

- **Jest** : Framework de test pour les tests unitaires et d'intégration
- **Supertest** : Pour tester les API HTTP
- **Babel** : Pour transpiler le TypeScript lors des tests

### Documentation

- **JSDoc** : Documentation des composants, interfaces et fonctions

### Scripts disponibles

```bash
# Vérification du formatage et de la syntaxe
pnpm lint

# Correction automatique des problèmes de formatage
pnpm lint:fix

# Formatage du code
pnpm format

# Exécution des tests
pnpm test

# Tests avec mode watch (recharge à chaque modification)
pnpm test:watch

# Tests avec rapport de couverture
pnpm test:coverage

# Vérification des types TypeScript
pnpm check-types

# Validation complète (lint + types + tests)
pnpm validate
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