import express from 'express';
import authRoutes from './authRoutes';
import apiRoutes from './apiRoutes';
import * as authController from '../controllers/authController';

const router = express.Router();

// Home page
router.get('/', authController.getHomePage);

// Profile page
router.get('/profile', authController.getProfile);

// Auth routes (GitHub, Google login, callbacks)
router.use('/auth', authRoutes);

// API routes
router.use('/api', apiRoutes);

export default router; 