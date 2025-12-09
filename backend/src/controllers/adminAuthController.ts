import { Request, Response } from 'express';
import { WorkOS } from '@workos-inc/node';
import { Admin, DEFAULT_ROLE_PERMISSIONS } from '../models/Admin';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Initialize WorkOS client
const apiKey = process.env.WORKOS_API_KEY;
if (!apiKey) {
  console.error('WARNING: WorkOS API key is not set in environment variables');
}

// Initialize WorkOS with the API key
const workos = new WorkOS(apiKey || 'sk_test_a2V5XzAxSzFDVzc4WURDWjk1WU1FMFhDNzY3MFBGLGw5dmxoandINzlmZmZvSG1hd0NEOGRTUE0');

export const adminAuthController = {
  /**
   * Verify admin email
   */
  async verifyEmail(req: Request, res: Response) {
    try {
      const { code, email } = req.body;
      
      if (!code) {
        return res.status(400).json({ 
          success: false,
          message: 'Verification code is required' 
        });
      }
      
      // If we have a URL code (long format), use WorkOS authenticateWithCode
      if (code.length > 10) {
        try {
          // Verify the email with WorkOS using the code from the URL
          // This is the standard WorkOS email verification flow
          const verification = await workos.userManagement.authenticateWithCode({
            clientId: process.env.WORKOS_CLIENT_ID || '',
            code
          });
          
          // Find the admin with this WorkOS ID
          const admin = await Admin.findOne({ workosId: verification.user.id });
          
          if (admin) {
            // Mark the admin as verified in our database
            admin.emailVerified = true;
            await admin.save();
            
            console.log(`Email verified for admin: ${admin.email}`);
          } else {
            console.log(`Admin not found for WorkOS user ID: ${verification.user.id}`);
          }
          
          return res.json({
            success: true,
            message: 'Email verified successfully'
          });
        } catch (error: any) {
          console.error('Email verification error:', error);
          return res.status(400).json({ 
            success: false,
            message: 'Invalid or expired verification code',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
          });
        }
      } 
      // If we have a 6-digit code and email, use WorkOS verifyEmail directly
      else if (code.length === 6 && email) {
        try {
          // Find the admin by email
          const admin = await Admin.findOne({ email });
          
          if (!admin) {
            return res.status(404).json({ 
              success: false,
              message: 'Admin not found' 
            });
          }
          
          if (!admin.workosId) {
            return res.status(400).json({ 
              success: false,
              message: 'Admin account is not properly set up' 
            });
          }
          
          try {
            // Use the direct verifyEmail method like in the user panel
            // @ts-ignore - verifyEmail is supported in the API but not in types
            await workos.userManagement.verifyEmail({
              userId: admin.workosId,
              code
            });
            
            // Mark the admin as verified in our database
            admin.emailVerified = true;
            await admin.save();
            
            console.log(`Email verified for admin: ${admin.email}`);
            
            return res.json({
              success: true,
              message: 'Email verified successfully'
            });
          } catch (verifyError: any) {
            console.error('Email verification error:', verifyError);
            return res.status(400).json({ 
              success: false,
              message: 'Invalid verification code',
              error: process.env.NODE_ENV === 'development' ? verifyError.message : undefined
            });
          }
        } catch (error: any) {
          console.error('Email verification error:', error);
          return res.status(400).json({ 
            success: false,
            message: 'Failed to verify email',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
          });
        }
      } else {
        return res.status(400).json({ 
          success: false,
          message: 'Invalid verification code format' 
        });
      }
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error during email verification',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  },
  
  /**
   * Admin login
   */
  async login(req: Request, res: Response) {
    try {
      const { email, password, rememberMe } = req.body;
      
      // Validate input
      if (!email || !password) {
        return res.status(400).json({ 
          success: false,
          message: 'Please provide email and password' 
        });
      }
      
      // Set token expiration based on rememberMe flag
      const tokenExpiration = rememberMe ? '7d' : '12h'; // 7 days or 12 hours
      
      // Find admin in our database
      const admin = await Admin.findOne({ email });
      if (!admin) {
        return res.status(401).json({ 
          success: false,
          message: 'Invalid credentials' 
        });
      }
      
      // Check if admin is active
      if (admin.status !== 'active') {
        return res.status(403).json({ 
          success: false,
          message: 'Your account has been deactivated. Please contact the system administrator.' 
        });
      }
      
      // Verify password
      const isPasswordValid = await admin.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ 
          success: false,
          message: 'Invalid credentials' 
        });
      }
      
      // Check if admin has a WorkOS ID
      if (!admin.workosId) {
        // Create a WorkOS user if one doesn't exist
        try {
          console.log(`Creating WorkOS user for admin ${email}`);
          const newWorkosUser = await workos.userManagement.createUser({
            email,
            firstName: admin.name.split(' ')[0],
            lastName: admin.name.split(' ').slice(1).join(' ') || '',
            password, // Use the same password they provided
            // Add metadata to identify as admin
            metadata: {
              isAdmin: 'true',
              role: admin.role
            }
          });
          
          // Update our database with the new WorkOS ID
          admin.workosId = newWorkosUser.id;
          await admin.save();
          
          console.log(`Created WorkOS admin user with ID: ${newWorkosUser.id}`);
        } catch (createError: any) {
          // If user already exists in WorkOS but we don't have the ID
          if (createError.code === 'user_creation_error' && createError.errors) {
            const emailError = createError.errors.find((e: any) => e.code === 'email_not_available');
            if (emailError) {
              // Try to find the user in WorkOS by email
              try {
                const workosUsers = await workos.userManagement.listUsers({
                  email
                });
                
                if (workosUsers.data && workosUsers.data.length > 0) {
                  // Found the user in WorkOS, update our database
                  admin.workosId = workosUsers.data[0].id;
                  await admin.save();
                  console.log(`Found existing WorkOS user for admin with ID: ${admin.workosId}`);
                }
              } catch (listError) {
                console.error('Error listing WorkOS users:', listError);
              }
            }
          }
          
          if (!admin.workosId) {
            console.error('Failed to create or find WorkOS admin user:', createError);
            return res.status(500).json({ 
              success: false, 
              message: 'Failed to set up authentication',
              error: process.env.NODE_ENV === 'development' ? (createError as Error).message : undefined
            });
          }
        }
      }
      
      try {
        // Check if the admin is verified in our database
        if (!admin.emailVerified) {
          console.log(`Admin ${admin.email} is not verified in our database`);
          return res.status(403).json({
            success: false,
            message: 'Email verification required',
            requiresVerification: true,
            email: admin.email
          });
        }
        
        // Now authenticate with WorkOS using the workosId we have
        console.log(`Authenticating with WorkOS for admin ID: ${admin.workosId}`);
        const authResponse = await workos.userManagement.authenticateWithPassword({
          email,
          password,
          clientId: process.env.WORKOS_CLIENT_ID || ''
        });
        
        // Check if MFA is required for this admin
        if (admin.mfaEnabled && admin.mfaFactorId) {
          // If MFA is enabled, we need to return a partial auth response
          console.log(`MFA required for admin ${admin.id} with factor ${admin.mfaFactorId}`);
          return res.json({
            success: true,
            requiresMfa: true,
            mfaFactorId: admin.mfaFactorId,
            user: {
              id: admin._id,
              name: admin.name,
              email: admin.email,
              role: admin.role
            }
          });
        }
        
        // Update last login time
        admin.lastLogin = new Date();
        await admin.save();
        
        // Create JWT token (MFA not required)
        const token = jwt.sign(
          { 
            id: admin._id, 
            email: admin.email, 
            role: admin.role, 
            isAdmin: true,
            workosId: authResponse.user.id,
            type: 'admin' // Add the type field for middleware check
          },
          process.env.JWT_SECRET || 'default_secret',
          { expiresIn: tokenExpiration }
        );
        
        // Return admin data and JWT token
        res.json({
          success: true,
          token,
          user: {
            id: admin._id,
            name: admin.name,
            email: admin.email,
            role: admin.role
          }
        });
      } catch (workosError) {
        console.error('WorkOS Authentication Error for admin:', workosError);
        return res.status(401).json({ 
          success: false, 
          message: 'Authentication failed. Please check your credentials.',
          error: process.env.NODE_ENV === 'development' ? (workosError as Error).message : undefined
        });
      }
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error during admin login',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  },
  
  /**
   * Verify MFA during admin login
   */
  async verifyMfaLogin(req: Request, res: Response) {
    try {
      const { email, factorId, code, rememberMe } = req.body;
      
      if (!email || !factorId || !code) {
        return res.status(400).json({ 
          success: false,
          message: 'Missing required fields' 
        });
      }
      
      // Find admin by email
      const admin = await Admin.findOne({ email });
      if (!admin) {
        return res.status(401).json({ 
          success: false,
          message: 'Invalid credentials' 
        });
      }
      
      // Set token expiration based on rememberMe flag
      const tokenExpiration = rememberMe ? '7d' : '12h';
      
      try {
        // Challenge the factor
        console.log('Challenging MFA factor during admin login:', factorId);
        const challenge = await (workos.mfa as any).challengeFactor({
          authenticationFactorId: factorId
        });
        
        // Verify the factor
        console.log('Verifying MFA factor during admin login:', factorId);
        const verification = await (workos.mfa as any).verifyFactor({
          authenticationFactorId: factorId,
          challengeId: challenge.id,
          code
        });
        
        if (verification.valid) {
          // Update last login time
          admin.lastLogin = new Date();
          await admin.save();
          
          // Create JWT token
          const token = jwt.sign(
            { 
              id: admin._id, 
              email: admin.email, 
              role: admin.role, 
              isAdmin: true,
              workosId: admin.workosId,
              type: 'admin' // Add the type field for middleware check
            },
            process.env.JWT_SECRET || 'default_secret',
            { expiresIn: tokenExpiration }
          );
          
          // Return admin data and JWT token
          return res.json({
            success: true,
            token,
            user: {
              id: admin._id,
              name: admin.name,
              email: admin.email,
              role: admin.role
            }
          });
        }
        
        return res.status(401).json({ 
          success: false,
          message: 'MFA verification failed' 
        });
      } catch (error) {
        console.error('MFA verification error for admin:', error);
        return res.status(401).json({ 
          success: false,
          message: 'MFA verification failed' 
        });
      }
    } catch (error) {
      console.error('MFA admin login verification error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error during MFA verification',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  },
  
  /**
   * Resend verification email for admin
   */
  async resendVerification(req: Request, res: Response) {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ 
          success: false,
          message: 'Email is required' 
        });
      }
      
      // Find admin by email
      const admin = await Admin.findOne({ email });
      
      if (!admin) {
        // For security reasons, don't reveal that the admin doesn't exist
        return res.json({
          success: true,
          message: 'If this email is registered, a verification email has been sent.'
        });
      }
      
      // Check if admin has a WorkOS ID
      if (!admin.workosId) {
        return res.status(400).json({ 
          success: false,
          message: 'Admin account is not properly set up' 
        });
      }
      
      try {
        // Send verification email using WorkOS
        await workos.userManagement.sendVerificationEmail({
          userId: admin.workosId,
          // @ts-ignore - redirectUri is supported in the API but not in types
          redirectUri: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/verify-email`
        });
        
        console.log(`Verification email sent to ${email} via WorkOS`);
        
        return res.json({
          success: true,
          message: 'Verification email sent successfully. Please check your inbox.'
        });
      } catch (error: any) {
        console.error('Failed to send verification email:', error);
        return res.status(500).json({ 
          success: false,
          message: 'Failed to send verification email',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error while resending verification email',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  },
  
  /**
   * Create a new admin (only accessible by superadmins)
   */
  async createAdmin(req: Request, res: Response) {
    try {
      const { name, email, password, role = 'admin', customPermissions } = req.body;
      
      // Validate role
      if (!['superadmin', 'admin', 'editor', 'viewer'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role. Must be one of: superadmin, admin, editor, viewer'
        });
      }
      
      // Check if admin already exists
      const existingAdmin = await Admin.findOne({ email });
      if (existingAdmin) {
        return res.status(400).json({ 
          success: false,
          message: 'Admin with this email already exists' 
        });
      }
      
      // Create new admin in our database
      // The permissions will be set automatically based on role in the pre-save hook
      const admin = new Admin({
        name,
        email,
        password,
        role,
        status: 'active'
      });
      
      // If custom permissions are provided, override the default ones
      if (customPermissions) {
        // Save first to let the pre-save hook set the default permissions
        await admin.save();
        
        // Then update with custom permissions
        admin.permissions = customPermissions;
        await admin.save();
      } else {
        // Just save with default permissions
        await admin.save();
      }
      
      // Check if user already exists in WorkOS or create a new one
      let userExistsInWorkOS = false;
      try {
        // First, try to list users with this email to see if they exist
        const listResult = await workos.userManagement.listUsers({
          email
        });
        
        let workosUserId = '';
        
        if (listResult.data && listResult.data.length > 0) {
          userExistsInWorkOS = true;
          // User already exists in WorkOS, use their ID
          console.log('User already exists in WorkOS, using existing user');
          workosUserId = listResult.data[0].id;
          
          // Update user metadata to reflect admin role
          await workos.userManagement.updateUser({
            userId: workosUserId,
            firstName: name.split(' ')[0],
            lastName: name.split(' ').slice(1).join(' ') || '',
            metadata: {
              isAdmin: 'true',
              role,
              permissions: JSON.stringify(admin.permissions.map(p => ({
                resource: p.resource,
                actions: p.actions
              })))
            }
          });
        } else {
          // User doesn't exist, create them in WorkOS
          const workosUser = await workos.userManagement.createUser({
            email,
            firstName: name.split(' ')[0],
            lastName: name.split(' ').slice(1).join(' ') || '',
            password,
            // Add metadata to identify as admin and store role
            metadata: {
              isAdmin: 'true',
              role,
              permissions: JSON.stringify(admin.permissions.map(p => ({
                resource: p.resource,
                actions: p.actions
              })))
            }
          });
          
          workosUserId = workosUser.id;
          
          // Send verification email through WorkOS
          await workos.userManagement.sendVerificationEmail({
            userId: workosUserId
          });
        }
        
        // Update our database with the WorkOS ID
        admin.workosId = workosUserId;
        await admin.save();
      } catch (workosError) {
        console.error('Failed to create/update admin in WorkOS:', workosError);
        // Continue anyway since we've created the admin in our database
      }
      
      res.status(201).json({
        success: true,
        message: !userExistsInWorkOS ? 
          'Admin created successfully. A verification email has been sent to the admin\'s email address.' : 
          'Admin created successfully. This email is already registered with WorkOS.',
        verificationSent: !userExistsInWorkOS,
        data: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role
        }
      });
    } catch (error) {
      console.error('Create admin error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error while creating admin',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  },

  /**
   * Verify session status with WorkOS
   */
  async verifySession(req: Request, res: Response) {
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
      
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as jwt.JwtPayload;
      
      // Check if it's an admin token
      if (!decoded.isAdmin) {
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
      
      // Check if the WorkOS session is still valid
      if (admin.workosId) {
        try {
          // Get user from WorkOS to verify they still exist and are active
          const workosUser = await workos.userManagement.getUser(admin.workosId);
          
          // Return session information
          return res.json({
            success: true,
            session: {
              isValid: true,
              user: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                emailVerified: admin.emailVerified
              }
            }
          });
        } catch (workosError) {
          console.error('WorkOS session verification error:', workosError);
          return res.status(401).json({ 
            success: false,
            message: 'WorkOS session invalid or expired',
            error: process.env.NODE_ENV === 'development' ? (workosError as Error).message : undefined
          });
        }
      } else {
        return res.status(401).json({ 
          success: false,
          message: 'Admin account is not properly set up with WorkOS' 
        });
      }
    } catch (error) {
      console.error('Session verification error:', error);
      res.status(401).json({ 
        success: false,
        message: 'Invalid session',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  },

  /**
   * Logout admin user
   */
  async logout(req: Request, res: Response) {
    try {
      // In a real implementation with WorkOS sessions, you would invalidate the session
      // For now, we'll just return success since the client will clear localStorage
      
      // Note: WorkOS doesn't have a direct "logout" or "invalidate session" API
      // The client is responsible for removing the token from storage
      
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Server error during logout',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  },

  /**
   * Get all available roles and their default permissions
   */
  async getRoles(req: Request, res: Response) {
    try {
      const roles = Object.keys(DEFAULT_ROLE_PERMISSIONS).map(role => ({
        name: role,
        description: DEFAULT_ROLE_PERMISSIONS[role as keyof typeof DEFAULT_ROLE_PERMISSIONS].description,
        permissions: DEFAULT_ROLE_PERMISSIONS[role as keyof typeof DEFAULT_ROLE_PERMISSIONS].permissions
      }));

      res.json({
        success: true,
        data: roles
      });
    } catch (error) {
      console.error('Error getting roles:', error);
      res.status(500).json({ 
        success: false,
        message: 'Server error while getting roles',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  },

  /**
   * Get all admins with their roles
   */
  async getAdmins(req: Request, res: Response) {
    try {
      const admins = await Admin.find().select('-password').lean();
      
      res.json({
        success: true,
        data: admins
      });
    } catch (error) {
      console.error('Error getting admins:', error);
      res.status(500).json({ 
        success: false,
        message: 'Server error while getting admins',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  },

  /**
   * Update admin role and permissions
   */
  async updateAdminRole(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { role, customPermissions } = req.body;
      
      // Validate role
      if (role && !['superadmin', 'admin', 'editor', 'viewer'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role. Must be one of: superadmin, admin, editor, viewer'
        });
      }

      // Find the admin
      const admin = await Admin.findById(id);
      if (!admin) {
        return res.status(404).json({
          success: false,
          message: 'Admin not found'
        });
      }

      // Update role if provided
      if (role) {
        admin.role = role;
      }

      // Save to apply default permissions based on role
      await admin.save();

      // If custom permissions are provided, override the defaults
      if (customPermissions) {
        // Clear existing permissions
        // Use mongoose array methods to clear the array
        admin.permissions.splice(0, admin.permissions.length);
        
        // Add custom permissions
        customPermissions.forEach((perm: any) => {
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

        await admin.save();
      }

      // Update in WorkOS if possible
      if (admin.workosId) {
        try {
          await workos.userManagement.updateUser({
            userId: admin.workosId,
            metadata: {
              isAdmin: 'true',
              role: admin.role,
              permissions: JSON.stringify(admin.permissions.map(p => ({
                resource: p.resource,
                actions: p.actions
              })))
            }
          });
        } catch (workosError) {
          console.error('Failed to update admin in WorkOS:', workosError);
          // Continue anyway since we've updated the admin in our database
        }
      }

      res.json({
        success: true,
        message: 'Admin role and permissions updated successfully',
        data: admin
      });
    } catch (error) {
      console.error('Error updating admin role:', error);
      res.status(500).json({ 
        success: false,
        message: 'Server error while updating admin role',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  },

  /**
   * Delete an admin user
   */
  async deleteAdmin(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Find the admin to be deleted
      const adminToDelete = await Admin.findById(id);
      if (!adminToDelete) {
        return res.status(404).json({
          success: false,
          message: 'Admin not found'
        });
      }
      
      // Check if the admin is trying to delete themselves
      if (req.admin && req.admin._id.toString() === id) {
        return res.status(400).json({
          success: false,
          message: 'You cannot delete your own account'
        });
      }
      
      // Delete from WorkOS if possible
      if (adminToDelete.workosId) {
        try {
          // WorkOS doesn't have a direct method to delete users
          // Instead, we can update the user to mark them as deleted in metadata
          await workos.userManagement.updateUser({
            userId: adminToDelete.workosId,
            metadata: {
              deleted: 'true',
              deletedAt: new Date().toISOString()
            }
          });
        } catch (workosError) {
          console.error('Failed to mark admin as deleted in WorkOS:', workosError);
          // Continue anyway since we'll delete from our database
        }
      }
      
      // Delete from our database
      await Admin.findByIdAndDelete(id);
      
      res.json({
        success: true,
        message: 'Admin deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting admin:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error while deleting admin',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  }
};