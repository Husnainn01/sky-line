import express from 'express';
import { vehicleController } from '../controllers/vehicleController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminAuthMiddleware } from '../middleware/adminAuthMiddleware';

const router = express.Router();

// Public routes - available to everyone
router.get('/', vehicleController.getAllVehicles);
router.get('/:id', vehicleController.getVehicleById);
router.get('/type/:type', vehicleController.getVehiclesByType);

// Admin routes - require admin authentication
router.post('/', adminAuthMiddleware, vehicleController.createVehicle);
router.put('/:id', adminAuthMiddleware, vehicleController.updateVehicle);
router.delete('/:id', adminAuthMiddleware, vehicleController.deleteVehicle);

// User routes - require regular user authentication (if needed)
// router.post('/user-specific-action', authMiddleware, vehicleController.userSpecificAction);

export default router;
