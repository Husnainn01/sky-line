import express from 'express';
import { dashboardController } from '../controllers/dashboardController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// All dashboard routes require authentication
router.use(authMiddleware);

// Dashboard data
router.get('/', dashboardController.getDashboardData);

export default router;
