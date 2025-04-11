import express from 'express';
import * as authController from '../controllers/authController';

const router = express.Router();

// Routes d'authentification GitHub
router.get('/github', authController.githubAuth);
router.get('/callback/github', authController.githubCallback);

// Routes d'authentification Google
router.get('/google', authController.googleAuth);
router.get('/callback/google', authController.googleCallback);

// Page d'erreur simple
router.get('/error', (req, res) => {
  const message = req.query.message || 'Une erreur s\'est produite';
  res.status(400).json({
    success: false,
    message
  });
});

// Page de succès simple
router.get('/success', (req, res) => {
  res.json({
    success: true,
    message: 'Authentification réussie',
    user: req.user
  });
});

// Déconnexion
router.get('/logout', authController.logout);

// Vérifier le statut d'authentification
router.get('/status', authController.getAuthStatus);

// Obtenir les URLs d'authentification
router.get('/urls', authController.getAuthUrls);

export default router; 