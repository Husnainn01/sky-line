import express from 'express';
import { faqController } from '../controllers/faqController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes
router.get('/', faqController.getAllFAQs);
router.get('/active', faqController.getActiveFAQs);
router.get('/:id', faqController.getFAQById);

// Protected routes
router.use(authMiddleware);
router.post('/', faqController.createFAQ);
router.put('/:id', faqController.updateFAQ);
router.delete('/:id', faqController.deleteFAQ);

export default router;
