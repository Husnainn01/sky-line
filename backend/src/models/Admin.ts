import mongoose, { Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Permission interface
export interface IPermission {
  resource: string;
  actions: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
  };
}

// Interface for Admin document with methods
interface IAdmin extends Document {
  name: string;
  email: string;
  password: string;
  role: 'superadmin' | 'admin' | 'editor' | 'viewer';
  status: 'active' | 'inactive' | 'suspended';
  workosId?: string;
  mfaEnabled: boolean;
  mfaFactorId?: string;
  lastLogin?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  permissions: IPermission[];
  emailVerified: boolean;
  verificationCode?: string;
  verificationCodeExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  hasPermission(resource: string, action: 'create' | 'read' | 'update' | 'delete'): boolean;
  isLocked(): boolean;
}

// Define permission schema for Zod validation
const PermissionValidation = z.object({
  resource: z.string(),
  actions: z.object({
    create: z.boolean(),
    read: z.boolean(),
    update: z.boolean(),
    delete: z.boolean()
  })
});

// Validation schema for Admin
export const AdminValidation = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['superadmin', 'admin', 'editor', 'viewer']).default('viewer'),
  status: z.enum(['active', 'inactive', 'suspended']).default('active'),
  workosId: z.string().optional(),
  mfaEnabled: z.boolean().default(false),
  mfaFactorId: z.string().optional(),
  lastLogin: z.date().optional(),
  loginAttempts: z.number().default(0),
  lockUntil: z.date().optional(),
  permissions: z.array(PermissionValidation),
  emailVerified: z.boolean().default(false),
  verificationCode: z.string().optional(),
  verificationCodeExpires: z.date().optional(),
});

// Permission schema
const permissionSchema = new mongoose.Schema({
  resource: { type: String, required: true },
  actions: {
    create: { type: Boolean, default: false },
    read: { type: Boolean, default: true },
    update: { type: Boolean, default: false },
    delete: { type: Boolean, default: false }
  }
});

// Define role-based permissions
export const DEFAULT_ROLE_PERMISSIONS = {
  superadmin: {
    description: 'Full access to all system features and settings',
    permissions: [
      { resource: 'dashboard', actions: { create: true, read: true, update: true, delete: true } },
      { resource: 'vehicles', actions: { create: true, read: true, update: true, delete: true } },
      { resource: 'auctions', actions: { create: true, read: true, update: true, delete: true } },
      { resource: 'users', actions: { create: true, read: true, update: true, delete: true } },
      { resource: 'admins', actions: { create: true, read: true, update: true, delete: true } },
      { resource: 'settings', actions: { create: true, read: true, update: true, delete: true } },
      { resource: 'logs', actions: { create: true, read: true, update: true, delete: true } },
    ]
  },
  admin: {
    description: 'Administrative access with some restrictions',
    permissions: [
      { resource: 'dashboard', actions: { create: true, read: true, update: true, delete: false } },
      { resource: 'vehicles', actions: { create: true, read: true, update: true, delete: true } },
      { resource: 'auctions', actions: { create: true, read: true, update: true, delete: true } },
      { resource: 'users', actions: { create: true, read: true, update: true, delete: false } },
      { resource: 'admins', actions: { create: false, read: true, update: false, delete: false } },
      { resource: 'settings', actions: { create: false, read: true, update: true, delete: false } },
      { resource: 'logs', actions: { create: false, read: true, update: false, delete: false } },
    ]
  },
  editor: {
    description: 'Content management with limited administrative access',
    permissions: [
      { resource: 'dashboard', actions: { create: false, read: true, update: false, delete: false } },
      { resource: 'vehicles', actions: { create: true, read: true, update: true, delete: false } },
      { resource: 'auctions', actions: { create: true, read: true, update: true, delete: false } },
      { resource: 'users', actions: { create: false, read: true, update: false, delete: false } },
      { resource: 'admins', actions: { create: false, read: false, update: false, delete: false } },
      { resource: 'settings', actions: { create: false, read: true, update: false, delete: false } },
      { resource: 'logs', actions: { create: false, read: false, update: false, delete: false } },
    ]
  },
  viewer: {
    description: 'Read-only access to content',
    permissions: [
      { resource: 'dashboard', actions: { create: false, read: true, update: false, delete: false } },
      { resource: 'vehicles', actions: { create: false, read: true, update: false, delete: false } },
      { resource: 'auctions', actions: { create: false, read: true, update: false, delete: false } },
      { resource: 'users', actions: { create: false, read: true, update: false, delete: false } },
      { resource: 'admins', actions: { create: false, read: false, update: false, delete: false } },
      { resource: 'settings', actions: { create: false, read: false, update: false, delete: false } },
      { resource: 'logs', actions: { create: false, read: false, update: false, delete: false } },
    ]
  }
};

// Admin schema
const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['superadmin', 'admin', 'editor', 'viewer'],
    default: 'viewer'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  workosId: {
    type: String
  },
  mfaEnabled: {
    type: Boolean,
    default: false
  },
  mfaFactorId: {
    type: String
  },
  lastLogin: {
    type: Date
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  permissions: [permissionSchema],
  emailVerified: {
    type: Boolean,
    default: false
  },
  verificationCode: {
    type: String
  },
  verificationCodeExpires: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
adminSchema.pre<IAdmin>('save', async function(next) {
  const admin = this;
  
  // Only hash the password if it's modified or new
  if (!admin.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(admin.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Pre-save hook to set default permissions based on role
adminSchema.pre<IAdmin>('save', function(next) {
  const admin = this;
  
  // If this is a new user or the role has changed, set default permissions
  if (admin.isNew || admin.isModified('role')) {
    const roleDefaults = DEFAULT_ROLE_PERMISSIONS[admin.role];
    if (roleDefaults) {
      // We need to handle this differently to avoid type errors
      // First, clear all existing permissions
      // Using splice to clear the array in a type-safe way
      admin.permissions.splice(0, admin.permissions.length);
      
      // Then add the new permissions one by one
      roleDefaults.permissions.forEach((perm: any) => {
        admin.permissions.push({
          resource: perm.resource,
          actions: {
            create: perm.actions.create,
            read: perm.actions.read,
            update: perm.actions.update,
            delete: perm.actions.delete
          }
        });
      });
    }
  }
  
  next();
});

// Method to compare password
adminSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to check if a user has permission for a specific action on a resource
adminSchema.methods.hasPermission = function(resource: string, action: 'create' | 'read' | 'update' | 'delete'): boolean {
  // Superadmin has all permissions
  if (this.role === 'superadmin') return true;
  
  // Log permissions for debugging
  console.log(`Checking permission for ${this.email} (${this.role}) to ${action} ${resource}`);
  console.log('User permissions:', JSON.stringify(this.permissions));
  
  // Find the specific permission
  const permission = this.permissions.find((p: any) => p.resource === resource);
  
  // If permission exists, check the specific action
  if (permission) {
    console.log(`Found permission for ${resource}:`, permission.actions);
    return !!permission.actions[action];
  }
  
  // No permission found
  console.log(`No permission found for ${resource}`);
  return false;
};

// Method to check if account is locked
adminSchema.methods.isLocked = function(): boolean {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

export const Admin = mongoose.model<IAdmin>('Admin', adminSchema);
