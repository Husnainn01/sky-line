import mongoose from 'mongoose';
import { z } from 'zod';

export const UserValidation = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['admin', 'user']),
  company: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  workosId: z.string().optional(), // WorkOS user ID
  mfaEnabled: z.boolean().optional(), // Whether MFA is enabled
  mfaFactorId: z.string().optional(), // WorkOS MFA factor ID
  pendingEmail: z.string().optional(), // Email pending verification
  emailChangeToken: z.string().optional(), // Token for email change verification
  emailChangeExpires: z.date().optional(), // Expiration for email change token
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  company: String,
  phone: String,
  address: String,
  city: String,
  state: String,
  zipCode: String,
  country: String,
  workosId: { type: String, unique: true, sparse: true }, // WorkOS user ID (sparse index allows null values)
  mfaEnabled: { type: Boolean, default: false }, // Whether MFA is enabled
  mfaFactorId: { type: String, sparse: true }, // WorkOS MFA factor ID
  pendingEmail: { type: String, sparse: true }, // Email pending verification
  emailChangeToken: { type: String, sparse: true }, // Token for email change verification
  emailChangeExpires: Date, // Expiration for email change token
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const User = mongoose.model('User', userSchema);
