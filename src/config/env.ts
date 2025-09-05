import dotenv from 'dotenv';
import { join } from 'path';
import { Secret } from 'jsonwebtoken';
import { StringValue } from '../types/jwt';

// Load environment variables from .env file
dotenv.config();

// Environment
const NODE_ENV = process.env.NODE_ENV || 'development';
const isProd = NODE_ENV === 'production';

// Server
const PORT = parseInt(process.env.PORT || '3006', 10);
const COOKIE_SECRET = process.env.COOKIE_SECRET || (isProd ? undefined : 'dev_secret_change_me');

// Make sure we have a session secret in production
if (isProd && !COOKIE_SECRET) {
  console.error('ERROR: COOKIE_SECRET must be set in production environment!');
  process.exit(1);
}

// Auth providers
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// URLs
const BASE_URL = isProd ? process.env.BASE_URL! : `http://localhost:${PORT}`;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3005';

// Callback URLs spécifiques à chaque provider
const CALLBACK_URLS = {
  github: `${BASE_URL}/auth/callback/github`,
  google: `${BASE_URL}/auth/callback/google`,
};

// Rate limiting
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 100; // 100 requests per window

export default {
  isProd,
  port: PORT,
  cookieSecret: COOKIE_SECRET,
  auth: {
    github: {
      clientId: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
    },
    google: {
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
    },
  },
  jwt: {
    secret: JWT_SECRET as Secret,
    expiresIn: JWT_EXPIRES_IN as StringValue,
  },
  urls: {
    callback: CALLBACK_URLS,
    frontend: FRONTEND_URL,
  },
  rateLimit: {
    windowMs: RATE_LIMIT_WINDOW,
    max: RATE_LIMIT_MAX,
  },
};
