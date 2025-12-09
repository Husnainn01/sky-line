import mongoose from 'mongoose';
import { z } from 'zod';

// Define the bookmark schema
const bookmarkSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  vehicle: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Vehicle', 
    required: true 
  },
  notes: { 
    type: String,
    default: ''
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Create a compound index to ensure a user can't bookmark the same vehicle twice
bookmarkSchema.index({ user: 1, vehicle: 1 }, { unique: true });

// Create the Bookmark model
export const Bookmark = mongoose.model('Bookmark', bookmarkSchema);

// Define the Zod validation schema for bookmarks
export const bookmarkValidationSchema = z.object({
  user: z.string().min(1, 'User ID is required'),
  vehicle: z.string().min(1, 'Vehicle ID is required'),
  notes: z.string().optional(),
});

// Type for bookmark data
export type BookmarkData = z.infer<typeof bookmarkValidationSchema>;
