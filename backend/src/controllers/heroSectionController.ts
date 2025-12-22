import { Request, Response } from 'express';
import HeroSection from '../models/HeroSection';
import { handleApiError } from '../utils/errorHandler';

export const heroSectionController = {
  // Get all hero sections
  getAllHeroSections: async (req: Request, res: Response) => {
    try {
      const heroSections = await HeroSection.find().sort({ createdAt: -1 });
      
      return res.status(200).json({
        success: true,
        count: heroSections.length,
        data: heroSections
      });
    } catch (error) {
      return handleApiError(res, error);
    }
  },

  // Get active hero section
  getActiveHeroSection: async (req: Request, res: Response) => {
    try {
      const activeHeroSection = await HeroSection.findOne({ isActive: true });
      
      if (!activeHeroSection) {
        // If no active hero section, get the most recent one
        const latestHeroSection = await HeroSection.findOne().sort({ createdAt: -1 });
        
        if (!latestHeroSection) {
          return res.status(404).json({
            success: false,
            message: 'No hero sections found'
          });
        }
        
        return res.status(200).json({
          success: true,
          data: latestHeroSection
        });
      }
      
      return res.status(200).json({
        success: true,
        data: activeHeroSection
      });
    } catch (error) {
      return handleApiError(res, error);
    }
  },

  // Get hero section by ID
  getHeroSectionById: async (req: Request, res: Response) => {
    try {
      // Validate ID parameter
      const { id } = req.params;
      
      if (!id || id === 'undefined') {
        return res.status(400).json({
          success: false,
          message: 'Invalid hero section ID provided'
        });
      }
      
      const heroSection = await HeroSection.findById(id);
      
      if (!heroSection) {
        return res.status(404).json({
          success: false,
          message: 'Hero section not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: heroSection
      });
    } catch (error) {
      return handleApiError(res, error);
    }
  },

  // Create a new hero section
  createHeroSection: async (req: Request, res: Response) => {
    try {
      const { imageUrl, title, subtitle, tagline, isActive } = req.body;
      
      // Create new hero section
      const heroSection = new HeroSection({
        imageUrl,
        title,
        subtitle,
        tagline,
        isActive: isActive || false
      });
      
      // Save to database
      await heroSection.save();
      
      return res.status(201).json({
        success: true,
        message: 'Hero section created successfully',
        data: heroSection
      });
    } catch (error) {
      return handleApiError(res, error);
    }
  },

  // Update a hero section
  updateHeroSection: async (req: Request, res: Response) => {
    try {
      // Validate ID parameter
      const { id } = req.params;
      
      if (!id || id === 'undefined') {
        return res.status(400).json({
          success: false,
          message: 'Invalid hero section ID provided'
        });
      }
      
      const { 
        imageUrl, 
        title, 
        subtitle, 
        tagline, 
        isActive,
        imagePosition,
        backgroundSize,
        imageWidth,
        imageHeight 
      } = req.body;
      
      // Find hero section by ID
      const heroSection = await HeroSection.findById(id);
      
      if (!heroSection) {
        return res.status(404).json({
          success: false,
          message: 'Hero section not found'
        });
      }
      
      // Update fields
      if (imageUrl !== undefined) heroSection.imageUrl = imageUrl;
      if (title !== undefined) heroSection.title = title;
      if (subtitle !== undefined) heroSection.subtitle = subtitle;
      if (tagline !== undefined) heroSection.tagline = tagline;
      if (isActive !== undefined) heroSection.isActive = isActive;
      if (imagePosition !== undefined) heroSection.imagePosition = imagePosition;
      if (backgroundSize !== undefined) heroSection.backgroundSize = backgroundSize;
      if (imageWidth !== undefined) heroSection.imageWidth = imageWidth;
      if (imageHeight !== undefined) heroSection.imageHeight = imageHeight;
      
      // Save changes
      await heroSection.save();
      
      return res.status(200).json({
        success: true,
        message: 'Hero section updated successfully',
        data: heroSection
      });
    } catch (error) {
      return handleApiError(res, error);
    }
  },

  // Set a hero section as active
  setActiveHeroSection: async (req: Request, res: Response) => {
    try {
      // Validate ID parameter
      const { id } = req.params;
      
      if (!id || id === 'undefined') {
        return res.status(400).json({
          success: false,
          message: 'Invalid hero section ID provided'
        });
      }
      
      // Find hero section by ID
      const heroSection = await HeroSection.findById(id);
      
      if (!heroSection) {
        return res.status(404).json({
          success: false,
          message: 'Hero section not found'
        });
      }
      
      // Deactivate all other hero sections
      await HeroSection.updateMany(
        { _id: { $ne: heroSection._id } },
        { isActive: false }
      );
      
      // Set this one as active
      heroSection.isActive = true;
      await heroSection.save();
      
      return res.status(200).json({
        success: true,
        message: 'Hero section set as active',
        data: heroSection
      });
    } catch (error) {
      return handleApiError(res, error);
    }
  },

  // Delete a hero section
  deleteHeroSection: async (req: Request, res: Response) => {
    try {
      // Validate ID parameter
      const { id } = req.params;
      
      if (!id || id === 'undefined') {
        return res.status(400).json({
          success: false,
          message: 'Invalid hero section ID provided'
        });
      }
      
      const heroSection = await HeroSection.findById(id);
      
      if (!heroSection) {
        return res.status(404).json({
          success: false,
          message: 'Hero section not found'
        });
      }
      
      await heroSection.deleteOne();
      
      return res.status(200).json({
        success: true,
        message: 'Hero section deleted successfully'
      });
    } catch (error) {
      return handleApiError(res, error);
    }
  }
};
