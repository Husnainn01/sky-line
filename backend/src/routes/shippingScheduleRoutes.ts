import express from 'express';
import { shippingScheduleController } from '../controllers/shippingScheduleController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes
router.get('/', shippingScheduleController.getAllShippingSchedules);
router.get('/active', shippingScheduleController.getActiveShippingSchedules);
router.get('/:id', shippingScheduleController.getShippingScheduleById);

// Protected routes
router.use(authMiddleware);
router.post('/', shippingScheduleController.createShippingSchedule);
router.put('/:id', shippingScheduleController.updateShippingSchedule);
router.delete('/:id', shippingScheduleController.deleteShippingSchedule);

export default router;
