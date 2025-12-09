import { Request, Response } from 'express';
import { WorkOS } from '@workos-inc/node';
import { User } from '../models/User';

// Initialize WorkOS client
// Use the API key from environment variables or fallback to a hardcoded value
const apiKey = process.env.WORKOS_API_KEY || 'sk_test_a2V5XzAxSzFDVzc4WURDWjk1WU1FMFhDNzY3MFBGLGw5dmxoandINzlmZmZvSG1hd0NEOGRTUE0';

// Log API key status for debugging
console.log('WorkOS API Key status:', apiKey ? 'Available' : 'Missing');

// Initialize WorkOS with the API key
const workos = new WorkOS(apiKey);

export const securityController = {
  /**
   * Get user security settings
   */
  async getSecuritySettings(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      // Find user in our database
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Get MFA status from user record
      let mfaEnabled = user.mfaEnabled || false;
      let mfaEnrolled = !!user.mfaFactorId;
      let mfaFactorId = user.mfaFactorId;
      
      // If user has MFA enabled in our database but no factor ID, verify with WorkOS
      if (mfaEnabled && !mfaFactorId && user.workosId) {
        try {
          console.log(`Verifying MFA status for user ${user.id} with WorkOS`);
          
          // Try to get MFA factors from WorkOS
          let mfaMethods;
          try {
            mfaMethods = await (workos.mfa as any).listAuthenticationFactors({
              userId: user.workosId
            });
            
            // If no factors found in WorkOS but enabled in our DB, update our records
            if (!mfaMethods?.data || mfaMethods.data.length === 0) {
              console.log(`No MFA factors found in WorkOS for user ${user.id}, updating local record`);
              user.mfaEnabled = false;
              user.mfaFactorId = undefined;
              await user.save();
              
              mfaEnabled = false;
              mfaEnrolled = false;
            } else {
              // Found factors in WorkOS, update our record if needed
              const factor = mfaMethods.data[0];
              if (!user.mfaFactorId) {
                user.mfaFactorId = factor.id;
                await user.save();
                mfaFactorId = factor.id;
              }
            }
          } catch (mfaError) {
            console.error('Error listing MFA factors:', mfaError);
            // Continue with values from database
          }
        } catch (workosError) {
          console.error('Error verifying WorkOS MFA status:', workosError);
          // Continue with values from database
        }
      }
      
      res.json({
        success: true,
        security: {
          mfaEnabled,
          mfaEnrolled,
          mfaFactorId: user.mfaFactorId || null,
          email: user.email,
          lastPasswordChange: user.updatedAt || user.createdAt
        }
      });
    } catch (error) {
      console.error('Error fetching security settings:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error while fetching security settings',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  },
  
  /**
   * Change user password
   */
  async changePassword(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { currentPassword, newPassword } = req.body;
      
      if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current password and new password are required' });
      }
      
      // Find user in our database
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Verify current password
      const bcrypt = require('bcryptjs');
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }
      
      // If user has a WorkOS ID, update password in WorkOS
      if (user.workosId) {
        try {
          await workos.userManagement.updateUser({
            userId: user.workosId,
            password: newPassword
          });
        } catch (workosError) {
          console.error('Error updating WorkOS password:', workosError);
          return res.status(500).json({ 
            success: false, 
            message: 'Failed to update password in authentication service',
            error: process.env.NODE_ENV === 'development' ? (workosError as Error).message : undefined
          });
        }
      }
      
      // Update password in our database
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();
      
      res.json({
        success: true,
        message: 'Password updated successfully'
      });
    } catch (error) {
      console.error('Error changing password:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error while changing password',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  },
  
  /**
   * Enable MFA for a user
   */
  async enableMFA(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      // Find user in our database
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Check if user has a WorkOS ID
      if (!user.workosId) {
        return res.status(400).json({ message: 'User not set up for MFA' });
      }
      
      try {
        // Start MFA enrollment process with WorkOS
        // Using the documented API from WorkOS
        const factor = await workos.mfa.enrollFactor({
          type: 'totp',
          issuer: 'JDM Global',
          user: user.email
        });
        
        console.log('MFA factor enrolled:', factor);
        
        // Return the enrollment data to the client
        // Cast to any to handle property name differences between TypeScript definitions and actual API
        const factorAny = factor as any;
        res.json({
          success: true,
          enrollment: {
            factorId: factor.id,
            qrCode: factorAny.totp?.qr_code || factorAny.totp?.qrCode || '',
            secret: factorAny.totp?.secret || '',
            uri: factorAny.totp?.uri || ''
          }
        });
      } catch (workosError) {
        console.error('Error enrolling MFA:', workosError);
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to set up MFA',
          error: process.env.NODE_ENV === 'development' ? (workosError as Error).message : undefined
        });
      }
    } catch (error) {
      console.error('Error enabling MFA:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error while enabling MFA',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  },
  
  /**
   * Verify MFA setup
   */
  async verifyMFA(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { factorId, code } = req.body;
      
      if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      if (!factorId || !code) {
        return res.status(400).json({ message: 'Factor ID and verification code are required' });
      }
      
      // Find user in our database
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      try {
        // First, challenge the factor
        console.log('Challenging factor:', factorId);
        // Cast to any to handle method name differences
        const challenge = await (workos.mfa as any).challengeFactor({
          authenticationFactorId: factorId
        });
        
        console.log('Challenge created:', challenge);
        
        // Then verify the challenge
        // Cast to any to handle method name differences
        const { valid } = await (workos.mfa as any).verifyChallenge({
          authenticationChallengeId: challenge.id,
          code
        });
        
        console.log('Challenge verification result:', valid);
        
        if (valid) {
          // Update user MFA status in our database
          // This is important to track which users have MFA enabled
          user.mfaEnabled = true;
          user.mfaFactorId = factorId;
          await user.save();
          
          console.log(`MFA enabled for user ${user.id} with factor ${factorId}`);
          
          res.json({
            success: true,
            message: 'MFA setup verified successfully',
            valid: true
          });
        } else {
          res.status(400).json({
            success: false,
            message: 'Invalid verification code',
            valid: false
          });
        }
      } catch (workosError) {
        console.error('Error verifying MFA:', workosError);
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to verify MFA setup',
          error: process.env.NODE_ENV === 'development' ? (workosError as Error).message : undefined
        });
      }
    } catch (error) {
      console.error('Error verifying MFA:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error while verifying MFA',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  },
  
  /**
   * Disable MFA for a user
   */
  async disableMFA(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { factorId } = req.body;
      
      if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      // Find user in our database
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Check if user has a WorkOS ID
      if (!user.workosId) {
        return res.status(400).json({ message: 'User not set up for MFA' });
      }
      
      try {
        if (factorId) {
          // Delete the specific MFA factor
          console.log('Deleting specific factor:', factorId);
          // Cast to any to handle method name differences
          await (workos.mfa as any).deleteAuthenticationFactor(factorId);
        } else {
          // Get all factors and delete them
          console.log('Listing authentication factors for user:', user.workosId);
          
          // Use the documented API method
          // Cast to any to handle method name differences
          const factors = await (workos.mfa as any).listAuthenticationFactors({
            userId: user.workosId
          });
          
          console.log('Found factors:', factors.data);
          
          for (const factor of factors.data || []) {
            console.log('Deleting factor:', factor.id);
            // Cast to any to handle method name differences
            await (workos.mfa as any).deleteAuthenticationFactor(factor.id);
          }
        }
        
        // Update user record to reflect MFA disabled status
        user.mfaEnabled = false;
        user.mfaFactorId = undefined;
        await user.save();
        
        console.log(`MFA disabled for user ${user.id}`);
        
        res.json({
          success: true,
          message: 'MFA disabled successfully'
        });
      } catch (workosError) {
        console.error('Error disabling MFA:', workosError);
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to disable MFA',
          error: process.env.NODE_ENV === 'development' ? (workosError as Error).message : undefined
        });
      }
    } catch (error) {
      console.error('Error disabling MFA:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error while disabling MFA',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  }
};
