import { Request, Response } from 'express';
import ShippingSchedule from '../models/ShippingSchedule';
import { handleApiError } from '../utils/errorHandler';

export const shippingScheduleController = {
  // Get all shipping schedules
  getAllShippingSchedules: async (req: Request, res: Response) => {
    try {
      const schedules = await ShippingSchedule.find()
        .sort({ departureDate: 1, order: 1 });
      
      return res.status(200).json({
        success: true,
        count: schedules.length,
        data: schedules
      });
    } catch (error) {
      return handleApiError(res, error);
    }
  },

  // Get active shipping schedules
  getActiveShippingSchedules: async (req: Request, res: Response) => {
    try {
      const currentDate = new Date();
      const schedules = await ShippingSchedule.find({
        isActive: true,
        departureDate: { $gte: currentDate }
      }).sort({ departureDate: 1, order: 1 });
      
      return res.status(200).json({
        success: true,
        count: schedules.length,
        data: schedules
      });
    } catch (error) {
      return handleApiError(res, error);
    }
  },

  // Get shipping schedule by ID
  getShippingScheduleById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (!id || id === 'undefined') {
        return res.status(400).json({
          success: false,
          message: 'Invalid shipping schedule ID provided'
        });
      }
      
      const schedule = await ShippingSchedule.findById(id);
      
      if (!schedule) {
        return res.status(404).json({
          success: false,
          message: 'Shipping schedule not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: schedule
      });
    } catch (error) {
      return handleApiError(res, error);
    }
  },

  // Create a new shipping schedule
  createShippingSchedule: async (req: Request, res: Response) => {
    try {
      const { destination, departureDate, arrivalDate, vessel, notes, isActive, order } = req.body;
      
      const schedule = new ShippingSchedule({
        destination,
        departureDate,
        arrivalDate,
        vessel,
        notes,
        isActive: isActive !== undefined ? isActive : true,
        order: order || 0
      });
      
      await schedule.save();
      
      return res.status(201).json({
        success: true,
        message: 'Shipping schedule created successfully',
        data: schedule
      });
    } catch (error) {
      return handleApiError(res, error);
    }
  },

  // Update a shipping schedule
  updateShippingSchedule: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (!id || id === 'undefined') {
        return res.status(400).json({
          success: false,
          message: 'Invalid shipping schedule ID provided'
        });
      }
      
      const { destination, departureDate, arrivalDate, vessel, notes, isActive, order } = req.body;
      
      const schedule = await ShippingSchedule.findById(id);
      
      if (!schedule) {
        return res.status(404).json({
          success: false,
          message: 'Shipping schedule not found'
        });
      }
      
      if (destination !== undefined) schedule.destination = destination;
      if (departureDate !== undefined) schedule.departureDate = departureDate;
      if (arrivalDate !== undefined) schedule.arrivalDate = arrivalDate;
      if (vessel !== undefined) schedule.vessel = vessel;
      if (notes !== undefined) schedule.notes = notes;
      if (isActive !== undefined) schedule.isActive = isActive;
      if (order !== undefined) schedule.order = order;
      
      await schedule.save();
      
      return res.status(200).json({
        success: true,
        message: 'Shipping schedule updated successfully',
        data: schedule
      });
    } catch (error) {
      return handleApiError(res, error);
    }
  },

  // Delete a shipping schedule
  deleteShippingSchedule: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (!id || id === 'undefined') {
        return res.status(400).json({
          success: false,
          message: 'Invalid shipping schedule ID provided'
        });
      }
      
      const schedule = await ShippingSchedule.findById(id);
      
      if (!schedule) {
        return res.status(404).json({
          success: false,
          message: 'Shipping schedule not found'
        });
      }
      
      await schedule.deleteOne();
      
      return res.status(200).json({
        success: true,
        message: 'Shipping schedule deleted successfully'
      });
    } catch (error) {
      return handleApiError(res, error);
    }
  }
};
