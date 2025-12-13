import { AuctionCar } from '@/types/auction';
import { AuctionVehicle, getAuctionStatus, calculateTimeRemaining } from '@/types/auctionVehicle';

/**
 * Maps an AuctionVehicle to AuctionCar format for UI display
 */
export const mapAuctionVehicleToAuctionCar = (vehicle: AuctionVehicle): AuctionCar => {
  // Determine auction status
  const auctionStatus = getAuctionStatus(vehicle);
  
  // Calculate time remaining for live auctions
  const timeRemaining = auctionStatus === 'live' ? calculateTimeRemaining(vehicle.auctionEndDate) : '';
  
  return {
    id: vehicle._id,
    slug: vehicle.slug || `${vehicle.make}-${vehicle.model}-${vehicle.year}`.toLowerCase().replace(/\s+/g, '-'),
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    image: vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : '/cars/placeholder.png',
    images: vehicle.images || [],
    mileage: vehicle.mileage,
    engine: vehicle.engineSize || 'Not specified',
    transmission: vehicle.transmission,
    grade: vehicle.specifications?.grade || '3',
    color: vehicle.exteriorColor || 'Not specified',
    auctionStatus: auctionStatus,
    auctionHouse: vehicle.auctionHouse || 'JDM Global Auctions',
    auctionDate: vehicle.auctionStartDate ? new Date(vehicle.auctionStartDate).toLocaleDateString() : 'Upcoming',
    timeRemaining: timeRemaining,
    startingBid: vehicle.auctionStartingBid,
    currentBid: vehicle.auctionCurrentBid || vehicle.auctionStartingBid,
    estimatedPrice: vehicle.price,
    finalPrice: vehicle.auctionFinalPrice,
    soldStatus: vehicle.auctionSoldStatus,
    features: vehicle.features || [],
    condition: vehicle.condition || 'Good',
    inspectionReport: vehicle.inspectionReport,
    inspectionGrade: vehicle.specifications?.inspectionGrade,
    exteriorGrade: vehicle.specifications?.exteriorGrade,
    interiorGrade: vehicle.specifications?.interiorGrade,
    description: vehicle.description,
    location: vehicle.location
  };
};
