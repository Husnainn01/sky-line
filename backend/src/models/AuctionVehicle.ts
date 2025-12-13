import mongoose from 'mongoose';
import { z } from 'zod';

export const AuctionVehicleValidation = z.object({
  // Basic Information
  make: z.string(),
  model: z.string(),
  slug: z.string().optional(), // URL-friendly identifier
  year: z.number(),
  price: z.number(), // Estimated price
  mileage: z.number(),
  engineSize: z.string(),
  transmission: z.string(),
  exteriorColor: z.string(),
  
  // Auction-specific fields
  auctionStartDate: z.date(),
  auctionEndDate: z.date(),
  auctionHouse: z.string().optional(),
  auctionStartingBid: z.number(),
  auctionCurrentBid: z.number().optional(),
  auctionFinalPrice: z.number().optional(),
  auctionSoldStatus: z.enum(['sold', 'unsold']).optional().nullable(),
  
  // Specifications
  specifications: z.object({
    grade: z.string().optional(),
    inspectionGrade: z.string().optional(),
    exteriorGrade: z.string().optional(),
    interiorGrade: z.string().optional(),
  }).optional(),
  
  // Features and description
  features: z.array(z.string()),
  condition: z.string(),
  description: z.string(),
  
  // Media
  images: z.array(z.string()),
  inspectionReport: z.string().optional(),
  
  // Location and owner
  location: z.string(),
  owner: z.string().optional(), // User ID
});

const auctionVehicleSchema = new mongoose.Schema({
  // Basic Information
  make: { type: String, required: true, index: true },
  model: { type: String, required: true, index: true },
  slug: { type: String, index: true }, // URL-friendly identifier
  year: { type: Number, required: true, index: true },
  price: { type: Number, required: true }, // Estimated price
  mileage: { type: Number, required: true },
  engineSize: { type: String, required: true },
  transmission: { type: String, required: true },
  exteriorColor: { type: String, required: true },
  
  // Auction-specific fields
  auctionStartDate: { type: Date, required: true },
  auctionEndDate: { type: Date, required: true },
  auctionHouse: { type: String, default: 'JDM Global Auctions' },
  auctionStartingBid: { type: Number, required: true },
  auctionCurrentBid: { type: Number },
  auctionFinalPrice: { type: Number },
  auctionSoldStatus: { 
    type: String, 
    enum: ['sold', 'unsold', null, undefined],
    validate: {
      validator: function(v: string | null | undefined) {
        // Allow null, undefined, or valid enum values
        return v === null || v === undefined || v === '' || ['sold', 'unsold'].includes(v);
      },
      message: (props: { value: any }) => `${props.value} is not a valid auction sold status`
    }
  },
  
  // Specifications
  specifications: {
    grade: String,
    inspectionGrade: String,
    exteriorGrade: String,
    interiorGrade: String,
  },
  
  // Features and description
  features: { type: [String], default: [] },
  condition: { type: String, required: true },
  description: { type: String, required: true },
  
  // Media
  images: { type: [String], required: true },
  inspectionReport: String,
  
  // Location and owner
  location: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Bids
  bids: [{
    amount: Number,
    bidder: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now }
  }],
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Create a compound index for make, model, and year to improve search performance
auctionVehicleSchema.index({ make: 1, model: 1, year: 1 });

// Create a text index for search functionality
auctionVehicleSchema.index({ 
  make: 'text', 
  model: 'text', 
  description: 'text',
  condition: 'text',
  location: 'text'
});

export const AuctionVehicle = mongoose.model('AuctionVehicle', auctionVehicleSchema);
