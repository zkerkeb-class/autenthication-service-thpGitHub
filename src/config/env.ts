import dotenv from 'dotenv';
import { join } from 'path';

// Load environment variables from .env file
dotenv.config();

// Environment
const NODE_ENV = process.env.NODE_ENV || 'development';
const isProd = NODE_ENV === 'production';

// Server
const PORT = parseInt(process.env.PORT || '3000', 10);
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

// URLs and callbacks
const CALLBACK_URL = process.env.CALLBACK_URL || `http://localhost:${PORT}/auth/callback`;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Rate limiting
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '15', 10) * 60 * 1000; // Default: 15 minutes
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || '100', 10); // Default: 100 requests per window

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
    }
  },
  urls: {
    callback: CALLBACK_URL,
    frontend: FRONTEND_URL
  },
  rateLimit: {
    windowMs: RATE_LIMIT_WINDOW_MS,
    max: RATE_LIMIT_MAX
  }
}; 