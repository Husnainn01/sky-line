import express from 'express';
import { profileController } from '../controllers/profileController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// All profile routes are protected by auth middleware
router.use(authMiddleware);

// Profile routes
router.get('/', profileController.getProfile);
router.put('/update', profileController.updateProfile);
router.post('/email/change', profileController.requestEmailChange);
router.post('/email/verify', profileController.verifyEmailChange);
router.post('/email/cancel', profileController.cancelEmailChange);

export default router;
