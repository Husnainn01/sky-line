import mongoose from 'mongoose';
import { z } from 'zod';

export const VehicleValidation = z.object({
  // Basic Information
  makeId: z.string(),
  modelId: z.string(),
  make: z.string(), // For backward compatibility
  model: z.string(), // For backward compatibility
  slug: z.string().optional(), // URL-friendly identifier
  year: z.number(),
  price: z.number(),
  type: z.enum(['stock', 'auction']),
  condition: z.string(),
  mileage: z.number(),
  engineSize: z.string(),
  transmission: z.string(),
  fuelType: z.string(),
  driveType: z.string(),
  bodyType: z.string(),
  exteriorColor: z.string(),
  interiorColor: z.string(),
  doors: z.number(),
  seats: z.number(),
  owner: z.string().optional(), // User ID

  // Auction Specific
  auctionGrade: z.string().optional(),
  auctionLocation: z.string().optional(),
  lotNumber: z.string().optional(),
  bidEndTime: z.date().optional(),
  startingBid: z.number().optional(),
  currentBid: z.number().optional(),
  minimumBid: z.number().optional(),
  bidIncrement: z.number().optional(),

  // Features and Specifications
  features: z.array(z.string()),
  specifications: z.record(z.string(), z.string()),
  description: z.string(),

  // Media
  images: z.array(z.string()),
  videos: z.array(z.string()).optional(),
  documents: z.array(z.string()).optional(),

  // Status and Logistics
  status: z.enum(['available', 'sold', 'shipping', 'auction']),
  location: z.string(),
  vin: z.string().optional(),
  stockNumber: z.string().optional(),
});

const vehicleSchema = new mongoose.Schema({
  // Basic Information
  makeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Make',
    index: true
  },
  modelId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Model',
    index: true
  },
  // Keep string fields for backward compatibility
  make: { type: String, required: true, index: true },
  model: { type: String, required: true, index: true },
  slug: { type: String, index: true }, // URL-friendly identifier
  year: { type: Number, required: true, index: true },
  price: { type: Number, required: true },
  type: { 
    type: String, 
    enum: ['stock', 'auction'], 
    required: true,
    index: true
  },
  condition: { type: String, required: true },
  mileage: { type: Number, required: true },
  engineSize: { type: String, required: true },
  transmission: { type: String, required: true },
  fuelType: { type: String, required: true },
  driveType: { type: String, required: true },
  bodyType: { type: String, required: true },
  exteriorColor: { type: String, required: true },
  interiorColor: { type: String, required: true },
  doors: { type: Number, required: true },
  seats: { type: Number, required: true },

  // Auction Specific
  auctionGrade: String,
  auctionLocation: String,
  lotNumber: String,
  bidEndTime: Date,
  startingBid: Number,
  currentBid: Number,
  minimumBid: Number,
  bidIncrement: Number,

  // Features and Specifications
  features: [String],
  specifications: {
    type: Map,
    of: String
  },
  description: { type: String, required: true },

  // Media
  images: { type: [String], required: true },
  videos: [String],
  documents: [String],

  // Status and Logistics
  status: {
    type: String,
    enum: ['available', 'sold', 'shipping', 'auction'],
    default: 'available',
    index: true
  },
  location: { type: String, required: true },
  vin: { type: String, unique: true, sparse: true }, // sparse:true allows multiple null values
  stockNumber: { type: String, unique: true, sparse: true }, // sparse:true allows multiple null values
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export const Vehicle = mongoose.model('Vehicle', vehicleSchema);
