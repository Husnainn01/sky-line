import mongoose from 'mongoose';
import { z } from 'zod';

export const ModelValidation = z.object({
  name: z.string().min(1, "Model name is required"),
  slug: z.string(),
  make: z.string().min(1, "Make reference is required"),
  description: z.string().optional(),
  startYear: z.number().optional(),
  endYear: z.number().optional(),
  bodyTypes: z.array(z.string()).optional(),
  active: z.boolean().default(true),
});

const modelSchema = new mongoose.Schema({
  // Basic Information
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  slug: { 
    type: String, 
    required: true, 
    lowercase: true,
    trim: true
  },
  make: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Make',
    required: true,
    index: true
  },
  description: String,
  startYear: Number,
  endYear: Number,
  bodyTypes: [String],
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

// Create compound index for make + name to ensure uniqueness
modelSchema.index({ make: 1, name: 1 }, { unique: true });

// Create text indexes for searching
modelSchema.index({ name: 'text', description: 'text' });

// Define interface for Model document
interface IModel extends mongoose.Document {
  name: string;
  slug: string;
  make: mongoose.Types.ObjectId;
  description?: string;
  startYear?: number;
  endYear?: number;
  bodyTypes?: string[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Pre-save hook to generate slug if not provided
modelSchema.pre('save', function(this: IModel) {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  }
});

export const Model = mongoose.model('Model', modelSchema);
