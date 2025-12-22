import express from 'express';
import { heroSectionController } from '../controllers/heroSectionController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes - no authentication required
router.get('/active', heroSectionController.getActiveHeroSection);
router.get('/', heroSectionController.getAllHeroSections);
router.get('/:id', heroSectionController.getHeroSectionById);

// Protected routes - require authentication
router.use(authMiddleware);
router.post('/', heroSectionController.createHeroSection);
router.put('/:id', heroSectionController.updateHeroSection);
router.patch('/:id/activate', heroSectionController.setActiveHeroSection);
router.delete('/:id', heroSectionController.deleteHeroSection);

export default router;
