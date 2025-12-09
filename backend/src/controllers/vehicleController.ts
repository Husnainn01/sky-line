import { Request, Response } from 'express';
import { Vehicle } from '../models/Vehicle';
import { VehicleValidation } from '../models/Vehicle';
import mongoose from 'mongoose';

export const vehicleController = {
  /**
   * Get all vehicles
   */
  async getAllVehicles(req: Request, res: Response) {
    try {
      const { type, status, make, model, year, minPrice, maxPrice, sort } = req.query;
      
      // Build filter object
      const filter: any = {};
      
      // Filter by vehicle type (stock or auction)
      if (type) filter.type = type;
      
      // Filter by status
      if (status) filter.status = status;
      
      // Filter by make
      if (make) filter.make = { $regex: make, $options: 'i' };
      
      // Filter by model
      if (model) filter.model = { $regex: model, $options: 'i' };
      
      // Filter by year
      if (year) filter.year = year;
      
      // Filter by price range
      if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);
      }
      
      // Build sort object
      let sortOptions: any = { createdAt: -1 }; // Default sort by newest
      
      if (sort) {
        const [field, order] = (sort as string).split(':');
        sortOptions = { [field]: order === 'desc' ? -1 : 1 };
      }
      
      const vehicles = await Vehicle.find(filter)
        .sort(sortOptions)
        .limit(100); // Limit to prevent excessive data transfer
      
      res.json({
        success: true,
        count: vehicles.length,
        data: vehicles
      });
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error while fetching vehicles',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  },
  
  /**
   * Get a single vehicle by ID
   */
  async getVehicleById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid vehicle ID format'
        });
      }
      
      const vehicle = await Vehicle.findById(id);
      
      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found'
        });
      }
      
      res.json({
        success: true,
        data: vehicle
      });
    } catch (error) {
      console.error('Error fetching vehicle:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error while fetching vehicle',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  },
  
  /**
   * Create a new vehicle
   */
  async createVehicle(req: Request, res: Response) {
    try {
      const vehicleData = req.body;
      
      // Add owner if authenticated
      if (req.user?._id) {
        vehicleData.owner = req.user._id;
      }
      
      // Create slug from make, model and year
      vehicleData.slug = `${vehicleData.make}-${vehicleData.model}-${vehicleData.year}`.toLowerCase().replace(/\s+/g, '-');
      
      // Handle image URLs
      // For now, if we receive blob URLs from the frontend, replace them with placeholder image URLs
      if (vehicleData.images && Array.isArray(vehicleData.images)) {
        // Replace blob URLs with placeholder image URLs
        vehicleData.images = vehicleData.images.map((img: string, index: number) => {
          if (img.startsWith('blob:')) {
            // Use placeholder images from public directory
            const placeholders = [
              '/cars/ae86.png',
              '/cars/evo.png',
              '/cars/nsx.png',
              '/cars/rx7.png',
              '/cars/silvia.png',
              '/cars/supra.png',
              '/cars/gtr.png',
            ];
            return placeholders[index % placeholders.length];
          }
          return img;
        });
      }
      
      // Create new vehicle
      const vehicle = new Vehicle(vehicleData);
      await vehicle.save();
      
      res.status(201).json({
        success: true,
        message: 'Vehicle created successfully',
        data: vehicle
      });
    } catch (error) {
      console.error('Error creating vehicle:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error while creating vehicle',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  },
  
  /**
   * Update a vehicle
   */
  async updateVehicle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid vehicle ID format'
        });
      }
      
      // Find vehicle first to check ownership if needed
      const vehicle = await Vehicle.findById(id);
      
      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found'
        });
      }
      
      // Optional: Check if user is owner or admin
      // if (req.user?.role !== 'admin' && vehicle.owner?.toString() !== req.user?._id.toString()) {
      //   return res.status(403).json({
      //     success: false,
      //     message: 'Not authorized to update this vehicle'
      //   });
      // }
      
      // Handle image URLs
      if (updates.images && Array.isArray(updates.images)) {
        // Replace blob URLs with placeholder image URLs
        updates.images = updates.images.map((img: string, index: number) => {
          if (img.startsWith('blob:')) {
            // Use placeholder images from public directory
            const placeholders = [
              '/cars/ae86.png',
              '/cars/evo.png',
              '/cars/nsx.png',
              '/cars/rx7.png',
              '/cars/silvia.png',
              '/cars/supra.png',
              '/cars/gtr.png',
            ];
            return placeholders[index % placeholders.length];
          }
          return img;
        });
      }
      
      // Update the vehicle
      const updatedVehicle = await Vehicle.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
      
      res.json({
        success: true,
        message: 'Vehicle updated successfully',
        data: updatedVehicle
      });
    } catch (error) {
      console.error('Error updating vehicle:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error while updating vehicle',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  },
  
  /**
   * Delete a vehicle
   */
  async deleteVehicle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid vehicle ID format'
        });
      }
      
      // Find vehicle first to check ownership if needed
      const vehicle = await Vehicle.findById(id);
      
      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found'
        });
      }
      
      // Optional: Check if user is owner or admin
      // if (req.user?.role !== 'admin' && vehicle.owner?.toString() !== req.user?._id.toString()) {
      //   return res.status(403).json({
      //     success: false,
      //     message: 'Not authorized to delete this vehicle'
      //   });
      // }
      
      // Delete the vehicle
      await Vehicle.findByIdAndDelete(id);
      
      res.json({
        success: true,
        message: 'Vehicle deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error while deleting vehicle',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  },
  
  /**
   * Get vehicles by type (stock or auction)
   */
  async getVehiclesByType(req: Request, res: Response) {
    try {
      const { type } = req.params;
      
      if (!['stock', 'auction'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid vehicle type. Must be "stock" or "auction"'
        });
      }
      
      const vehicles = await Vehicle.find({ type })
        .sort({ createdAt: -1 });
      
      res.json({
        success: true,
        count: vehicles.length,
        data: vehicles
      });
    } catch (error) {
      console.error(`Error fetching ${req.params.type} vehicles:`, error);
      res.status(500).json({ 
        success: false, 
        message: `Server error while fetching ${req.params.type} vehicles`,
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  }
};
