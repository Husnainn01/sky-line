import { Request, Response } from 'express';
import { WorkOS } from '@workos-inc/node';
import { User } from '../models/User';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

// Initialize WorkOS client
const apiKey = process.env.WORKOS_API_KEY || '';
const workos = new WorkOS(apiKey);

// Create a test account for development if no SMTP settings are provided
let transporter: nodemailer.Transporter;

async function setupTransporter() {
  if (process.env.SMTP_HOST && process.env.SMTP_PORT) {
    // Use provided SMTP settings
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    });
  } else {
    // Create a test account for development
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('Using test email account:', testAccount.user);
  }
}

// Setup transporter on module load
setupTransporter().catch(console.error);

export const profileController = {
  /**
   * Get user profile
   */
  async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      // Find user in our database
      const user = await User.findById(userId).select('-password -emailChangeToken -emailChangeExpires');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Format the profile data for the frontend
      const profile = {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        company: user.company || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        zipCode: user.zipCode || '',
        country: user.country || '',
        role: user.role,
        pendingEmail: user.pendingEmail,
        mfaEnabled: user.mfaEnabled,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
      
      res.json({
        success: true,
        profile
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error while fetching profile',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  },

  /**
   * Update user profile (except email)
   */
  async updateProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { name, phone, company, address, city, state, zipCode, country } = req.body;
      
      if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      // Find user in our database
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Update user fields
      if (name) user.name = name;
      if (phone !== undefined) user.phone = phone;
      if (company !== undefined) user.company = company;
      if (address !== undefined) user.address = address;
      if (city !== undefined) user.city = city;
      if (state !== undefined) user.state = state;
      if (zipCode !== undefined) user.zipCode = zipCode;
      if (country !== undefined) user.country = country;
      
      user.updatedAt = new Date();
      await user.save();
      
      // If user has a WorkOS ID, update their info there too
      if (user.workosId) {
        try {
          // Split name into first and last name for WorkOS
          const nameParts = name ? name.split(' ') : [];
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';
          
          await workos.userManagement.updateUser({
            userId: user.workosId,
            firstName,
            lastName,
          });
        } catch (workosError) {
          console.error('WorkOS user update error:', workosError);
          // Continue even if WorkOS update fails
        }
      }
      
      res.json({
        success: true,
        message: 'Profile updated successfully',
        profile: {
          name: user.name,
          email: user.email,
          phone: user.phone,
          company: user.company,
          address: user.address,
          city: user.city,
          state: user.state,
          zipCode: user.zipCode,
          country: user.country,
          pendingEmail: user.pendingEmail
        }
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error while updating profile',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  },

  /**
   * Request email change
   */
  async requestEmailChange(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { newEmail } = req.body;
      
      if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      if (!newEmail) {
        return res.status(400).json({ message: 'New email is required' });
      }
      
      // Find user in our database
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Check if email is already in use
      const existingUser = await User.findOne({ email: newEmail });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already in use' });
      }
      
      // Generate verification token
      const token = crypto.randomBytes(32).toString('hex');
      const expires = new Date();
      expires.setHours(expires.getHours() + 24); // 24 hour expiration
      
      // Save pending email and token
      user.pendingEmail = newEmail;
      user.emailChangeToken = token;
      user.emailChangeExpires = expires;
      await user.save();
      
      // Send verification email
      const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/verify-email-change?token=${token}`;
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@jdmglobal.com',
        to: newEmail,
        subject: 'Verify Your Email Change',
        html: `
          <h1>Email Change Verification</h1>
          <p>Hello ${user.name},</p>
          <p>You requested to change your email address. Please click the link below to verify your new email:</p>
          <p><a href="${verificationUrl}">Verify Email Change</a></p>
          <p>This link will expire in 24 hours.</p>
          <p>If you did not request this change, please ignore this email or contact support.</p>
        `
      };
      
      const info = await transporter.sendMail(mailOptions);
      console.log('Verification email sent:', info.messageId);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
      }
      
      res.json({
        success: true,
        message: 'Verification email sent to your new email address',
        pendingEmail: newEmail
      });
    } catch (error) {
      console.error('Error requesting email change:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error while requesting email change',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  },

  /**
   * Verify email change
   */
  async verifyEmailChange(req: Request, res: Response) {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ message: 'Verification token is required' });
      }
      
      // Find user with this token
      const user = await User.findOne({ 
        emailChangeToken: token,
        emailChangeExpires: { $gt: new Date() } // Token not expired
      });
      
      if (!user || !user.pendingEmail) {
        return res.status(400).json({ message: 'Invalid or expired verification token' });
      }
      
      const oldEmail = user.email;
      const newEmail = user.pendingEmail;
      
      // Update user email
      user.email = newEmail;
      user.pendingEmail = undefined;
      user.emailChangeToken = undefined;
      user.emailChangeExpires = undefined;
      user.updatedAt = new Date();
      await user.save();
      
      // If user has a WorkOS ID, update their email there too
      if (user.workosId) {
        try {
          await workos.userManagement.updateUser({
            userId: user.workosId,
            email: newEmail,
          });
        } catch (workosError) {
          console.error('WorkOS email update error:', workosError);
          // Continue even if WorkOS update fails
        }
      }
      
      res.json({
        success: true,
        message: 'Email changed successfully',
        email: newEmail
      });
    } catch (error) {
      console.error('Error verifying email change:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error while verifying email change',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  },

  /**
   * Cancel email change
   */
  async cancelEmailChange(req: Request, res: Response) {
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
      
      // Clear pending email change
      user.pendingEmail = undefined;
      user.emailChangeToken = undefined;
      user.emailChangeExpires = undefined;
      await user.save();
      
      res.json({
        success: true,
        message: 'Email change request cancelled'
      });
    } catch (error) {
      console.error('Error cancelling email change:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error while cancelling email change',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  }
};
