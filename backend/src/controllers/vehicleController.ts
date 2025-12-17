import { Request, Response } from 'express';
import { Vehicle } from '../models/Vehicle';
import { VehicleValidation } from '../models/Vehicle';
import mongoose from 'mongoose';
import { isR2Url, deleteFileFromR2 } from '../services/storageService';

export const vehicleController = {
  /**
   * Get all vehicles
   */
  async getAllVehicles(req: Request, res: Response) {
    try {
      const { type, status, make, model, year, minPrice, maxPrice, sort, slug } = req.query;
      
      // Build filter object
      const filter: any = {};
      
      // Filter by slug (exact match or case-insensitive)
      if (slug) {
        // Try exact match first
        const exactMatchFilter = { ...filter, slug };
        const exactMatch = await Vehicle.findOne(exactMatchFilter);
        
        if (exactMatch) {
          // If we found an exact match, return just that vehicle
          return res.json({
            success: true,
            count: 1,
            data: [exactMatch]
          });
        }
        
        // If no exact match, try case-insensitive
        filter.slug = { $regex: new RegExp(`^${slug}$`, 'i') };
      }
      
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
        .populate('makeId', 'name slug')
        .populate('modelId', 'name slug')
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
      
      const vehicle = await Vehicle.findById(id)
        .populate('makeId', 'name slug')
        .populate('modelId', 'name slug');
      
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
      
      // Find or create Make
      let makeId = vehicleData.makeId;
      if (!makeId && vehicleData.make) {
        // Try to find existing make
        const existingMake = await mongoose.model('Make').findOne({
          name: { $regex: new RegExp(`^${vehicleData.make}$`, 'i') }
        });
        
        if (existingMake) {
          makeId = existingMake._id;
          // Update to use consistent capitalization
          vehicleData.make = existingMake.name;
        } else {
          // Create new make
          const newMake = await mongoose.model('Make').create({
            name: vehicleData.make,
            slug: vehicleData.make.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
          });
          makeId = newMake._id;
        }
        vehicleData.makeId = makeId;
      }
      
      // Find or create Model
      let modelId = vehicleData.modelId;
      if (!modelId && vehicleData.model && makeId) {
        // Try to find existing model
        const existingModel = await mongoose.model('Model').findOne({
          make: makeId,
          name: { $regex: new RegExp(`^${vehicleData.model}$`, 'i') }
        });
        
        if (existingModel) {
          modelId = existingModel._id;
          // Update to use consistent capitalization
          vehicleData.model = existingModel.name;
        } else {
          // Create new model
          const newModel = await mongoose.model('Model').create({
            name: vehicleData.model,
            make: makeId,
            slug: vehicleData.model.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
          });
          modelId = newModel._id;
        }
        vehicleData.modelId = modelId;
      }
      
      // Create slug from make, model and year
      // Normalize the slug: lowercase, replace spaces with hyphens, remove special characters
      vehicleData.slug = `${vehicleData.make}-${vehicleData.model}-${vehicleData.year}`
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '');
        
      // Check if slug already exists
      const existingVehicleWithSlug = await Vehicle.findOne({ slug: vehicleData.slug });
      if (existingVehicleWithSlug) {
        // If slug exists, append a unique identifier (timestamp)
        const timestamp = Date.now().toString().slice(-6);
        vehicleData.slug = `${vehicleData.slug}-${timestamp}`;
      }
      
      // Handle image URLs
      // Images should now be uploaded separately via the upload API
      // and their URLs passed in the vehicleData
      if (vehicleData.images && Array.isArray(vehicleData.images)) {
        // Filter out any blob URLs (these should have been uploaded separately)
        vehicleData.images = vehicleData.images.filter((img: string) => !img.startsWith('blob:'));
        
        // If no valid images, use a default placeholder
        if (vehicleData.images.length === 0) {
          vehicleData.images = ['/cars/placeholder.png'];
        }
      } else {
        // Ensure images is always an array
        vehicleData.images = ['/cars/placeholder.png'];
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
      
      // Check for MongoDB duplicate key error (code 11000)
      if (error instanceof mongoose.Error.ValidationError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          error: error.message
        });
      }
      
      // Handle duplicate key errors
      if ((error as any).code === 11000) {
        const duplicateField = Object.keys((error as any).keyPattern)[0];
        let errorMessage = 'Duplicate entry detected';
        
        if (duplicateField === 'stockNumber') {
          errorMessage = 'A vehicle with this stock number already exists';
        } else if (duplicateField === 'vin') {
          errorMessage = 'A vehicle with this VIN already exists';
        }
        
        return res.status(409).json({
          success: false,
          message: errorMessage,
          field: duplicateField
        });
      }
      
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
      
      // Handle make update
      if (updates.make && (!updates.makeId || updates.make !== vehicle.make)) {
        // Try to find existing make
        const existingMake = await mongoose.model('Make').findOne({
          name: { $regex: new RegExp(`^${updates.make}$`, 'i') }
        });
        
        if (existingMake) {
          updates.makeId = existingMake._id;
          // Update to use consistent capitalization
          updates.make = existingMake.name;
        } else {
          // Create new make
          const newMake = await mongoose.model('Make').create({
            name: updates.make,
            slug: updates.make.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
          });
          updates.makeId = newMake._id;
        }
      }
      
      // Handle model update
      if (updates.model && (!updates.modelId || updates.model !== vehicle.model)) {
        const makeId = updates.makeId || vehicle.makeId;
        
        if (makeId) {
          // Try to find existing model
          const existingModel = await mongoose.model('Model').findOne({
            make: makeId,
            name: { $regex: new RegExp(`^${updates.model}$`, 'i') }
          });
          
          if (existingModel) {
            updates.modelId = existingModel._id;
            // Update to use consistent capitalization
            updates.model = existingModel.name;
          } else {
            // Create new model
            const newModel = await mongoose.model('Model').create({
              name: updates.model,
              make: makeId,
              slug: updates.model.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
            });
            updates.modelId = newModel._id;
          }
        }
      }
      
      // Update slug if make or model changed
      if (updates.make || updates.model || updates.year) {
        const make = updates.make || vehicle.make;
        const model = updates.model || vehicle.model;
        const year = updates.year || vehicle.year;
        
        // Normalize the slug: lowercase, replace spaces with hyphens, remove special characters
        const newSlug = `${make}-${model}-${year}`
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]+/g, '');
        
        // Only update slug if it's different from the current one
        if (newSlug !== (vehicle as any).slug) {
          // Check if slug already exists on another vehicle
          const existingVehicleWithSlug = await Vehicle.findOne({ 
            _id: { $ne: vehicle._id },
            slug: newSlug 
          });
          
          if (existingVehicleWithSlug) {
            // If slug exists, append a unique identifier (timestamp)
            const timestamp = Date.now().toString().slice(-6);
            updates.slug = `${newSlug}-${timestamp}`;
          } else {
            updates.slug = newSlug;
          }
        }
      }
      
      // Handle image URLs
      if (updates.images && Array.isArray(updates.images)) {
        // Filter out any blob URLs (these should have been uploaded separately)
        updates.images = updates.images.filter((img: string) => !img.startsWith('blob:'));
        
        // If no valid images, use a default placeholder
        if (updates.images.length === 0) {
          updates.images = ['/cars/placeholder.png'];
        }
        
        // Delete old images from R2 if they're being replaced
        if (vehicle.images && Array.isArray(vehicle.images)) {
          // Find images that are in the old array but not in the new array
          const imagesToDelete = vehicle.images.filter(
            (oldImg: string) => 
              isR2Url(oldImg) && 
              !updates.images.includes(oldImg)
          );
          
          // Delete each image from R2 storage
          Promise.all(imagesToDelete.map(img => deleteFileFromR2(img)))
            .catch(err => console.error('Error deleting old images:', err));
        }
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
      
      // Check for MongoDB duplicate key error (code 11000)
      if (error instanceof mongoose.Error.ValidationError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          error: error.message
        });
      }
      
      // Handle duplicate key errors
      if ((error as any).code === 11000) {
        const duplicateField = Object.keys((error as any).keyPattern)[0];
        let errorMessage = 'Duplicate entry detected';
        
        if (duplicateField === 'stockNumber') {
          errorMessage = 'A vehicle with this stock number already exists';
        } else if (duplicateField === 'vin') {
          errorMessage = 'A vehicle with this VIN already exists';
        }
        
        return res.status(409).json({
          success: false,
          message: errorMessage,
          field: duplicateField
        });
      }
      
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
      
      // Delete images from R2 storage
      if (vehicle.images && Array.isArray(vehicle.images)) {
        const r2Images = vehicle.images.filter(img => isR2Url(img));
        if (r2Images.length > 0) {
          Promise.all(r2Images.map(img => deleteFileFromR2(img)))
            .catch(err => console.error('Error deleting images from R2:', err));
        }
      }

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
        .populate('makeId', 'name slug')
        .populate('modelId', 'name slug')
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
