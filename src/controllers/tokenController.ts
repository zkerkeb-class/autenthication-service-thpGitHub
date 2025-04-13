import { Request, Response } from 'express';
import {
  generateTokens,
  refreshAccessToken,
  revokeRefreshToken,
  revokeAllUserTokens,
} from '../utils/tokenUtils';
import { UserJwtPayload, RequestWithJwt } from '../middlewares/authJwt';

/**
 * Génère des tokens JWT après une authentification réussie
 */
export const createTokens = async (req: Request, res: Response) => {
  try {
    // Vérifier que l'utilisateur est authentifié (via Passport)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié',
      });
    }

    // Générer les tokens
    const tokens = await generateTokens(req.user, req);

    // Définir le refresh token comme cookie HTTP-only (plus sécurisé)
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours en millisecondes
      sameSite: 'lax',
    });

    // Renvoyer l'access token
    return res.status(200).json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        expiresIn: tokens.expiresIn,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la création des tokens:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur de serveur lors de la création des tokens',
    });
  }
};

/**
 * Rafraîchit l'access token avec un refresh token valide
 */
export const refreshToken = async (req: Request, res: Response) => {
  try {
    // Récupérer le refresh token depuis le cookie ou le corps de la requête
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token manquant',
      });
    }

    // Valider le refresh token et générer un nouvel access token
    const result = await refreshAccessToken(refreshToken, req);

    return res.status(200).json({
      success: true,
      data: {
        accessToken: result.accessToken,
        expiresIn: result.expiresIn,
      },
    });
  } catch (error) {
    console.error('Erreur lors du rafraîchissement du token:', error);

    // Supprimer le cookie refresh token s'il y a eu une erreur
    res.clearCookie('refreshToken');

    return res.status(401).json({
      success: false,
      message: 'Refresh token invalide ou expiré',
      code: 'INVALID_REFRESH_TOKEN',
    });
  }
};

/**
 * Révoque un refresh token (déconnexion)
 */
export const logout = async (req: Request, res: Response) => {
  try {
    // Récupérer le refresh token depuis le cookie ou le corps de la requête
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (refreshToken) {
      // Révoquer le refresh token en base de données
      await revokeRefreshToken(refreshToken);
    }

    // Supprimer le cookie
    res.clearCookie('refreshToken');

    return res.status(200).json({
      success: true,
      message: 'Déconnexion réussie',
    });
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur de serveur lors de la déconnexion',
    });
  }
};

/**
 * Révoque tous les refresh tokens d'un utilisateur (déconnexion de tous les appareils)
 */
export const logoutAll = async (req: RequestWithJwt, res: Response) => {
  try {
    // Vérifier que l'utilisateur est authentifié et a un ID
    if (!req.jwtUser || typeof req.jwtUser.id !== 'string') {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié ou ID invalide',
      });
    }

    // Révoquer tous les refresh tokens de l'utilisateur
    const count = await revokeAllUserTokens(req.jwtUser.id);

    // Supprimer le cookie
    res.clearCookie('refreshToken');

    return res.status(200).json({
      success: true,
      message: `Déconnexion réussie de tous les appareils (${count} sessions)`,
      data: { count },
    });
  } catch (error) {
    console.error('Erreur lors de la déconnexion multiple:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur de serveur lors de la déconnexion multiple',
    });
  }
};
