import express from 'express';
import { securityController } from '../controllers/securityController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// All security routes require authentication
router.use(authMiddleware);

// Get security settings
router.get('/settings', securityController.getSecuritySettings);

// Change password
router.post('/change-password', securityController.changePassword);

// MFA routes
router.post('/mfa/enable', securityController.enableMFA);
router.post('/mfa/verify', securityController.verifyMFA);
router.post('/mfa/disable', securityController.disableMFA);

export default router;
