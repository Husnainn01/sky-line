import express from 'express';
import { savedVehiclesController } from '../controllers/savedVehiclesController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get all saved vehicles for the current user
router.get('/', savedVehiclesController.getSavedVehicles);

// Check if a vehicle is saved by the current user
router.get('/:vehicleId', savedVehiclesController.checkSavedStatus);

// Save a vehicle
router.post('/save', savedVehiclesController.saveVehicle);

// Unsave a vehicle
router.post('/unsave', savedVehiclesController.unsaveVehicle);

export default router;
