import express from 'express';
import * as authController from '../controllers/authController';

const router = express.Router();

// Auth status and profile endpoints
router.get('/auth/status', authController.getAuthStatus);
router.get('/auth/urls', authController.getAuthUrls);
router.get('/auth/logout', authController.logout);
router.get('/profile', authController.getProfile);

export default router; 