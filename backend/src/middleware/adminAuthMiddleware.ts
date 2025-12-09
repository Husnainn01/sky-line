import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin';

// Extend Express Request type to include admin
declare global {
  namespace Express {
    interface Request {
      admin?: any;
      adminRole?: 'superadmin' | 'admin' | 'editor' | 'viewer';
    }
  }
}

export const adminAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Access denied. No token provided.' 
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as jwt.JwtPayload;
    
    // Check if it's an admin token
    if (!decoded.type || decoded.type !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. Admin privileges required.' 
      });
    }
    
    // Find admin
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token. Admin not found.' 
      });
    }
    
    // Check if admin is active
    if (admin.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your account is not active. Please contact a system administrator.'
      });
    }
    
    // Attach admin to request
    req.admin = admin;
    req.adminRole = admin.role;
    
    // Update last login time
    admin.lastLogin = new Date();
    await admin.save();
    
    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(401).json({ 
      success: false,
      message: 'Invalid token',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
};

// Role-based middleware for admin access levels
export const roleMiddleware = (roles: ('superadmin' | 'admin' | 'editor' | 'viewer')[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authenticated as admin' 
      });
    }
    
    // Check if the current role is included in the allowed roles
    // Special case: superadmin can access everything
    if (req.admin.role === 'superadmin' || roles.includes(req.admin.role)) {
      next();
    } else {
      console.log(`Access denied: User role ${req.admin.role} not in allowed roles: ${roles.join(', ')}`);
      res.status(403).json({ 
        success: false,
        message: `Access denied. This section requires ${roles.join(' or ')} privileges. Your current role is: ${req.admin.role}.` 
      });
    }
  };
};

// Shorthand middleware for superadmin only routes
export const superAdminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.admin && req.admin.role === 'superadmin') {
    next();
  } else {
    res.status(403).json({ 
      success: false,
      message: 'Access denied. Super Admin privileges required.' 
    });
  }
};

// Permission-based middleware
export const permissionMiddleware = (resource: string, action: 'create' | 'read' | 'update' | 'delete') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authenticated as admin' 
      });
    }
    
    // Superadmin always has all permissions
    if (req.admin.role === 'superadmin') {
      return next();
    }
    
    // Use the hasPermission method from the Admin model
    if (req.admin.hasPermission(resource, action)) {
      next();
    } else {
      console.log(`Permission denied: User ${req.admin.email} (${req.admin.role}) doesn't have permission to ${action} ${resource}`);
      res.status(403).json({ 
        success: false,
        message: `Access denied. You don't have permission to ${action} ${resource}. This action requires higher privileges than your current role: ${req.admin.role}.` 
      });
    }
  };
};
