// AuctionVehicle type definition - separate from regular vehicles
export interface AuctionVehicle {
  _id: string;
  make: string;
  model: string;
  year: number;
  slug: string;
  mileage: number;
  engineSize?: string;
  transmission: string;
  exteriorColor?: string;
  images: string[];
  
  // Specifications
  specifications?: {
    grade?: string;
    inspectionGrade?: string;
    exteriorGrade?: string;
    interiorGrade?: string;
  };
  
  // Auction-specific fields
  auctionStartDate: Date | string;
  auctionEndDate: Date | string;
  auctionHouse?: string;
  auctionStartingBid: number;
  auctionCurrentBid?: number;
  auctionFinalPrice?: number;
  auctionSoldStatus?: 'sold' | 'unsold';
  
  // Additional information
  features?: string[];
  condition?: string;
  inspectionReport?: string;
  description?: string;
  location: string;
  price: number; // Estimated price
  
  // Bids
  bids?: {
    amount: number;
    bidder: string;
    timestamp: Date | string;
  }[];
  
  // Timestamps
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// Helper function to determine auction status
export function getAuctionStatus(vehicle: AuctionVehicle): 'upcoming' | 'live' | 'past' {
  const now = new Date();
  const startDate = new Date(vehicle.auctionStartDate);
  const endDate = new Date(vehicle.auctionEndDate);
  
  if (endDate < now) {
    return 'past';
  } else if (startDate < now) {
    return 'live';
  } else {
    return 'upcoming';
  }
}

// Helper function to calculate time remaining for live auctions
export function calculateTimeRemaining(endDate: Date | string): string {
  const now = new Date();
  const end = new Date(endDate);
  const diffMs = end.getTime() - now.getTime();
  
  if (diffMs <= 0) {
    return 'Ended';
  }
  
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${diffHrs}h ${diffMins}m`;
}
