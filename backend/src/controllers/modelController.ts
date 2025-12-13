import { Request, Response } from 'express';
import { Model } from '../models/Model';
import { ModelValidation } from '../models/Model';
import { Make } from '../models/Make';
import { Vehicle } from '../models/Vehicle';
import mongoose from 'mongoose';

export const modelController = {
  /**
   * Get all models
   */
  async getAllModels(req: Request, res: Response) {
    try {
      const { search, make, sort, active } = req.query;
      
      // Build filter object
      const filter: any = {};
      
      // Filter by make if provided
      if (make) {
        if (!mongoose.Types.ObjectId.isValid(make as string)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid make ID format'
          });
        }
        filter.make = make;
      }
      
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
      
      // Get models with make information
      const models = await Model.find(filter)
        .populate('make', 'name slug')
        .sort(sortOptions);
      
      res.json({
        success: true,
        count: models.length,
        data: models
      });
    } catch (error) {
      console.error('Error fetching models:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error while fetching models',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  },
  
  /**
   * Get a single model by ID
   */
  async getModelById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid model ID format'
        });
      }
      
      const model = await Model.findById(id).populate('make', 'name slug');
      
      if (!model) {
        return res.status(404).json({
          success: false,
          message: 'Model not found'
        });
      }
      
      res.json({
        success: true,
        data: model
      });
    } catch (error) {
      console.error('Error fetching model:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error while fetching model',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  },
  
  /**
   * Create a new model
   */
  async createModel(req: Request, res: Response) {
    try {
      const modelData = req.body;
      
      // Check if make exists
      if (!mongoose.Types.ObjectId.isValid(modelData.make)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid make ID format'
        });
      }
      
      const make = await Make.findById(modelData.make);
      
      if (!make) {
        return res.status(404).json({
          success: false,
          message: 'Make not found'
        });
      }
      
      // Generate slug if not provided
      if (!modelData.slug) {
        modelData.slug = modelData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
      }
      
      // Validate model data
      try {
        ModelValidation.parse(modelData);
      } catch (validationError: any) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: validationError.errors
        });
      }
      
      // Check if model with same name already exists for this make (case-insensitive)
      const existingModel = await Model.findOne({
        make: modelData.make,
        name: { $regex: new RegExp(`^${modelData.name}$`, 'i') }
      });
      
      if (existingModel) {
        return res.status(409).json({
          success: false,
          message: 'A model with this name already exists for this make',
          data: existingModel
        });
      }
      
      // Create new model
      const model = new Model(modelData);
      await model.save();
      
      // Populate make info for response
      await model.populate('make', 'name slug');
      
      res.status(201).json({
        success: true,
        message: 'Model created successfully',
        data: model
      });
    } catch (error) {
      console.error('Error creating model:', error);
      
      // Check for MongoDB duplicate key error (code 11000)
      if ((error as any).code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'A model with this name already exists for this make',
        });
      }
      
      res.status(500).json({ 
        success: false, 
        message: 'Server error while creating model',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  },
  
  /**
   * Update a model
   */
  async updateModel(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid model ID format'
        });
      }
      
      // Find model first to check if it exists
      const model = await Model.findById(id);
      
      if (!model) {
        return res.status(404).json({
          success: false,
          message: 'Model not found'
        });
      }
      
      // If make is being updated, check if it exists
      if (updates.make && updates.make !== model.make.toString()) {
        if (!mongoose.Types.ObjectId.isValid(updates.make)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid make ID format'
          });
        }
        
        const make = await Make.findById(updates.make);
        
        if (!make) {
          return res.status(404).json({
            success: false,
            message: 'Make not found'
          });
        }
      }
      
      // If name is being updated, check for duplicates
      if ((updates.name && updates.name !== model.name) || 
          (updates.make && updates.make !== model.make.toString())) {
        const existingModel = await Model.findOne({
          _id: { $ne: id },
          make: updates.make || model.make,
          name: { $regex: new RegExp(`^${updates.name || model.name}$`, 'i') }
        });
        
        if (existingModel) {
          return res.status(409).json({
            success: false,
            message: 'A model with this name already exists for this make',
            data: existingModel
          });
        }
      }
      
      // Generate slug if name is updated and slug is not provided
      if (updates.name && !updates.slug) {
        updates.slug = updates.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
      }
      
      // Update the model
      const updatedModel = await Model.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).populate('make', 'name slug');
      
      res.json({
        success: true,
        message: 'Model updated successfully',
        data: updatedModel
      });
    } catch (error) {
      console.error('Error updating model:', error);
      
      // Check for MongoDB duplicate key error (code 11000)
      if ((error as any).code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'A model with this name already exists for this make',
        });
      }
      
      res.status(500).json({ 
        success: false, 
        message: 'Server error while updating model',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  },
  
  /**
   * Delete a model
   */
  async deleteModel(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid model ID format'
        });
      }
      
      // Check if model exists
      const model = await Model.findById(id);
      
      if (!model) {
        return res.status(404).json({
          success: false,
          message: 'Model not found'
        });
      }
      
      // Check if there are any vehicles associated with this model
      const vehiclesCount = await Vehicle.countDocuments({ 
        make: model.make,
        model: model.name
      });
      
      if (vehiclesCount > 0) {
        return res.status(409).json({
          success: false,
          message: `Cannot delete model: ${vehiclesCount} vehicles are associated with this model. Please delete or reassign these vehicles first.`,
          vehiclesCount
        });
      }
      
      // Delete the model
      await Model.findByIdAndDelete(id);
      
      res.json({
        success: true,
        message: 'Model deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting model:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error while deleting model',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  }
};
