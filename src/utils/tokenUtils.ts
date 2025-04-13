import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { Token } from '../models/Token';
import { User } from '../models/User';
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

  // Sauvegarder le refresh token en base de données
  await Token.create({
    userId,
    refreshToken,
    expiresAt,
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
  });

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
  const storedToken = await Token.findOne({
    refreshToken,
    isRevoked: false,
    expiresAt: { $gt: new Date() },
  });

  if (!storedToken) {
    throw new Error('Refresh token invalide ou expiré');
  }

  // Récupérer l'utilisateur associé au token
  const user = await User.findOne({ id: storedToken.userId });
  if (!user) {
    throw new Error('Utilisateur non trouvé');
  }

  const userId = user.id || user._id?.toString() || '';

  // Générer un nouvel access token
  const payload: UserJwtPayload = {
    id: userId,
    email: user.email,
    provider: user.provider,
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
  const result = await Token.updateOne({ refreshToken }, { isRevoked: true });

  return result.modifiedCount > 0;
};

/**
 * Révoque tous les refresh tokens d'un utilisateur
 */
export const revokeAllUserTokens = async (userId: string) => {
  const result = await Token.updateMany({ userId }, { isRevoked: true });

  return result.modifiedCount;
};

/**
 * Nettoie les tokens expirés ou révoqués (à exécuter périodiquement)
 */
export const cleanupTokens = async () => {
  const result = await Token.deleteMany({
    $or: [{ expiresAt: { $lt: new Date() } }, { isRevoked: true }],
  });

  return result.deletedCount;
};
