import express from 'express';
import * as authController from '../controllers/authController';
import { verifyJWT, hasRole, UserJwtPayload, RequestWithJwt } from '../middlewares/authJwt';

const router = express.Router();

// Auth status and profile endpoints
router.get('/auth/status', authController.getAuthStatus);
router.get('/auth/urls', authController.getAuthUrls);
router.get('/auth/logout', authController.logout);
router.get('/profile', authController.getProfile);

/**
 * @route   GET /api/protected
 * @desc    Route protégée par JWT
 * @access  Private
 */
router.get('/protected', (req: RequestWithJwt, res) => {
  // À ce stade, req.jwtUser est garanti d'exister grâce au middleware verifyJWT global
  const user = req.jwtUser as UserJwtPayload;
  
  return res.json({
    success: true,
    message: 'Accès autorisé à la route protégée',
    user: {
      id: user.id,
      email: user.email,
      provider: user.provider
    }
  });
});

/**
 * @route   GET /api/admin
 * @desc    Route protégée accessible uniquement par les admins
 * @access  Private (admin)
 */
router.get('/admin', hasRole(['admin']), (req: RequestWithJwt, res) => {
  return res.json({
    success: true,
    message: 'Accès autorisé à la route admin',
    user: req.jwtUser
  });
});

export default router; 