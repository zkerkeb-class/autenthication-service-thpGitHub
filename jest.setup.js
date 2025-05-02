// Ce fichier s'exécute avant le début des tests

// Augmentation du timeout pour les tests
jest.setTimeout(30000);

// Mock pour les variables d'environnement
process.env.NODE_ENV = 'test';
process.env.PORT = '5000';
process.env.COOKIE_SECRET = 'test-secret';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.MONGODB_URI = 'mongodb://localhost:27017/auth-service-test';
process.env.FRONTEND_URL = 'http://localhost:3000';
process.env.GITHUB_CLIENT_ID = 'test-github-id';
process.env.GITHUB_CLIENT_SECRET = 'test-github-secret';
process.env.GOOGLE_CLIENT_ID = 'test-google-id';
process.env.GOOGLE_CLIENT_SECRET = 'test-google-secret';
process.env.CALLBACK_URL = 'http://localhost:5000/auth/callback'; 