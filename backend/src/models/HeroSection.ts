import mongoose, { Document, Schema } from 'mongoose';

export interface IHeroSection extends Document {
  imageUrl: string;
  title: string;
  subtitle: string;
  tagline: string;
  isActive: boolean;
  imagePosition?: string; // Field for image positioning
  backgroundSize?: string; // Field for background size
  imageWidth?: number; // Field for custom image width in pixels
  imageHeight?: number; // Field for custom image height in pixels
  createdAt: Date;
  updatedAt: Date;
}

const HeroSectionSchema = new Schema(
  {
    imageUrl: {
      type: String,
      required: [true, 'Hero image URL is required'],
    },
    title: {
      type: String,
      required: [true, 'Hero title is required'],
      trim: true,
    },
    subtitle: {
      type: String,
      required: [true, 'Hero subtitle is required'],
      trim: true,
    },
    tagline: {
      type: String,
      required: [true, 'Hero tagline is required'],
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    imagePosition: {
      type: String,
      enum: ['center', 'top', 'bottom', 'left', 'right'],
      default: 'center',
    },
    backgroundSize: {
      type: String,
      enum: ['cover', 'contain', '100% auto', 'auto 100%', 'custom'],
      default: 'cover',
    },
    imageWidth: {
      type: Number,
      min: 0,
      max: 3840, // Max 4K width
    },
    imageHeight: {
      type: Number,
      min: 0,
      max: 2160, // Max 4K height
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one hero section can be active at a time
HeroSectionSchema.pre('save', async function(next) {
  if (this.isActive) {
    // Find all other active hero sections and deactivate them
    await mongoose.model('HeroSection').updateMany(
      { _id: { $ne: this._id }, isActive: true },
      { isActive: false }
    );
  }
  next();
});

export default mongoose.model<IHeroSection>('HeroSection', HeroSectionSchema);
