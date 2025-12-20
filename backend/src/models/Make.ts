import mongoose from 'mongoose';
import { z } from 'zod';

export const MakeValidation = z.object({
  name: z.string().min(1, "Make name is required"),
  slug: z.string(),
  description: z.string().optional(),
  country: z.string().optional(),
  logo: z.string().optional(),
  active: z.boolean().default(true),
});

const makeSchema = new mongoose.Schema({
  // Basic Information
  name: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true
  },
  slug: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  description: String,
  country: String,
  logo: String,
  active: {
    type: Boolean,
    default: true
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Create text indexes for searching
makeSchema.index({ name: 'text', description: 'text' });

// Define interface for Make document
interface IMake extends mongoose.Document {
  name: string;
  slug: string;
  description?: string;
  country?: string;
  logo?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Pre-save hook to generate slug if not provided
makeSchema.pre('save', function(this: IMake) {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  }
});

export const Make = mongoose.model('Make', makeSchema);
