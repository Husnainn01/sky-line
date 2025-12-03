import mongoose from 'mongoose';
import { z } from 'zod';

export const ShipmentValidation = z.object({
  trackingId: z.string(),
  vehicle: z.string(), // Vehicle ID
  status: z.enum(['processing', 'booked', 'shipped', 'delivered']),
  destination: z.object({
    country: z.string(),
    port: z.string(),
    address: z.string(),
  }),
  estimatedDelivery: z.date(),
  shippingCost: z.number(),
});

const shipmentSchema = new mongoose.Schema({
  trackingId: { type: String, required: true, unique: true },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  status: {
    type: String,
    enum: ['processing', 'booked', 'shipped', 'delivered'],
    default: 'processing'
  },
  destination: {
    country: { type: String, required: true },
    port: { type: String, required: true },
    address: String,
  },
  estimatedDelivery: Date,
  shippingCost: Number,
  updates: [{
    status: String,
    location: String,
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Shipment = mongoose.model('Shipment', shipmentSchema);
