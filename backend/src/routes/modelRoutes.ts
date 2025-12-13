import express from 'express';
import { modelController } from '../controllers/modelController';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes
router.get('/', modelController.getAllModels);
router.get('/:id', modelController.getModelById);

// Protected routes (admin only)
router.post('/', authMiddleware, adminMiddleware, modelController.createModel);
router.put('/:id', authMiddleware, adminMiddleware, modelController.updateModel);
router.delete('/:id', authMiddleware, adminMiddleware, modelController.deleteModel);

export default router;
