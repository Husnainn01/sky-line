import { Request, Response } from 'express';
import { Bookmark, bookmarkValidationSchema } from '../models/Bookmark';
import { Vehicle } from '../models/Vehicle';
import mongoose from 'mongoose';

export const bookmarkController = {
  /**
   * Get all bookmarks for a user
   */
  async getUserBookmarks(req: Request, res: Response) {
    try {
      const userId = req.params.userId || (req as any).user?.id;
      
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }
      
      // Find all bookmarks for this user and populate vehicle details
      const bookmarks = await Bookmark.find({ user: userId })
        .populate('vehicle')
        .sort({ createdAt: -1 });
      
      res.json({
        success: true,
        bookmarks
      });
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error while fetching bookmarks',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  },
  
  /**
   * Add a bookmark
   */
  async addBookmark(req: Request, res: Response) {
    try {
      const { vehicleId, notes } = req.body;
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      if (!vehicleId) {
        return res.status(400).json({ message: 'Vehicle ID is required' });
      }
      
      // Validate that the vehicle exists
      const vehicle = await Vehicle.findById(vehicleId);
      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }
      
      try {
        // Validate the data
        bookmarkValidationSchema.parse({
          user: userId,
          vehicle: vehicleId,
          notes: notes || ''
        });
      } catch (validationError) {
        return res.status(400).json({ 
          message: 'Invalid bookmark data',
          error: validationError
        });
      }
      
      // Check if bookmark already exists
      const existingBookmark = await Bookmark.findOne({ user: userId, vehicle: vehicleId });
      if (existingBookmark) {
        return res.status(400).json({ message: 'Vehicle already bookmarked' });
      }
      
      // Create the bookmark
      const bookmark = new Bookmark({
        user: userId,
        vehicle: vehicleId,
        notes: notes || ''
      });
      
      await bookmark.save();
      
      // Return the bookmark with populated vehicle
      const populatedBookmark = await Bookmark.findById(bookmark._id).populate('vehicle');
      
      res.status(201).json({
        success: true,
        bookmark: populatedBookmark,
        message: 'Vehicle bookmarked successfully'
      });
    } catch (error) {
      console.error('Error adding bookmark:', error);
      
      // Handle duplicate key error (user already bookmarked this vehicle)
      if ((error as any).code === 11000) {
        return res.status(400).json({ message: 'Vehicle already bookmarked' });
      }
      
      res.status(500).json({ 
        success: false, 
        message: 'Server error while adding bookmark',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  },
  
  /**
   * Remove a bookmark
   */
  async removeBookmark(req: Request, res: Response) {
    try {
      const { bookmarkId } = req.params;
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      if (!bookmarkId) {
        return res.status(400).json({ message: 'Bookmark ID is required' });
      }
      
      // Find the bookmark and ensure it belongs to the user
      const bookmark = await Bookmark.findOne({ _id: bookmarkId, user: userId });
      
      if (!bookmark) {
        return res.status(404).json({ message: 'Bookmark not found' });
      }
      
      // Delete the bookmark
      await Bookmark.findByIdAndDelete(bookmarkId);
      
      res.json({
        success: true,
        message: 'Bookmark removed successfully'
      });
    } catch (error) {
      console.error('Error removing bookmark:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error while removing bookmark',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  },
  
  /**
   * Update bookmark notes
   */
  async updateBookmarkNotes(req: Request, res: Response) {
    try {
      const { bookmarkId } = req.params;
      const { notes } = req.body;
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      if (!bookmarkId) {
        return res.status(400).json({ message: 'Bookmark ID is required' });
      }
      
      // Find the bookmark and ensure it belongs to the user
      const bookmark = await Bookmark.findOne({ _id: bookmarkId, user: userId });
      
      if (!bookmark) {
        return res.status(404).json({ message: 'Bookmark not found' });
      }
      
      // Update the notes
      bookmark.notes = notes || '';
      await bookmark.save();
      
      // Return the updated bookmark with populated vehicle
      const updatedBookmark = await Bookmark.findById(bookmarkId).populate('vehicle');
      
      res.json({
        success: true,
        bookmark: updatedBookmark,
        message: 'Bookmark notes updated successfully'
      });
    } catch (error) {
      console.error('Error updating bookmark notes:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error while updating bookmark notes',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  }
};
