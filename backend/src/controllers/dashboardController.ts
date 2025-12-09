import { Request, Response } from 'express';
import { User } from '../models/User';
import { Vehicle } from '../models/Vehicle';
import { Shipment } from '../models/Shipment';
import { Bookmark } from '../models/Bookmark';

export const dashboardController = {
  /**
   * Get dashboard data for the authenticated user
   */
  async getDashboardData(req: Request, res: Response) {
    try {
      const userId = req.user?._id;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false,
          message: 'User not authenticated' 
        });
      }
      
      // Get user's vehicles
      const vehicles = await Vehicle.find({ owner: userId }).sort({ createdAt: -1 }).limit(5);
      
      // Get user's bookmarks
      const bookmarks = await Bookmark.find({ user: userId })
        .populate('vehicle')
        .sort({ createdAt: -1 })
        .limit(5);
      
      // Get user's shipments
      const shipments = await Shipment.find({ 
        vehicle: { $in: vehicles.map(v => v._id) } 
      })
      .populate('vehicle')
      .sort({ createdAt: -1 })
      .limit(5);
      
      // Calculate real stats from database
      const stats = {
        savedVehicles: await Bookmark.countDocuments({ user: userId }),
        vehiclesOwned: await Vehicle.countDocuments({ owner: userId }),
        activeShipments: await Shipment.countDocuments({ 
          vehicle: { $in: vehicles.map(v => v._id) },
          status: { $ne: 'delivered' }
        }),
        totalSpent: vehicles.reduce((sum, v) => sum + (v.price || 0), 0)
      };
      
      // Generate activity items from real data
      const recentActivity = [];
      
      // Add bookmark activities
      const bookmarkActivities = bookmarks.map((bookmark, index) => {
        const vehicle = bookmark.vehicle as any;
        return {
          id: `bookmark-${bookmark._id}`,
          type: 'bookmark',
          title: `Saved ${vehicle.year} ${vehicle.make} ${vehicle.model}`,
          status: 'saved',
          date: formatDate(bookmark.createdAt),
          vehicleId: vehicle._id
        };
      });
      recentActivity.push(...bookmarkActivities);
      
      // Add vehicle purchase activities
      const vehicleActivities = vehicles.map((vehicle, index) => {
        return {
          id: `vehicle-${vehicle._id}`,
          type: 'purchase',
          title: `Purchased ${vehicle.year} ${vehicle.make} ${vehicle.model}`,
          amount: `$${vehicle.price?.toLocaleString() || 'N/A'}`,
          status: 'completed',
          date: formatDate(vehicle.createdAt),
          vehicleId: vehicle._id
        };
      });
      recentActivity.push(...vehicleActivities);
      
      // Add shipment activities
      const shipmentActivities = shipments.map((shipment, index) => {
        const vehicle = shipment.vehicle as any;
        return {
          id: `shipment-${shipment._id}`,
          type: 'shipment',
          title: `${vehicle.year} ${vehicle.make} ${vehicle.model} shipment`,
          status: shipment.status,
          location: shipment.destination?.country || 'Unknown',
          date: formatDate(shipment.updatedAt),
          vehicleId: vehicle._id,
          shipmentId: shipment._id
        };
      });
      recentActivity.push(...shipmentActivities);
      
      // Sort all activities by date (most recent first)
      recentActivity.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB.getTime() - dateA.getTime();
      });
      
      // Helper function to format dates
      function formatDate(date: Date) {
        const now = new Date();
        const diff = now.getTime() - new Date(date).getTime();
        
        // Convert to appropriate time format
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (minutes < 60) {
          return minutes <= 1 ? 'Just now' : `${minutes}m ago`;
        } else if (hours < 24) {
          return `${hours}h ago`;
        } else if (days < 7) {
          return `${days}d ago`;
        } else {
          return new Date(date).toLocaleDateString();
        }
      }
      
      res.json({
        success: true,
        stats,
        recentActivity,
        vehicles,
        shipments
      });
    } catch (error) {
      console.error('Dashboard data error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error while fetching dashboard data',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  }
};
