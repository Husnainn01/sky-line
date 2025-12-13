import { Request, Response } from 'express';
import { Make } from '../models/Make';
import { MakeValidation } from '../models/Make';
import { Model } from '../models/Model';
import mongoose from 'mongoose';

export const makeController = {
  /**
   * Get all makes
   */
  async getAllMakes(req: Request, res: Response) {
    try {
      const { search, sort, active } = req.query;
      
      // Build filter object
      const filter: any = {};
      
      // Filter by active status if provided
      if (active !== undefined) {
        filter.active = active === 'true';
      }
      
      // Add text search if provided
      if (search) {
        filter.$text = { $search: search as string };
      }
      
      // Build sort object
      let sortOptions: any = { name: 1 }; // Default sort by name
      
      if (sort) {
        const [field, order] = (sort as string).split(':');
        sortOptions = { [field]: order === 'desc' ? -1 : 1 };
      }
      
      const makes = await Make.find(filter).sort(sortOptions);
      
      res.json({
        success: true,
        count: makes.length,
        data: makes
      });
    } catch (error) {
      console.error('Error fetching makes:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error while fetching makes',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  },
  
  /**
   * Get a single make by ID
   */
  async getMakeById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid make ID format'
        });
      }
      
      const make = await Make.findById(id);
      
      if (!make) {
        return res.status(404).json({
          success: false,
          message: 'Make not found'
        });
      }
      
      res.json({
        success: true,
        data: make
      });
    } catch (error) {
      console.error('Error fetching make:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error while fetching make',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  },
  
  /**
   * Create a new make
   */
  async createMake(req: Request, res: Response) {
    try {
      const makeData = req.body;
      
      // Generate slug if not provided
      if (!makeData.slug) {
        makeData.slug = makeData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
      }
      
      // Validate make data
      try {
        MakeValidation.parse(makeData);
      } catch (validationError: any) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: validationError.errors
        });
      }
      
      // Check if make with same name already exists (case-insensitive)
      const existingMake = await Make.findOne({
        name: { $regex: new RegExp(`^${makeData.name}$`, 'i') }
      });
      
      if (existingMake) {
        return res.status(409).json({
          success: false,
          message: 'A make with this name already exists',
          data: existingMake
        });
      }
      
      // Create new make
      const make = new Make(makeData);
      await make.save();
      
      res.status(201).json({
        success: true,
        message: 'Make created successfully',
        data: make
      });
    } catch (error) {
      console.error('Error creating make:', error);
      
      // Check for MongoDB duplicate key error (code 11000)
      if ((error as any).code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'A make with this name or slug already exists',
        });
      }
      
      res.status(500).json({ 
        success: false, 
        message: 'Server error while creating make',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  },
  
  /**
   * Update a make
   */
  async updateMake(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid make ID format'
        });
      }
      
      // Find make first to check if it exists
      const make = await Make.findById(id);
      
      if (!make) {
        return res.status(404).json({
          success: false,
          message: 'Make not found'
        });
      }
      
      // If name is being updated, check for duplicates
      if (updates.name && updates.name !== make.name) {
        const existingMake = await Make.findOne({
          _id: { $ne: id },
          name: { $regex: new RegExp(`^${updates.name}$`, 'i') }
        });
        
        if (existingMake) {
          return res.status(409).json({
            success: false,
            message: 'A make with this name already exists',
            data: existingMake
          });
        }
      }
      
      // Generate slug if name is updated and slug is not provided
      if (updates.name && !updates.slug) {
        updates.slug = updates.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
      }
      
      // Update the make
      const updatedMake = await Make.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
      
      res.json({
        success: true,
        message: 'Make updated successfully',
        data: updatedMake
      });
    } catch (error) {
      console.error('Error updating make:', error);
      
      // Check for MongoDB duplicate key error (code 11000)
      if ((error as any).code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'A make with this name or slug already exists',
        });
      }
      
      res.status(500).json({ 
        success: false, 
        message: 'Server error while updating make',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  },
  
  /**
   * Delete a make
   */
  async deleteMake(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid make ID format'
        });
      }
      
      // Check if make exists
      const make = await Make.findById(id);
      
      if (!make) {
        return res.status(404).json({
          success: false,
          message: 'Make not found'
        });
      }
      
      // Check if there are any models associated with this make
      const modelsCount = await Model.countDocuments({ make: id });
      
      if (modelsCount > 0) {
        return res.status(409).json({
          success: false,
          message: `Cannot delete make: ${modelsCount} models are associated with this make. Please delete or reassign these models first.`,
          modelsCount
        });
      }
      
      // Delete the make
      await Make.findByIdAndDelete(id);
      
      res.json({
        success: true,
        message: 'Make deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting make:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error while deleting make',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  },
  
  /**
   * Get models for a specific make
   */
  async getModelsByMake(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid make ID format'
        });
      }
      
      // Check if make exists
      const make = await Make.findById(id);
      
      if (!make) {
        return res.status(404).json({
          success: false,
          message: 'Make not found'
        });
      }
      
      // Get all models for this make
      const models = await Model.find({ make: id }).sort({ name: 1 });
      
      res.json({
        success: true,
        count: models.length,
        data: models,
        make
      });
    } catch (error) {
      console.error('Error fetching models for make:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error while fetching models',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  }
};
