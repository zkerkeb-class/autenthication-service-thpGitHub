# Crypto Analyzer Authentication Service

Service d'authentification stateless pour l'application Crypto Analyzer, utilisant OAuth2 avec GitHub et JWT.

## 🌟 Fonctionnalités

- Authentification OAuth2 avec GitHub
- Gestion des tokens JWT
- Architecture stateless (sans base de données)
- Sécurité renforcée (rate limiting, helmet, CORS)
- Logging avancé avec Pino
- Tests unitaires et d'intégration avec Jest

## 🏗️ Architecture

Le service est construit avec :
- **TypeScript** pour la sécurité du typage
- **Express.js** pour le serveur HTTP
- **Passport.js** pour l'authentification OAuth
- **JWT** pour les tokens d'authentification
- **Docker** pour la conteneurisation

### Structure du Projet
```
src/
├── config/         # Configuration (env, passport)
├── controllers/    # Logique métier
├── middlewares/    # Middlewares Express
├── routes/         # Routes API
├── types/          # Types TypeScript
└── utils/         # Utilitaires (logging, tokens)
```

## 🚀 Installation

1. Cloner le repository
2. Créer un fichier `.env` basé sur `.env.example`
3. Installer les dépendances :
```bash
pnpm install
```

## 🔧 Configuration

Créer un fichier `.env` avec :
```env
# Server
PORT=3000
NODE_ENV=development

# GitHub OAuth
GITHUB_CLIENT_ID=votre_client_id
GITHUB_CLIENT_SECRET=votre_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback

# JWT
JWT_SECRET=votre_secret_jwt
JWT_EXPIRATION=24h
```

## 🐳 Docker

Lancer avec Docker Compose :
```bash
docker-compose up --build
```

Le service sera disponible sur `http://localhost:3000`

## 📡 API Endpoints

### Authentification
- `GET /auth/github` - Connexion avec GitHub
- `GET /auth/github/callback` - Callback GitHub
- `GET /auth/status` - Vérifier le statut d'authentification
- `POST /auth/logout` - Déconnexion

### Tokens
- `POST /token/verify` - Vérifier un token JWT
- `POST /token/refresh` - Rafraîchir un token JWT

## 🔒 Sécurité

Le service implémente plusieurs niveaux de sécurité :
- Rate limiting pour prévenir les attaques par force brute
- Helmet pour les en-têtes de sécurité HTTP
- CORS configuré pour les origines autorisées
- Validation des données entrantes
- Tokens JWT signés et expirables

## 🧪 Tests

Lancer les tests :
```bash
# Tests unitaires
pnpm test

# Tests avec couverture
pnpm test:coverage
```

## 📝 Logs

Les logs sont gérés par Pino et stockés dans `/logs` :
- Format JSON pour faciliter le parsing
- Niveaux de log configurables
- Rotation des fichiers de log

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/amazing-feature`)
3. Commit les changements (`git commit -m 'feat: add amazing feature'`)
4. Push sur la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## 📄 Licence

ISC 