import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Type du payload JWT
export interface UserJwtPayload {
  id: string;
  email: string;
  provider: string;
  roles?: string[];
  [key: string]: any;
}

// Créer une interface pour la requête avec JWT
export interface RequestWithJwt extends Request {
  jwtUser?: UserJwtPayload;
}

/**
 * Middleware pour vérifier la validité d'un token JWT
 */
export const verifyJWT = (req: RequestWithJwt, res: Response, next: NextFunction) => {
  // Récupérer le token depuis l'en-tête Authorization
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Accès refusé. Token manquant.',
    });
  }

  // Extraire le token (retirer "Bearer ")
  const token = authHeader.split(' ')[1];

  try {
    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-jwt-secret');

    // Ajouter les informations décodées à l'objet Request
    req.jwtUser = decoded as UserJwtPayload;

    // Passer au middleware suivant
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: 'Token expiré. Veuillez vous reconnecter.',
        code: 'TOKEN_EXPIRED',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Token invalide. Veuillez vous reconnecter.',
      code: 'INVALID_TOKEN',
    });
  }
};

/**
 * Middleware pour vérifier si l'utilisateur a un rôle spécifique
 * Note: Ce middleware doit être utilisé après verifyJWT
 */
export const hasRole = (roles: string[]) => {
  return (req: RequestWithJwt, res: Response, next: NextFunction) => {
    if (!req.jwtUser) {
      return res.status(401).json({
        success: false,
        message: 'Accès refusé. Authentification requise.',
      });
    }

    // Vérifier si l'utilisateur a le rôle requis
    const userRoles = req.jwtUser.roles || ['user'];

    const hasRequiredRole = roles.some(role => userRoles.includes(role));

    if (!hasRequiredRole) {
      return res.status(403).json({
        success: false,
        message: "Accès refusé. Vous n'avez pas les permissions requises.",
      });
    }

    next();
  };
};
