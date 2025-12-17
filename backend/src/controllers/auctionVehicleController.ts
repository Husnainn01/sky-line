import { Request, Response } from 'express';
import { AuctionVehicle } from '../models/AuctionVehicle';
import mongoose from 'mongoose';
import { isR2Url, deleteFileFromR2 } from '../services/storageService';

export const auctionVehicleController = {
  /**
   * Get all auction vehicles
   */
  async getAllAuctionVehicles(req: Request, res: Response) {
    try {
      const { make, model, year, status, exclude, limit } = req.query;
      
      // Build filter object
      const filter: any = {};
      
      // Filter by make
      if (make) filter.make = { $regex: make, $options: 'i' };
      
      // Filter by model
      if (model) filter.model = { $regex: model, $options: 'i' };
      
      // Filter by year
      if (year) filter.year = year;
      
      // Filter by status
      if (status) {
        const now = new Date();
        
        if (status === 'upcoming') {
          filter.auctionStartDate = { $gt: now };
        } else if (status === 'live') {
          filter.auctionStartDate = { $lte: now };
          filter.auctionEndDate = { $gt: now };
        } else if (status === 'past') {
          filter.auctionEndDate = { $lte: now };
        }
      }
      
      // Exclude specific auction vehicle
      if (exclude) {
        if (mongoose.Types.ObjectId.isValid(exclude as string)) {
          filter._id = { $ne: exclude };
        }
      }
      
      // Build sort object
      const sortOptions: any = { createdAt: -1 }; // Default sort by newest
      
      // Limit results
      const limitValue = limit ? parseInt(limit as string) : 100;
      
      const auctionVehicles = await AuctionVehicle.find(filter)
        .sort(sortOptions)
        .limit(limitValue);
      
      res.json({
        success: true,
        count: auctionVehicles.length,
        data: auctionVehicles
      });
    } catch (error) {
      console.error('Error fetching auction vehicles:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error while fetching auction vehicles',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  },
  
  /**
   * Get a single auction vehicle by ID
   */
  async getAuctionVehicleById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid auction vehicle ID format'
        });
      }
      
      const auctionVehicle = await AuctionVehicle.findById(id);
      
      if (!auctionVehicle) {
        return res.status(404).json({
          success: false,
          message: 'Auction vehicle not found'
        });
      }
      
      res.json({
        success: true,
        data: auctionVehicle
      });
    } catch (error) {
      console.error('Error fetching auction vehicle:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error while fetching auction vehicle',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  },
  
  /**
   * Get auction vehicle by slug
   */
  async getAuctionVehicleBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      
      const auctionVehicle = await AuctionVehicle.findOne({ slug });
      
      if (!auctionVehicle) {
        return res.status(404).json({
          success: false,
          message: 'Auction vehicle not found'
        });
      }
      
      res.json({
        success: true,
        data: auctionVehicle
      });
    } catch (error) {
      console.error('Error fetching auction vehicle by slug:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error while fetching auction vehicle',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  },
  
  /**
   * Get auction vehicles by status
   */
  async getAuctionVehiclesByStatus(req: Request, res: Response) {
    try {
      const { status } = req.params;
      
      if (!['upcoming', 'live', 'past'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be "upcoming", "live", or "past"'
        });
      }
      
      const now = new Date();
      let filter: any = {};
      
      if (status === 'upcoming') {
        filter = { auctionStartDate: { $gt: now } };
      } else if (status === 'live') {
        filter = {
          auctionStartDate: { $lte: now },
          auctionEndDate: { $gt: now }
        };
      } else if (status === 'past') {
        filter = { auctionEndDate: { $lte: now } };
      }
      
      const auctionVehicles = await AuctionVehicle.find(filter)
        .sort({ auctionStartDate: status === 'upcoming' ? 1 : -1 });
      
      res.json({
        success: true,
        count: auctionVehicles.length,
        data: auctionVehicles
      });
    } catch (error) {
      console.error(`Error fetching ${req.params.status} auction vehicles:`, error);
      res.status(500).json({ 
        success: false, 
        message: `Server error while fetching ${req.params.status} auction vehicles`,
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  },
  
  /**
   * Create a new auction vehicle
   */
  async createAuctionVehicle(req: Request, res: Response) {
    try {
      const auctionVehicleData = req.body;
      
      // Add owner if authenticated
      if (req.user?._id) {
        auctionVehicleData.owner = req.user._id;
      }
      
      // Handle empty string for auctionSoldStatus
      if (auctionVehicleData.auctionSoldStatus === '') {
        auctionVehicleData.auctionSoldStatus = undefined;
      }
      
      // Create slug from make, model and year if not provided
      if (!auctionVehicleData.slug) {
        // Normalize the slug: lowercase, replace spaces with hyphens, remove special characters
        auctionVehicleData.slug = `${auctionVehicleData.make}-${auctionVehicleData.model}-${auctionVehicleData.year}`
          .toLowerCase()
          .replace(/\\s+/g, '-')
          .replace(/[^\\w-]+/g, '');
      }
      
      // Check if slug already exists
      const existingVehicleWithSlug = await AuctionVehicle.findOne({ slug: auctionVehicleData.slug });
      if (existingVehicleWithSlug) {
        // If slug exists, append a unique identifier (timestamp)
        const timestamp = Date.now().toString().slice(-6);
        auctionVehicleData.slug = `${auctionVehicleData.slug}-${timestamp}`;
      }
      
      // Handle image URLs
      // Images should now be uploaded separately via the upload API
      // and their URLs passed in the auctionVehicleData
      if (auctionVehicleData.images && Array.isArray(auctionVehicleData.images)) {
        // Filter out any blob URLs (these should have been uploaded separately)
        auctionVehicleData.images = auctionVehicleData.images.filter((img: string) => !img.startsWith('blob:'));
        
        // If no valid images, use a default placeholder
        if (auctionVehicleData.images.length === 0) {
          auctionVehicleData.images = ['/cars/placeholder.png'];
        }
      } else {
        // Ensure images is always an array
        auctionVehicleData.images = ['/cars/placeholder.png'];
      }
      
      // Create new auction vehicle
      const auctionVehicle = new AuctionVehicle(auctionVehicleData);
      await auctionVehicle.save();
      
      res.status(201).json({
        success: true,
        message: 'Auction vehicle created successfully',
        data: auctionVehicle
      });
    } catch (error) {
      console.error('Error creating auction vehicle:', error);
      
      // Check for MongoDB validation error
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
        
        return res.status(409).json({
          success: false,
          message: `A vehicle with this ${duplicateField} already exists`,
          field: duplicateField
        });
      }
      
      res.status(500).json({ 
        success: false, 
        message: 'Server error while creating auction vehicle',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  },
  
  /**
   * Update an auction vehicle
   */
  async updateAuctionVehicle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      // Handle empty string for auctionSoldStatus
      if (updates.auctionSoldStatus === '') {
        updates.auctionSoldStatus = undefined;
      }
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid auction vehicle ID format'
        });
      }
      
      // Find auction vehicle first to check if it exists
      const auctionVehicle = await AuctionVehicle.findById(id);
      
      if (!auctionVehicle) {
        return res.status(404).json({
          success: false,
          message: 'Auction vehicle not found'
        });
      }
      
      // Update slug if make, model, or year changed
      if (updates.make || updates.model || updates.year) {
        const make = updates.make || auctionVehicle.make;
        const model = updates.model || auctionVehicle.model;
        const year = updates.year || auctionVehicle.year;
        
        // Normalize the slug: lowercase, replace spaces with hyphens, remove special characters
        const newSlug = `${make}-${model}-${year}`
          .toLowerCase()
          .replace(/\\s+/g, '-')
          .replace(/[^\\w-]+/g, '');
        
        // Only update slug if it's different from the current one
        if (newSlug !== auctionVehicle.slug) {
          // Check if slug already exists on another vehicle
          const existingVehicleWithSlug = await AuctionVehicle.findOne({ 
            _id: { $ne: auctionVehicle._id },
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
        if (auctionVehicle.images && Array.isArray(auctionVehicle.images)) {
          // Find images that are in the old array but not in the new array
          const imagesToDelete = auctionVehicle.images.filter(
            (oldImg: string) => 
              isR2Url(oldImg) && 
              !updates.images.includes(oldImg)
          );
          
          // Delete each image from R2 storage
          Promise.all(imagesToDelete.map(img => deleteFileFromR2(img)))
            .catch(err => console.error('Error deleting old images:', err));
        }
      }
      
      // Update the auction vehicle
      const updatedAuctionVehicle = await AuctionVehicle.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
      
      res.json({
        success: true,
        message: 'Auction vehicle updated successfully',
        data: updatedAuctionVehicle
      });
    } catch (error) {
      console.error('Error updating auction vehicle:', error);
      
      // Check for MongoDB validation error
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
        
        return res.status(409).json({
          success: false,
          message: `A vehicle with this ${duplicateField} already exists`,
          field: duplicateField
        });
      }
      
      res.status(500).json({ 
        success: false, 
        message: 'Server error while updating auction vehicle',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  },
  
  /**
   * Delete an auction vehicle
   */
  async deleteAuctionVehicle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid auction vehicle ID format'
        });
      }
      
      // Find auction vehicle first to check if it exists
      const auctionVehicle = await AuctionVehicle.findById(id);
      
      if (!auctionVehicle) {
        return res.status(404).json({
          success: false,
          message: 'Auction vehicle not found'
        });
      }
      
      // Delete images from R2 storage
      if (auctionVehicle.images && Array.isArray(auctionVehicle.images)) {
        const r2Images = auctionVehicle.images.filter(img => isR2Url(img));
        if (r2Images.length > 0) {
          Promise.all(r2Images.map(img => deleteFileFromR2(img)))
            .catch(err => console.error('Error deleting images from R2:', err));
        }
      }

      // Delete the auction vehicle
      await AuctionVehicle.findByIdAndDelete(id);
      
      res.json({
        success: true,
        message: 'Auction vehicle deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting auction vehicle:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error while deleting auction vehicle',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  },
  
  /**
   * Place a bid on an auction vehicle
   */
  async placeBid(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { amount } = req.body;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid auction vehicle ID format'
        });
      }
      
      if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Valid bid amount is required'
        });
      }
      
      // Find auction vehicle
      const auctionVehicle = await AuctionVehicle.findById(id);
      
      if (!auctionVehicle) {
        return res.status(404).json({
          success: false,
          message: 'Auction vehicle not found'
        });
      }
      
      // Check if auction is active
      const now = new Date();
      if (now < auctionVehicle.auctionStartDate) {
        return res.status(400).json({
          success: false,
          message: 'Auction has not started yet'
        });
      }
      
      if (now > auctionVehicle.auctionEndDate) {
        return res.status(400).json({
          success: false,
          message: 'Auction has already ended'
        });
      }
      
      // Check if bid amount is higher than current bid
      if (auctionVehicle.auctionCurrentBid && amount <= auctionVehicle.auctionCurrentBid) {
        return res.status(400).json({
          success: false,
          message: 'Bid amount must be higher than current bid'
        });
      }
      
      // Check if bid amount is higher than starting bid
      if (!auctionVehicle.auctionCurrentBid && amount < auctionVehicle.auctionStartingBid) {
        return res.status(400).json({
          success: false,
          message: 'Bid amount must be at least the starting bid'
        });
      }
      
      // Create new bid
      const newBid = {
        amount,
        bidder: req.user?._id || null,
        timestamp: new Date()
      };
      
      // Update auction vehicle with new bid
      const updatedAuctionVehicle = await AuctionVehicle.findByIdAndUpdate(
        id,
        { 
          $push: { bids: newBid },
          auctionCurrentBid: amount,
          updatedAt: new Date()
        },
        { new: true }
      );
      
      res.json({
        success: true,
        message: 'Bid placed successfully',
        data: updatedAuctionVehicle
      });
    } catch (error) {
      console.error('Error placing bid:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error while placing bid',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  },
  
  /**
   * Get bid history for an auction vehicle
   */
  async getBidHistory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid auction vehicle ID format'
        });
      }
      
      // Find auction vehicle
      const auctionVehicle = await AuctionVehicle.findById(id)
        .populate('bids.bidder', 'name email');
      
      if (!auctionVehicle) {
        return res.status(404).json({
          success: false,
          message: 'Auction vehicle not found'
        });
      }
      
      res.json({
        success: true,
        data: auctionVehicle.bids || []
      });
    } catch (error) {
      console.error('Error fetching bid history:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error while fetching bid history',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  }
};
