import { Request, Response } from 'express';
import { getEmailTransporter, getDefaultFromAddress } from '../services/emailService';
import { verifyTurnstileToken } from '../utils/turnstile';

interface ContactFormPayload {
  name?: string;
  email?: string;
  phone?: string;
  country?: string;
  subject?: string;
  inquiryType?: string;
  message?: string;
  turnstileToken?: string;
}

const CONTACT_EMAIL_TO = process.env.CONTACT_EMAIL_TO || process.env.SMTP_USER || 'contact@sky-linetrd.com';

export const contactController = {
  async submitContactForm(req: Request, res: Response) {
    try {
      const {
        name,
        email,
        phone,
        country,
        subject,
        inquiryType,
        message,
        turnstileToken,
      }: ContactFormPayload = req.body || {};

      if (!turnstileToken) {
        return res.status(400).json({
          success: false,
          message: 'Security verification is required.',
        });
      }

      const turnstileResult = await verifyTurnstileToken(turnstileToken, req.ip);

      if (!turnstileResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Security verification failed. Please try again.',
          errors: turnstileResult['error-codes'] || [],
        });
      }

      if (!name || !email || !subject || !inquiryType || !message) {
        return res.status(400).json({
          success: false,
          message: 'Please fill out all required fields.',
        });
      }

      const transporter = await getEmailTransporter();

      const htmlBody = `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
        <p><strong>Country:</strong> ${country || 'N/A'}</p>
        <p><strong>Inquiry Type:</strong> ${inquiryType}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br/>')}</p>
      `;

      await transporter.sendMail({
        from: getDefaultFromAddress(),
        to: CONTACT_EMAIL_TO,
        replyTo: email,
        subject: `[Contact Form] ${subject}`,
        html: htmlBody,
      });

      res.json({
        success: true,
        message: 'Message sent successfully.',
      });
    } catch (error) {
      console.error('Error handling contact form submission:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit message. Please try again later.',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      });
    }
  },
};
