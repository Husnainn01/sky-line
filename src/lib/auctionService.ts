import { AuctionCar } from '@/types/auction';
import { AuctionVehicle } from '@/types/auctionVehicle';
import { apiRequest } from './api';
import { auctionVehicleApi } from './api';
import { mapAuctionVehicleToAuctionCar } from '@/utils/auctionUtils';

/**
 * Auction Service - Handles API calls for auction vehicles
 */
export const auctionService = {
  /**
   * Get all auction vehicles
   */
  getAllAuctionVehicles: async (): Promise<AuctionCar[]> => {
    try {
      // Use the dedicated auction vehicle API
      const response = await auctionVehicleApi.getAllAuctionVehicles();
      
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch auction vehicles');
      }
      
      // Transform backend vehicle data to match AuctionCar interface
      const auctionCars: AuctionCar[] = response.data.map((vehicle: AuctionVehicle) => 
        mapAuctionVehicleToAuctionCar(vehicle)
      );
      
      return auctionCars;
    } catch (error) {
      console.error('Error fetching auction vehicles:', error);
      throw error;
    }
  },
  
  /**
   * Get auction vehicle by ID
   */
  getAuctionVehicleById: async (id: string): Promise<AuctionCar> => {
    try {
      // Use the dedicated auction vehicle API
      const response = await auctionVehicleApi.getAuctionVehicleById(id);
      
      if (!response.success || !response.data) {
        throw new Error(`Failed to fetch auction vehicle with ID ${id}`);
      }
      
      // Transform backend vehicle data to match AuctionCar interface
      const auctionCar = mapAuctionVehicleToAuctionCar(response.data as AuctionVehicle);
      
      return auctionCar;
    } catch (error) {
      console.error(`Error fetching auction vehicle with ID ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Get auction vehicle by slug
   */
  getAuctionVehicleBySlug: async (slug: string): Promise<AuctionCar | null> => {
    try {
      // Use the dedicated auction vehicle API
      const response = await auctionVehicleApi.getAuctionVehicleBySlug(slug);
      
      if (!response.success || !response.data) {
        return null;
      }
      
      // Transform backend vehicle data to match AuctionCar interface
      const auctionCar = mapAuctionVehicleToAuctionCar(response.data as AuctionVehicle);
      
      return auctionCar;
    } catch (error) {
      console.error(`Error fetching auction vehicle with slug ${slug}:`, error);
      throw error;
    }
  },
  
  // Create a new auction vehicle
  createAuctionVehicle: async (vehicleData: any): Promise<AuctionCar> => {
    try {
      // Use the dedicated auction vehicle API
      const response = await auctionVehicleApi.createAuctionVehicle(vehicleData);
      
      if (!response.success || !response.data) {
        throw new Error('Failed to create auction vehicle');
      }
      
      // Transform backend vehicle data to match AuctionCar interface
      const auctionCar = mapAuctionVehicleToAuctionCar(response.data as AuctionVehicle);
      
      return auctionCar;
    } catch (error) {
      console.error('Error creating auction vehicle:', error);
      throw error;
    }
  },
  
  // Update an auction vehicle
  updateAuctionVehicle: async (id: string, updates: any): Promise<AuctionCar> => {
    try {
      // Use the dedicated auction vehicle API
      const response = await auctionVehicleApi.updateAuctionVehicle(id, updates);
      
      if (!response.success || !response.data) {
        throw new Error(`Failed to update auction vehicle with ID ${id}`);
      }
      
      // Transform backend vehicle data to match AuctionCar interface
      const auctionCar = mapAuctionVehicleToAuctionCar(response.data as AuctionVehicle);
      
      return auctionCar;
    } catch (error) {
      console.error(`Error updating auction vehicle with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Delete an auction vehicle
  deleteAuctionVehicle: async (id: string): Promise<boolean> => {
    try {
      // Use the dedicated auction vehicle API
      const response = await auctionVehicleApi.deleteAuctionVehicle(id);
      
      return response.success || false;
    } catch (error) {
      console.error(`Error deleting auction vehicle with ID ${id}:`, error);
      throw error;
    }
  }
};
