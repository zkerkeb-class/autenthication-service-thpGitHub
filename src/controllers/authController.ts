import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import config from '../config/env';
import jwt from 'jsonwebtoken';
import { revokeRefreshToken } from '../utils/tokenUtils';

/**
 * Contrôleur gérant l'authentification des utilisateurs
 * @module AuthController
 */

/**
 * Affiche la page d'accueil avec les options de connexion
 *
 * @function getHomePage
 * @param {Request} req - Requête Express
 * @param {Response} res - Réponse Express
 * @returns {void}
 */
export const getHomePage = (req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Authentication Service</title>
      <style>
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #333;
        }
        
        .container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
          width: 90%;
          max-width: 500px;
          padding: 2.5rem;
          text-align: center;
        }
        
        h1 {
          margin-bottom: 1.5rem;
          color: #2c3e50;
          font-weight: 600;
        }
        
        p {
          margin-bottom: 2rem;
          color: #7f8c8d;
        }
        
        .btn-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem 1rem;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.2s ease;
          color: white;
        }
        
        .btn-github {
          background-color: #24292e;
        }
        
        .btn-github:hover {
          background-color: #1a1e22;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        .btn-google {
          background-color: #4285f4;
        }
        
        .btn-google:hover {
          background-color: #3367d6;
          box-shadow: 0 4px 8px rgba(66, 133, 244, 0.2);
        }
        
        .icon {
          margin-right: 10px;
          font-size: 1.2rem;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Authentication Service</h1>
        <p>Choose your preferred method to connect</p>
        <div class="btn-container">
          <a href="/auth/github" class="btn btn-github">
            <span class="icon">&#xf092;</span> Continue with GitHub
          </a>
          <a href="/auth/google" class="btn btn-google">
            <span class="icon">G</span> Continue with Google
          </a>
        </div>
      </div>
    </body>
    </html>
  `);
};

/**
 * Initialise l'authentification GitHub
 *
 * @function githubAuth
 * @type {Function}
 */
export const githubAuth = passport.authenticate('github', { scope: ['user:email'] });

/**
 * Gère le callback après authentification GitHub
 *
 * @function githubCallback
 * @param {Request} req - Requête Express
 * @param {Response} res - Réponse Express
 * @param {NextFunction} next - Fonction next d'Express
 * @returns {void}
 */
export const githubCallback = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('github', { session: false }, (err: Error | null, user: any) => {
    if (err) {
      return res.redirect(`/auth/error?message=${encodeURIComponent(err.message)}`);
    }

    if (!user) {
      return res.redirect(`/auth/error?message=Authentication failed`);
    }

    // Rediriger vers notre route de callback avec le token
    return res.redirect(`/auth/callback?token=${user.token}`);
  })(req, res, next);
};

/**
 * Initialise l'authentification Google
 *
 * @function googleAuth
 * @type {Function}
 */
export const googleAuth = passport.authenticate('google', { scope: ['profile', 'email'] });

/**
 * Gère le callback après authentification Google
 *
 * @function googleCallback
 * @param {Request} req - Requête Express
 * @param {Response} res - Réponse Express
 * @param {NextFunction} next - Fonction next d'Express
 * @returns {void}
 */
export const googleCallback = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('google', { session: false }, (err: Error | null, user: any) => {
    if (err) {
      return res.redirect(`/auth/error?message=${encodeURIComponent(err.message)}`);
    }

    if (!user) {
      return res.redirect(`/auth/error?message=Authentication failed`);
    }

    // Rediriger vers notre route de callback avec le token
    return res.redirect(`/auth/callback?token=${user.token}`);
  })(req, res, next);
};

/**
 * Déconnecte l'utilisateur en révoquant son token
 *
 * @function logout
 * @param {Request} req - Requête Express
 * @param {Response} res - Réponse Express
 * @returns {void}
 */
export const logout = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    // Vérifier que le token est valide
    const decoded = jwt.verify(token, config.jwt.secret!);
    
    // Révoquer le token
    await revokeRefreshToken(token);

    return res.json({
      success: true,
      message: 'Successfully logged out'
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Vérifie si l'utilisateur est authentifié et renvoie son statut
 *
 * @function getAuthStatus
 * @param {Request} req - Requête Express
 * @param {Response} res - Réponse Express
 * @returns {Object} Statut d'authentification et infos utilisateur si connecté
 */
export const getAuthStatus = (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.json({
      success: true,
      isAuthenticated: false
    });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, config.jwt.secret!);
    return res.json({
      success: true,
      isAuthenticated: true,
      user: decoded
    });
  } catch (error) {
    return res.json({
      success: true,
      isAuthenticated: false,
      error: 'Invalid token'
    });
  }
};

/**
 * Renvoie le profil de l'utilisateur connecté
 *
 * @function getProfile
 * @param {Request} req - Requête Express
 * @param {Response} res - Réponse Express
 * @returns {Object} Données de profil utilisateur ou message d'erreur
 */
export const getProfile = (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated',
    });
  }

  return res.json({
    success: true,
    user: req.user,
  });
};

/**
 * Vérifier le token JWT
 *
 * @function verifyToken
 * @param {Request} req - Requête Express
 * @param {Response} res - Réponse Express
 * @returns {Object} Statut d'authentification et infos utilisateur si connecté
 */
export const verifyToken = (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, config.jwt.secret!);
    return res.json({
      success: true,
      user: decoded
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

/**
 * Renvoie les URLs d'authentification disponibles
 *
 * @function getAuthUrls
 * @param {Request} req - Requête Express
 * @param {Response} res - Réponse Express
 * @returns {Object} URLs d'authentification pour chaque provider
 */
export const getAuthUrls = (_req: Request, res: Response) => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  res.json({
    github: `${baseUrl}/auth/github`,
    google: `${baseUrl}/auth/google`
  });
};
