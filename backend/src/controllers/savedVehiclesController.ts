import { Request, Response } from 'express';
import { User } from '../models/User';
import { Vehicle } from '../models/Vehicle';
import mongoose from 'mongoose';

export const savedVehiclesController = {
  /**
   * Get all saved vehicles for the current user
   */
  async getSavedVehicles(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: 'Authentication required' 
        });
      }
      
      // Find the user and populate their saved vehicles
      const user = await User.findById(userId).populate('savedVehicles');
      
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }
      
      res.json({
        success: true,
        data: user.savedVehicles || []
      });
    } catch (error) {
      console.error('Error fetching saved vehicles:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error while fetching saved vehicles',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  },
  
  /**
   * Save/like a vehicle
   */
  async saveVehicle(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { vehicleId } = req.body;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: 'Authentication required' 
        });
      }
      
      if (!vehicleId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Vehicle ID is required' 
        });
      }
      
      // Validate that the vehicle exists
      const vehicle = await Vehicle.findById(vehicleId);
      if (!vehicle) {
        return res.status(404).json({ 
          success: false, 
          message: 'Vehicle not found' 
        });
      }
      
      // Add the vehicle to the user's saved vehicles if not already saved
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }
      
      // Initialize savedVehicles array if it doesn't exist
      if (!user.savedVehicles) {
        user.savedVehicles = [];
      }
      
      // Check if vehicle is already saved
      const vehicleObjectId = new mongoose.Types.ObjectId(vehicleId);
      const isAlreadySaved = user.savedVehicles.some(id => id.equals(vehicleObjectId));
      
      if (isAlreadySaved) {
        return res.json({
          success: true,
          message: 'Vehicle is already saved',
          isSaved: true
        });
      }
      
      // Add vehicle to saved list
      user.savedVehicles.push(vehicleObjectId);
      await user.save();
      
      res.json({
        success: true,
        message: 'Vehicle saved successfully',
        isSaved: true
      });
    } catch (error) {
      console.error('Error saving vehicle:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error while saving vehicle',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  },
  
  /**
   * Unsave/unlike a vehicle
   */
  async unsaveVehicle(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { vehicleId } = req.body;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: 'Authentication required' 
        });
      }
      
      if (!vehicleId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Vehicle ID is required' 
        });
      }
      
      // Remove the vehicle from the user's saved vehicles
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }
      
      // Initialize savedVehicles array if it doesn't exist
      if (!user.savedVehicles) {
        user.savedVehicles = [];
        return res.json({
          success: true,
          message: 'Vehicle was not saved',
          isSaved: false
        });
      }
      
      // Check if vehicle is saved
      const vehicleObjectId = new mongoose.Types.ObjectId(vehicleId);
      const vehicleIndex = user.savedVehicles.findIndex(id => id.equals(vehicleObjectId));
      
      if (vehicleIndex === -1) {
        return res.json({
          success: true,
          message: 'Vehicle was not saved',
          isSaved: false
        });
      }
      
      // Remove vehicle from saved list
      user.savedVehicles.splice(vehicleIndex, 1);
      await user.save();
      
      res.json({
        success: true,
        message: 'Vehicle removed from saved list',
        isSaved: false
      });
    } catch (error) {
      console.error('Error unsaving vehicle:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error while unsaving vehicle',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  },
  
  /**
   * Check if a vehicle is saved/liked by the current user
   */
  async checkSavedStatus(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { vehicleId } = req.params;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: 'Authentication required' 
        });
      }
      
      if (!vehicleId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Vehicle ID is required' 
        });
      }
      
      // Check if the vehicle is in the user's saved vehicles
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }
      
      // Initialize savedVehicles array if it doesn't exist
      if (!user.savedVehicles) {
        user.savedVehicles = [];
        return res.json({
          success: true,
          isSaved: false
        });
      }
      
      // Check if vehicle is saved
      const vehicleObjectId = new mongoose.Types.ObjectId(vehicleId);
      const isSaved = user.savedVehicles.some(id => id.equals(vehicleObjectId));
      
      res.json({
        success: true,
        isSaved
      });
    } catch (error) {
      console.error('Error checking saved status:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error while checking saved status',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  }
};
