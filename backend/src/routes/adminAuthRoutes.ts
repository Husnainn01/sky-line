import express from 'express';
import { adminAuthController } from '../controllers/adminAuthController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Admin authentication routes
router.post('/login', adminAuthController.login);
router.post('/verify-mfa', adminAuthController.verifyMfaLogin);
router.post('/verify-email', adminAuthController.verifyEmail);
router.post('/resend-verification', adminAuthController.resendVerification);

// Session management routes
router.get('/verify-session', adminAuthController.verifySession);
router.post('/logout', adminAuthController.logout);

// Protected routes - require authentication and superadmin role
router.post('/create', authMiddleware, (req, res, next) => {
  // Check if user is a superadmin
  if (req.user?.role !== 'superadmin') {
    return res.status(403).json({ 
      success: false,
      message: 'Access denied. Requires superadmin privileges.' 
    });
  }
  next();
}, adminAuthController.createAdmin);

export default router;
