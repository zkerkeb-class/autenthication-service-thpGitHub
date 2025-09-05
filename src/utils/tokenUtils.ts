import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { IToken } from '../models/Token';
import { IUser } from '../models/User';
import { Request } from 'express';
import { UserJwtPayload } from '../middlewares/authJwt';

// Type pour les valeurs de durée acceptées par jsonwebtoken
type JwtDuration = string | number;

// Interface pour le user qui peut être soit User de Passport, soit notre propre User
export interface TokenUser {
  id?: string;
  _id?: string;
  email?: string;
  provider?: string;
  [key: string]: any;
}

// Stockage en mémoire des tokens
const tokenStore = new Map<string, IToken>();

/**
 * Génère un access token JWT et un refresh token
 */
export const generateTokens = async (user: TokenUser, req: Request) => {
  // Préparer les données utilisateur à inclure dans le JWT (payload)
  const userId = user.id || user._id?.toString() || '';

  const payload: UserJwtPayload = {
    id: userId,
    email: user.email || '',
    provider: user.provider || 'local',
  };

  // Définir la durée d'expiration
  const tokenExpiration = process.env.JWT_EXPIRES_IN || '15m';

  // Générer l'access token (JWT)
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET || 'default-jwt-secret', {
    expiresIn: tokenExpiration as any,
  });

  // Générer le refresh token (aléatoire)
  const refreshToken = crypto.randomBytes(40).toString('hex');

  // Calculer la date d'expiration du refresh token
  const expiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
  const expiresAt = new Date();
  if (expiresIn.endsWith('d')) {
    expiresAt.setDate(expiresAt.getDate() + parseInt(expiresIn));
  } else if (expiresIn.endsWith('h')) {
    expiresAt.setHours(expiresAt.getHours() + parseInt(expiresIn));
  } else {
    // Par défaut, 7 jours
    expiresAt.setDate(expiresAt.getDate() + 7);
  }

  // Sauvegarder le refresh token en mémoire
  const token: IToken = {
    userId,
    refreshToken,
    expiresAt,
    isRevoked: false,
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
    createdAt: new Date()
  };
  tokenStore.set(refreshToken, token);

  return {
    accessToken,
    refreshToken,
    expiresIn: tokenExpiration,
  };
};

/**
 * Vérifie la validité d'un refresh token et génère un nouvel access token
 */
export const refreshAccessToken = async (refreshToken: string, req: Request) => {
  // Vérifier si le refresh token existe et est valide
  const storedToken = tokenStore.get(refreshToken);

  if (!storedToken || storedToken.isRevoked || storedToken.expiresAt < new Date()) {
    throw new Error('Refresh token invalide ou expiré');
  }

  // Générer un nouvel access token
  const payload: UserJwtPayload = {
    id: storedToken.userId,
    email: '',  // On n'a pas besoin de l'email pour le refresh
    provider: 'local',  // On n'a pas besoin du provider pour le refresh
  };

  // Définir la durée d'expiration
  const tokenExpiration = process.env.JWT_EXPIRES_IN || '15m';

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET || 'default-jwt-secret', {
    expiresIn: tokenExpiration as any,
  });

  return {
    accessToken,
    expiresIn: tokenExpiration,
  };
};

/**
 * Révoque un refresh token (utilisé pour la déconnexion)
 */
export const revokeRefreshToken = async (refreshToken: string) => {
  const token = tokenStore.get(refreshToken);
  if (token) {
    token.isRevoked = true;
    tokenStore.set(refreshToken, token);
    return true;
  }
  return false;
};

/**
 * Révoque tous les refresh tokens d'un utilisateur
 */
export const revokeAllUserTokens = async (userId: string) => {
  let count = 0;
  for (const [refreshToken, token] of tokenStore.entries()) {
    if (token.userId === userId) {
      token.isRevoked = true;
      tokenStore.set(refreshToken, token);
      count++;
    }
  }
  return count;
};

/**
 * Nettoie les tokens expirés ou révoqués (à exécuter périodiquement)
 */
export const cleanupTokens = async () => {
  const now = new Date();
  let count = 0;
  for (const [refreshToken, token] of tokenStore.entries()) {
    if (token.isRevoked || token.expiresAt < now) {
      tokenStore.delete(refreshToken);
      count++;
    }
  }
  return count;
};
