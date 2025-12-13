import express from 'express';
import { makeController } from '../controllers/makeController';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes
router.get('/', makeController.getAllMakes);
router.get('/:id', makeController.getMakeById);
router.get('/:id/models', makeController.getModelsByMake);

// Protected routes (admin only)
router.post('/', authMiddleware, adminMiddleware, makeController.createMake);
router.put('/:id', authMiddleware, adminMiddleware, makeController.updateMake);
router.delete('/:id', authMiddleware, adminMiddleware, makeController.deleteMake);

export default router;
