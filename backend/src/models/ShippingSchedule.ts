import mongoose from 'mongoose';

const ShippingScheduleSchema = new mongoose.Schema({
  destination: {
    type: String,
    required: true,
  },
  departureDate: {
    type: Date,
    required: true,
  },
  arrivalDate: {
    type: Date,
    required: true,
  },
  vessel: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: true
});

export default mongoose.model('ShippingSchedule', ShippingScheduleSchema);
