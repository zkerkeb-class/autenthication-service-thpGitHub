import express from 'express';
import passport from 'passport';
import { body, validationResult } from 'express-validator';
import * as authController from '../controllers/authController';
import { createError } from '../middlewares/errorHandler';

const router = express.Router();

// Authentication routes
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Callbacks
router.get(
  '/callback/github',
  passport.authenticate('github', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/profile');
  }
);

router.get(
  '/callback/google',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/profile');
  }
);

// API endpoints
router.get('/status', authController.getAuthStatus);
router.get('/urls', authController.getAuthUrls);
router.get('/logout', authController.logout);

export default router;
