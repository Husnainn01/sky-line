import { Request, Response } from 'express';
import { WorkOS } from '@workos-inc/node';
import crypto from 'crypto';

// Initialize WorkOS client
const apiKey = process.env.WORKOS_API_KEY;
if (!apiKey) {
  console.error('WARNING: WorkOS API key is not set in environment variables');
}

// Initialize WorkOS with the API key
const workos = new WorkOS(apiKey || 'sk_test_a2V5XzAxSzFDVzc4WURDWjk1WU1FMFhDNzY3MFBGLGw5dmxoandINzlmZmZvSG1hd0NEOGRTUE0');

// Store verification codes temporarily (in production, use Redis or another persistent store)
const verificationCodes: Record<string, { code: string, expires: Date }> = {};

export const adminVerificationController = {
  /**
   * Send a verification code to an email address
   */
  async sendVerificationCode(req: Request, res: Response) {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ 
          success: false,
          message: 'Email is required' 
        });
      }
      
      // Generate a random 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store the code with an expiration time (10 minutes)
      const expires = new Date();
      expires.setMinutes(expires.getMinutes() + 10);
      verificationCodes[email] = { code, expires };
      
      // Send the code via email using WorkOS
      try {
        // Since WorkOS doesn't have a direct email sending API, we'll use their user management API
        // to send a verification email and then store our own code
        
        // In a production environment, you would use a proper email service like SendGrid, Mailgun, etc.
        // For demonstration purposes, we're logging the code to the server console
        // In a real production environment, this would be replaced with actual email sending
        console.log(`Verification code sent to ${email}`);
        console.log(`CODE: ${code} (expires in 10 minutes)`);
        
        // TODO: Replace with actual email sending service integration
        
        // In a real implementation, you would do something like this:
        // await emailService.send({
        //   to: email,
        //   from: 'noreply@jdmglobal.com',
        //   subject: 'Your JDM Global Admin Verification Code',
        //   html: `
        //     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        //       <h2>JDM Global Admin Verification</h2>
        //       <p>Your verification code is: <strong>${code}</strong></p>
        //       <p>This code will expire in 10 minutes.</p>
        //       <p>If you did not request this code, please ignore this email.</p>
        //     </div>
        //   `
        // });
        
        return res.json({
          success: true,
          message: 'Verification code sent successfully',
          expiresIn: 600 // 10 minutes in seconds
        });
      } catch (emailError: any) {
        console.error('Failed to send verification email:', emailError);
        return res.status(500).json({ 
          success: false,
          message: 'Failed to send verification email',
          error: process.env.NODE_ENV === 'development' ? emailError.message : undefined
        });
      }
    } catch (error) {
      console.error('Send verification code error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error while sending verification code',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  },
  
  /**
   * Verify a code for an email address
   */
  async verifyCode(req: Request, res: Response) {
    try {
      const { email, code } = req.body;
      
      if (!email || !code) {
        return res.status(400).json({ 
          success: false,
          message: 'Email and code are required' 
        });
      }
      
      // Check if there's a stored code for this email
      const storedData = verificationCodes[email];
      if (!storedData) {
        return res.status(400).json({ 
          success: false,
          message: 'No verification code found for this email' 
        });
      }
      
      // Check if the code has expired
      if (new Date() > storedData.expires) {
        // Remove the expired code
        delete verificationCodes[email];
        
        return res.status(400).json({ 
          success: false,
          message: 'Verification code has expired' 
        });
      }
      
      // Check if the code matches
      if (storedData.code !== code) {
        return res.status(400).json({ 
          success: false,
          message: 'Invalid verification code' 
        });
      }
      
      // Code is valid, remove it from storage
      delete verificationCodes[email];
      
      return res.json({
        success: true,
        message: 'Email verified successfully',
        verified: true
      });
    } catch (error) {
      console.error('Verify code error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error while verifying code',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  }
};
