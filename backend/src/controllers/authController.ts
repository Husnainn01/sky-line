import { Request, Response } from 'express';
import { WorkOS } from '@workos-inc/node';
import { User } from '../models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Initialize WorkOS client
// Make sure the API key is properly loaded from environment variables
const apiKey = process.env.WORKOS_API_KEY;
if (!apiKey) {
  console.error('WARNING: WorkOS API key is not set in environment variables');
}

// Initialize WorkOS with the API key
const workos = new WorkOS(apiKey || 'sk_test_a2V5XzAxSzFDVzc4WURDWjk1WU1FMFhDNzY3MFBGLGw5dmxoandINzlmZmZvSG1hd0NEOGRTUE0');

export const authController = {
  /**
   * Request email verification code
   */
  async requestVerification(req: Request, res: Response) {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }
      
      // Check if user already exists in our database
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'This email is already registered. Please try logging in instead.' });
      }
      
      // Check if the user exists in WorkOS but not in our database
      try {
        // Try to find the user by email in WorkOS
        const workosUsers = await workos.userManagement.listUsers({
          email
        });
        
        // If user exists in WorkOS but not in our database, we can handle it
        if (workosUsers.data && workosUsers.data.length > 0) {
          return res.status(400).json({ 
            success: false,
            message: 'This email is already registered. Please try logging in instead.'
          });
        }
      } catch (error) {
        // Ignore errors here, as we're just checking if the user exists
        console.log('WorkOS user check error:', error);
      }
      
      try {
        // Create a temporary user in WorkOS to send verification email
        const tempUser = await workos.userManagement.createUser({
          email,
          firstName: 'Pending',
          lastName: 'Verification',
          password: Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2), // Random password that will be updated later
        });
        
        // Send verification email using WorkOS
        await workos.userManagement.sendVerificationEmail({
          userId: tempUser.id,
          // @ts-ignore - redirectUri is supported in the API but not in types
          redirectUri: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/verify-email`
        });
        
        // Return success
        res.json({
          success: true,
          message: 'Verification email sent successfully',
          tempUserId: tempUser.id // This would be encrypted in a real production app
        });
      } catch (error: any) {
        console.error('Verification request error:', error);
        
        // Check for specific WorkOS errors
        if (error.code === 'user_creation_error' && error.errors) {
          const emailError = error.errors.find((e: any) => e.code === 'email_not_available');
          if (emailError) {
            return res.status(400).json({
              success: false,
              message: 'This email is already registered. Please try logging in instead.'
            });
          }
        }
        
        // Generic error response
        res.status(500).json({ 
          success: false, 
          message: 'Failed to send verification email',
          error: process.env.NODE_ENV === 'development' ? (error.message || 'Unknown error') : undefined
        });
      }
    } catch (error) {
      console.error('Verification request error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error during verification request',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  },
  /**
   * Register a new user
   */
  async register(req: Request, res: Response) {
    try {
      const { name, email, password, company, phone, tempUserId, verificationCode } = req.body;
      
      // Validate input
      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please provide name, email and password' });
      }
      
      // Require tempUserId from verification step
      if (!tempUserId) {
        return res.status(400).json({ message: 'Email verification is required before registration' });
      }
      
      // Check if user already exists in our database
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }
      
      // Verify the email using the verification code if provided
      if (verificationCode) {
        try {
          // Verify the code with WorkOS
          await workos.userManagement.verifyEmail({
            userId: tempUserId,
            code: verificationCode
          });
        } catch (error) {
          console.error('Verification code error:', error);
          return res.status(400).json({ message: 'Invalid verification code' });
        }
      }
      
      // Get the WorkOS user to check verification status
      try {
        const workosUser = await workos.userManagement.getUser(tempUserId);
        
        // Check if the email is verified (either by link or code)
        if (!workosUser.emailVerified) {
          return res.status(400).json({ message: 'Email verification is required before registration' });
        }
        
        // Check if the email matches
        if (workosUser.email !== email) {
          return res.status(400).json({ message: 'Email does not match verified email' });
        }
      } catch (error) {
        console.error('WorkOS user verification error:', error);
        return res.status(400).json({ message: 'Invalid or expired verification' });
      }
      
      try {
        // Create user in WorkOS
        const workosUser = await workos.userManagement.createUser({
          email,
          firstName: name.split(' ')[0],
          lastName: name.split(' ').slice(1).join(' ') || '',
          password
        });
        
        // Send verification email
        await workos.userManagement.sendVerificationEmail({
          userId: workosUser.id,
          // redirectUri is not supported in the type definition but works in the API
          // @ts-ignore
          redirectUri: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/verify-email`
        });
        
        // Hash password for our database
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create user in our database
        const user = new User({
          name,
          email,
          password: hashedPassword,
          company,
          phone,
          role: 'user',
          workosId: workosUser.id // Store WorkOS user ID for reference
        });
        
        await user.save();
        
        // Create JWT token instead of WorkOS session (WorkOS sessions API not available in current version)
        const token = jwt.sign(
          { id: user._id, email: user.email, role: user.role, workosId: workosUser.id },
          process.env.JWT_SECRET || 'default_secret',
          { expiresIn: process.env.JWT_EXPIRES_IN || '24h' } as jwt.SignOptions
        );
        
        // Return user data and JWT token
        res.status(201).json({
          success: true,
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            verified: true // User is already verified since we checked before registration
          },
          message: 'Registration successful!'
        });
      } catch (workosError) {
        console.error('WorkOS Error:', workosError);
        
        // If WorkOS fails but we want to continue with local registration only
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = new User({
          name,
          email,
          password: hashedPassword,
          company,
          phone,
          role: 'user'
        });
        
        await user.save();
        
        const token = jwt.sign(
          { id: user._id, email: user.email, role: user.role },
          process.env.JWT_SECRET || 'default_secret',
          { expiresIn: process.env.JWT_EXPIRES_IN || '24h' } as jwt.SignOptions
        );
        
        res.status(201).json({
          success: true,
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
          },
          warning: 'User created in local database only. WorkOS integration failed.'
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error during registration',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  },
  
  /**
   * Login an existing user
   */
  async login(req: Request, res: Response) {
    try {
      const { email, password, rememberMe } = req.body;
      
      // Validate input
      if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password' });
      }
      
      // Set token expiration based on rememberMe flag
      const tokenExpiration = rememberMe ? '30d' : '24h'; // 30 days or 24 hours
      
      // Find user in our database
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Check if user has a WorkOS ID
      if (!user.workosId) {
        // Create a WorkOS user if one doesn't exist
        try {
          console.log(`Creating WorkOS user for ${email}`);
          const newWorkosUser = await workos.userManagement.createUser({
            email,
            firstName: user.name.split(' ')[0],
            lastName: user.name.split(' ').slice(1).join(' ') || '',
            password, // Use the same password they provided
          });
          
          // Update our database with the new WorkOS ID
          user.workosId = newWorkosUser.id;
          await user.save();
          
          console.log(`Created WorkOS user with ID: ${newWorkosUser.id}`);
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
                  user.workosId = workosUsers.data[0].id;
                  await user.save();
                  console.log(`Found existing WorkOS user with ID: ${user.workosId}`);
                }
              } catch (listError) {
                console.error('Error listing WorkOS users:', listError);
              }
            }
          }
          
          if (!user.workosId) {
            console.error('Failed to create or find WorkOS user:', createError);
            return res.status(500).json({ 
              success: false, 
              message: 'Failed to set up authentication',
              error: process.env.NODE_ENV === 'development' ? (createError as Error).message : undefined
            });
          }
        }
      }
      
      try {
        // Now authenticate with WorkOS using the workosId we have
        console.log(`Authenticating with WorkOS for user ID: ${user.workosId}`);
        const authResponse = await workos.userManagement.authenticateWithPassword({
          email,
          password,
          clientId: process.env.WORKOS_CLIENT_ID || ''
        });
        
        // Check if user is verified
        const workosUser = await workos.userManagement.getUser(authResponse.user.id);
        
        // Check if MFA is required for this user
        if (user.mfaEnabled && user.mfaFactorId) {
          // If MFA is enabled, we need to return a partial auth response
          console.log(`MFA required for user ${user.id} with factor ${user.mfaFactorId}`);
          return res.json({
            success: true,
            requiresMfa: true,
            mfaFactorId: user.mfaFactorId,
            user: {
              id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
              verified: workosUser.emailVerified || false
            }
          });
        }
        
        // Create JWT token (MFA not required)
        const token = jwt.sign(
          { id: user._id, email: user.email, role: user.role, workosId: authResponse.user.id },
          process.env.JWT_SECRET || 'default_secret',
          { expiresIn: tokenExpiration } as jwt.SignOptions
        );
        
        // Return user data and JWT token
        res.json({
          success: true,
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            verified: workosUser.emailVerified || false
          }
        });
      } catch (workosError) {
        console.error('WorkOS Authentication Error:', workosError);
        return res.status(401).json({ 
          success: false, 
          message: 'Authentication failed. Please check your credentials.',
          error: process.env.NODE_ENV === 'development' ? (workosError as Error).message : undefined
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error during login',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  },
  
  /**
   * Get the current user's profile
   */
  async getProfile(req: Request, res: Response) {
    try {
      // Get token from header
      const authHeader = req.header('Authorization');
      const token = authHeader && authHeader.startsWith('Bearer ') 
        ? authHeader.substring(7) 
        : null;
      
      if (!token) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      try {
        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as jwt.JwtPayload;
        
        // Get user from our database
        const user = await User.findById(decoded.id);
        
        if (!user) {
          return res.status(401).json({ message: 'User not found' });
        }
        
        res.json({
          success: true,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            company: user.company,
            phone: user.phone,
            verified: false // We would need to check with WorkOS API
          }
        });
      } catch (sessionError) {
        console.error('Session verification error:', sessionError);
        return res.status(401).json({ message: 'Invalid session' });
      }
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error while fetching profile',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  },
  
  /**
   * Request password reset
   */
  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }
      
      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        // For security reasons, don't reveal that the user doesn't exist
        return res.json({ 
          success: true, 
          message: 'If your email is registered, you will receive a password reset link shortly' 
        });
      }
      
      // Check if the user has a WorkOS ID or exists in WorkOS
      let workosId = user.workosId;
      
      // If user doesn't have a WorkOS ID stored, check if they exist in WorkOS
      if (!workosId) {
        try {
          // Try to find the user in WorkOS by email
          const workosUsers = await workos.userManagement.listUsers({
            email
          });
          
          // If we found the user in WorkOS, use that ID
          if (workosUsers.data && workosUsers.data.length > 0) {
            const workosUser = workosUsers.data[0];
            workosId = workosUser.id;
            
            // Update our database with the WorkOS ID
            user.workosId = workosId;
            await user.save();
            console.log(`Updated user with WorkOS ID: ${workosId}`);
          } else {
            // User doesn't exist in WorkOS - inform them they need to register
            return res.status(400).json({ 
              success: false, 
              message: 'This account was created before our new authentication system. Please register again.'
            });
          }
        } catch (workosError) {
          console.error('Error checking WorkOS user:', workosError);
          return res.status(500).json({ 
            success: false, 
            message: 'Failed to process password reset request',
            error: process.env.NODE_ENV === 'development' ? (workosError as Error).message : undefined
          });
        }
      }
      
      try {
        // Send password reset email via WorkOS
        await workos.userManagement.sendPasswordResetEmail({
          email,
          // Use the correct parameter name according to TypeScript definitions
          passwordResetUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/reset-password`
        });
        
        res.json({
          success: true,
          message: 'Password reset email sent successfully'
        });
      } catch (workosError) {
        console.error('WorkOS password reset error:', workosError);
        res.status(500).json({ 
          success: false, 
          message: 'Failed to send password reset email',
          error: process.env.NODE_ENV === 'development' ? (workosError as Error).message : undefined
        });
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error during password reset request',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  },
  
  /**
   * Reset password with token
   */
  async resetPassword(req: Request, res: Response) {
    try {
      const { token, password } = req.body;
      
      if (!token || !password) {
        return res.status(400).json({ message: 'Token and new password are required' });
      }
      
      try {
        // Reset password via WorkOS
        await workos.userManagement.resetPassword({
          token,
          newPassword: password
        });
        
        res.json({
          success: true,
          message: 'Password reset successfully'
        });
      } catch (workosError) {
        console.error('WorkOS password reset error:', workosError);
        res.status(400).json({ 
          success: false, 
          message: 'Invalid or expired password reset token',
          error: process.env.NODE_ENV === 'development' ? (workosError as Error).message : undefined
        });
      }
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error during password reset',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  },
  
  /**
   * Verify MFA during login
   */
  async verifyMfaLogin(req: Request, res: Response) {
    try {
      const { email, factorId, code, rememberMe } = req.body;
      
      if (!email || !factorId || !code) {
        return res.status(400).json({ message: 'Email, factor ID, and verification code are required' });
      }
      
      // Find user in our database
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Verify the user has MFA enabled and this is the correct factor
      if (!user.mfaEnabled || user.mfaFactorId !== factorId) {
        return res.status(401).json({ message: 'MFA not properly configured for this account' });
      }
      
      try {
        // Challenge the factor
        console.log('Challenging MFA factor during login:', factorId);
        const challenge = await (workos.mfa as any).challengeFactor({
          authenticationFactorId: factorId
        });
        
        // Verify the challenge
        const { valid } = await (workos.mfa as any).verifyChallenge({
          authenticationChallengeId: challenge.id,
          code
        });
        
        if (!valid) {
          return res.status(401).json({ message: 'Invalid verification code' });
        }
        
        // Set token expiration based on rememberMe flag
        const tokenExpiration = rememberMe ? '30d' : '24h'; // 30 days or 24 hours
        
        // Create JWT token
        const token = jwt.sign(
          { id: user._id, email: user.email, role: user.role, workosId: user.workosId },
          process.env.JWT_SECRET || 'default_secret',
          { expiresIn: tokenExpiration } as jwt.SignOptions
        );
        
        // Return user data and JWT token
        res.json({
          success: true,
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            verified: true
          }
        });
      } catch (mfaError) {
        console.error('MFA verification error:', mfaError);
        return res.status(401).json({ message: 'MFA verification failed' });
      }
    } catch (error) {
      console.error('MFA login verification error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error during MFA verification',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  },
  
  /**
   * Logout user
   */
  async logout(req: Request, res: Response) {
    try {
      // Get token from header
      const authHeader = req.header('Authorization');
      const token = authHeader && authHeader.startsWith('Bearer ') 
        ? authHeader.substring(7) 
        : null;
      
      if (!token) {
        return res.status(400).json({ message: 'No token provided' });
      }
      
      // In a real token blacklist implementation, you would add the token to a blacklist
      // For JWT, we can't truly invalidate tokens on the server side without a blacklist
      // The client is responsible for removing the token from storage
      
      // Return success response
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
   * Verify user email
   */
  async verifyEmail(req: Request, res: Response) {
    try {
      const { code } = req.query;
      
      if (!code) {
        return res.status(400).json({ message: 'Verification code is required' });
      }
      
      try {
        // Verify email with WorkOS
        // Note: In the actual WorkOS API, we need to extract the userId from the code
        // or use a different API call, but for now we'll use this approach
        
        // For manual verification code entry, we need to find the user with this code
        // This is a simplified version - in production, you'd need to store verification codes
        // or use WorkOS's API differently
        
        // Mock verification for development
        if (process.env.NODE_ENV !== 'production') {
          // In development, accept any code for testing
          console.log('Development mode: Accepting verification code', code);
          
          // In production, you'd verify with WorkOS here
          // await workos.userManagement.verifyEmail(...);
          
          res.json({
            success: true,
            message: 'Email verified successfully'
          });
          return;
        }
        
        // Production verification
        await workos.userManagement.verifyEmail({
          code: code as string,
          userId: 'extracted-from-code' // This is just to satisfy TypeScript
        });
        
        res.json({
          success: true,
          message: 'Email verified successfully'
        });
      } catch (verifyError) {
        console.error('Email verification error:', verifyError);
        return res.status(400).json({ 
          success: false,
          message: 'Invalid verification code' 
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
  }
};
