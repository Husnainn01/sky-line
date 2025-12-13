import express from 'express';
import { auctionVehicleController } from '../controllers/auctionVehicleController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminAuthMiddleware } from '../middleware/adminAuthMiddleware';

const router = express.Router();

// Public routes - available to everyone
router.get('/', auctionVehicleController.getAllAuctionVehicles);
router.get('/status/:status', auctionVehicleController.getAuctionVehiclesByStatus);
router.get('/slug/:slug', auctionVehicleController.getAuctionVehicleBySlug);
router.get('/:id', auctionVehicleController.getAuctionVehicleById);
router.get('/:id/bids', auctionVehicleController.getBidHistory);

// Admin routes - require admin authentication
router.post('/', adminAuthMiddleware, auctionVehicleController.createAuctionVehicle);
router.put('/:id', adminAuthMiddleware, auctionVehicleController.updateAuctionVehicle);
router.delete('/:id', adminAuthMiddleware, auctionVehicleController.deleteAuctionVehicle);

// User routes - require regular user authentication
router.post('/:id/bid', authMiddleware, auctionVehicleController.placeBid);

export default router;
