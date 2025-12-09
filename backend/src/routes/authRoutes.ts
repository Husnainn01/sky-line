import express from 'express';
import { authController } from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes
router.post('/request-verification', authController.requestVerification); // Request verification code
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify-mfa-login', authController.verifyMfaLogin);
router.get('/verify-email', authController.verifyEmail); // Email verification endpoint
router.post('/logout', authController.logout); // Logout endpoint
router.post('/forgot-password', authController.forgotPassword); // Request password reset
router.post('/reset-password', authController.resetPassword); // Reset password with token

// Protected routes
router.get('/profile', authController.getProfile); // Now using WorkOS session verification

export default router;
