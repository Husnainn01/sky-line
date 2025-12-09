import express from 'express';
import { adminAuthController } from '../controllers/adminAuthController';
import { adminAuthMiddleware, roleMiddleware, permissionMiddleware } from '../middleware/adminAuthMiddleware';

const router = express.Router();

// Admin authentication routes
router.post('/register', adminAuthMiddleware, roleMiddleware(['superadmin']), (req, res) => adminAuthController.createAdmin(req, res));
router.post('/login', (req, res) => adminAuthController.login(req, res));
router.post('/verify-email', (req, res) => adminAuthController.verifyEmail(req, res));
router.post('/verify-mfa', (req, res) => adminAuthController.verifyMfaLogin(req, res));
router.post('/resend-verification', (req, res) => adminAuthController.resendVerification(req, res));
router.get('/verify-session', (req, res) => adminAuthController.verifySession(req, res));
router.post('/logout', (req, res) => adminAuthController.logout(req, res));

// WorkOS handles verification through their API

// Admin user and role management routes
router.get('/roles', adminAuthMiddleware, roleMiddleware(['superadmin', 'admin']), (req, res) => adminAuthController.getRoles(req, res));
router.get('/admins', adminAuthMiddleware, roleMiddleware(['superadmin', 'admin']), (req, res) => adminAuthController.getAdmins(req, res));
router.put('/admins/:id/role', adminAuthMiddleware, roleMiddleware(['superadmin']), (req, res) => adminAuthController.updateAdminRole(req, res));
router.delete('/admins/:id', adminAuthMiddleware, roleMiddleware(['superadmin']), (req, res) => adminAuthController.deleteAdmin(req, res));

// Resource-specific permission routes - these will be implemented later
// For now, we'll just use placeholder routes that return a success message
router.get('/vehicles', adminAuthMiddleware, permissionMiddleware('vehicles', 'read'), (req, res) => {
  res.json({ success: true, message: 'Admin access to vehicles granted' });
});
router.post('/vehicles', adminAuthMiddleware, permissionMiddleware('vehicles', 'create'), (req, res) => {
  res.json({ success: true, message: 'Admin vehicle creation granted' });
});
router.put('/vehicles/:id', adminAuthMiddleware, permissionMiddleware('vehicles', 'update'), (req, res) => {
  res.json({ success: true, message: 'Admin vehicle update granted' });
});
router.delete('/vehicles/:id', adminAuthMiddleware, permissionMiddleware('vehicles', 'delete'), (req, res) => {
  res.json({ success: true, message: 'Admin vehicle deletion granted' });
});

export default router;
