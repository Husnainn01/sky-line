import { Request, Response } from 'express';
import FAQ from '../models/FAQ';
import { handleApiError } from '../utils/errorHandler';

export const faqController = {
  // Get all FAQs
  getAllFAQs: async (req: Request, res: Response) => {
    try {
      const faqs = await FAQ.find().sort({ order: 1, createdAt: -1 });
      
      return res.status(200).json({
        success: true,
        count: faqs.length,
        data: faqs
      });
    } catch (error) {
      return handleApiError(res, error);
    }
  },

  // Get active FAQs
  getActiveFAQs: async (req: Request, res: Response) => {
    try {
      const faqs = await FAQ.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
      
      return res.status(200).json({
        success: true,
        count: faqs.length,
        data: faqs
      });
    } catch (error) {
      return handleApiError(res, error);
    }
  },

  // Get FAQ by ID
  getFAQById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (!id || id === 'undefined') {
        return res.status(400).json({
          success: false,
          message: 'Invalid FAQ ID provided'
        });
      }
      
      const faq = await FAQ.findById(id);
      
      if (!faq) {
        return res.status(404).json({
          success: false,
          message: 'FAQ not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: faq
      });
    } catch (error) {
      return handleApiError(res, error);
    }
  },

  // Create a new FAQ
  createFAQ: async (req: Request, res: Response) => {
    try {
      const { question, answer, category, order, isActive } = req.body;
      
      const faq = new FAQ({
        question,
        answer,
        category,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true
      });
      
      await faq.save();
      
      return res.status(201).json({
        success: true,
        message: 'FAQ created successfully',
        data: faq
      });
    } catch (error) {
      return handleApiError(res, error);
    }
  },

  // Update a FAQ
  updateFAQ: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (!id || id === 'undefined') {
        return res.status(400).json({
          success: false,
          message: 'Invalid FAQ ID provided'
        });
      }
      
      const { question, answer, category, order, isActive } = req.body;
      
      const faq = await FAQ.findById(id);
      
      if (!faq) {
        return res.status(404).json({
          success: false,
          message: 'FAQ not found'
        });
      }
      
      if (question !== undefined) faq.question = question;
      if (answer !== undefined) faq.answer = answer;
      if (category !== undefined) faq.category = category;
      if (order !== undefined) faq.order = order;
      if (isActive !== undefined) faq.isActive = isActive;
      
      await faq.save();
      
      return res.status(200).json({
        success: true,
        message: 'FAQ updated successfully',
        data: faq
      });
    } catch (error) {
      return handleApiError(res, error);
    }
  },

  // Delete a FAQ
  deleteFAQ: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (!id || id === 'undefined') {
        return res.status(400).json({
          success: false,
          message: 'Invalid FAQ ID provided'
        });
      }
      
      const faq = await FAQ.findById(id);
      
      if (!faq) {
        return res.status(404).json({
          success: false,
          message: 'FAQ not found'
        });
      }
      
      await faq.deleteOne();
      
      return res.status(200).json({
        success: true,
        message: 'FAQ deleted successfully'
      });
    } catch (error) {
      return handleApiError(res, error);
    }
  }
};
