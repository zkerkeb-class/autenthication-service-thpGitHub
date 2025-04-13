// Script d'initialisation de la base de données MongoDB
// Ce script s'exécute lors du premier démarrage du conteneur MongoDB

db = db.getSiblingDB(process.env.MONGO_INITDB_DATABASE || 'auth-service');

// Création d'un utilisateur dédié à l'application avec des permissions limitées
db.createUser({
  user: process.env.MONGO_APP_USERNAME || 'auth_user',
  pwd: process.env.MONGO_APP_PASSWORD || 'auth_password',
  roles: [
    { role: 'readWrite', db: process.env.MONGO_INITDB_DATABASE || 'auth-service' }
  ]
});

// Création des collections initiales
db.createCollection('users');
db.createCollection('tokens');

// Index pour optimiser les recherches fréquentes
db.users.createIndex({ id: 1 }, { unique: true });
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ provider: 1 });

db.tokens.createIndex({ userId: 1 });
db.tokens.createIndex({ refreshToken: 1 }, { unique: true });
db.tokens.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Message de confirmation
print('Database initialization completed!'); 