import { AuctionCar } from '@/types/auction';
import { apiRequest } from './api';

/**
 * Auction Service - Handles API calls for auction vehicles
 */
export const auctionService = {
  /**
   * Get all auction vehicles
   */
  getAllAuctionVehicles: async (): Promise<AuctionCar[]> => {
    try {
      const response = await apiRequest('/vehicles/type/auction');
      
      // Transform backend vehicle data to match AuctionCar interface
      const auctionCars: AuctionCar[] = response.data.map((vehicle: any) => {
        // Calculate auction status based on dates and current time
        const now = new Date();
        const bidEndTime = vehicle.bidEndTime ? new Date(vehicle.bidEndTime) : null;
        
        let auctionStatus: 'upcoming' | 'live' | 'past' = 'upcoming';
        let timeRemaining: string | undefined;
        
        if (bidEndTime) {
          if (bidEndTime < now) {
            auctionStatus = 'past';
          } else {
            auctionStatus = 'live';
            // Calculate time remaining
            const diff = bidEndTime.getTime() - now.getTime();
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            timeRemaining = `${hours}h ${minutes}m`;
          }
        }
        
        // Map backend vehicle to AuctionCar interface
        return {
          id: vehicle._id,
          slug: vehicle.slug || `${vehicle.make}-${vehicle.model}-${vehicle.year}`.toLowerCase().replace(/\s+/g, '-'),
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          image: vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : '/cars/placeholder.png',
          images: vehicle.images || [],
          mileage: vehicle.mileage,
          engine: vehicle.engineSize,
          transmission: vehicle.transmission,
          grade: vehicle.auctionGrade || 'N/A',
          color: vehicle.exteriorColor,
          auctionStatus,
          auctionHouse: vehicle.auctionLocation || 'Unknown',
          auctionDate: bidEndTime ? bidEndTime.toLocaleDateString() : 'TBD',
          timeRemaining,
          startingBid: vehicle.startingBid || 0,
          currentBid: vehicle.currentBid || vehicle.startingBid || 0,
          estimatedPrice: vehicle.price || 0,
          finalPrice: auctionStatus === 'past' ? vehicle.currentBid : undefined,
          soldStatus: auctionStatus === 'past' ? (vehicle.status === 'sold' ? 'sold' : 'unsold') : undefined,
          features: vehicle.features || [],
          condition: vehicle.condition || 'Good',
          inspectionReport: vehicle.documents && vehicle.documents.length > 0 ? vehicle.documents[0] : undefined,
          inspectionGrade: vehicle.auctionGrade,
          exteriorGrade: vehicle.exteriorGrade,
          interiorGrade: vehicle.interiorGrade,
          description: vehicle.description,
          location: vehicle.location || 'Japan'
        };
      });
      
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
      const response = await apiRequest(`/vehicles/${id}`);
      const vehicle = response.data;
      
      // Calculate auction status based on dates and current time
      const now = new Date();
      const bidEndTime = vehicle.bidEndTime ? new Date(vehicle.bidEndTime) : null;
      
      let auctionStatus: 'upcoming' | 'live' | 'past' = 'upcoming';
      let timeRemaining: string | undefined;
      
      if (bidEndTime) {
        if (bidEndTime < now) {
          auctionStatus = 'past';
        } else {
          auctionStatus = 'live';
          // Calculate time remaining
          const diff = bidEndTime.getTime() - now.getTime();
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          timeRemaining = `${hours}h ${minutes}m`;
        }
      }
      
      // Map backend vehicle to AuctionCar interface
      const auctionCar: AuctionCar = {
        id: vehicle._id,
        slug: vehicle.slug || `${vehicle.make}-${vehicle.model}-${vehicle.year}`.toLowerCase().replace(/\s+/g, '-'),
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        image: vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : '/cars/placeholder.png',
        images: vehicle.images || [],
        mileage: vehicle.mileage,
        engine: vehicle.engineSize,
        transmission: vehicle.transmission,
        grade: vehicle.auctionGrade || 'N/A',
        color: vehicle.exteriorColor,
        auctionStatus,
        auctionHouse: vehicle.auctionLocation || 'Unknown',
        auctionDate: bidEndTime ? bidEndTime.toLocaleDateString() : 'TBD',
        timeRemaining,
        startingBid: vehicle.startingBid || 0,
        currentBid: vehicle.currentBid || vehicle.startingBid || 0,
        estimatedPrice: vehicle.price || 0,
        finalPrice: auctionStatus === 'past' ? vehicle.currentBid : undefined,
        soldStatus: auctionStatus === 'past' ? (vehicle.status === 'sold' ? 'sold' : 'unsold') : undefined,
        features: vehicle.features || [],
        condition: vehicle.condition || 'Good',
        inspectionReport: vehicle.documents && vehicle.documents.length > 0 ? vehicle.documents[0] : undefined,
        inspectionGrade: vehicle.auctionGrade,
        exteriorGrade: vehicle.exteriorGrade,
        interiorGrade: vehicle.interiorGrade,
        description: vehicle.description,
        location: vehicle.location || 'Japan'
      };
      
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
      // First get all auction vehicles
      const auctionCars = await auctionService.getAllAuctionVehicles();
      
      // Find the one with matching slug
      const auctionCar = auctionCars.find(car => car.slug === slug);
      
      if (!auctionCar) {
        return null;
      }
      
      return auctionCar;
    } catch (error) {
      console.error(`Error fetching auction vehicle with slug ${slug}:`, error);
      throw error;
    }
  }
};
