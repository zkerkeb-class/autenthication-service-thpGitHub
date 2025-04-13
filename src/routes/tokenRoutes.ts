import express from 'express';
import { createTokens, refreshToken, logout, logoutAll } from '../controllers/tokenController';
import { verifyJWT } from '../middlewares/authJwt';

const router = express.Router();

/**
 * @route   POST /token
 * @desc    Génère des tokens JWT pour un utilisateur authentifié
 * @access  Private (requiert une session Passport active)
 */
router.post('/token', createTokens);

/**
 * @route   POST /token/refresh
 * @desc    Rafraîchit l'access token avec un refresh token valide
 * @access  Public
 */
router.post('/token/refresh', refreshToken);

/**
 * @route   POST /token/revoke
 * @desc    Révoque un refresh token (déconnexion)
 * @access  Public
 */
router.post('/token/revoke', logout);

/**
 * @route   POST /token/revoke-all
 * @desc    Révoque tous les refresh tokens d'un utilisateur (déconnexion de tous les appareils)
 * @access  Private (requiert un JWT valide)
 */
router.post('/token/revoke-all', verifyJWT, logoutAll);

export default router;
