import fs from 'fs';
import path from 'path';
import { createTransport, emailConfig } from '../config/email';
import logger from '../utils/logger';

interface SendOTPParams {
  email: string;
  otpCode: string;
  expiryMinutes?: number;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

class EmailService {
  private transport;
  private otpTemplate: string;

  constructor() {
    this.transport = createTransport();
    this.otpTemplate = this.loadTemplate('otp-email.html');
  }

  /**
   * Load email template from file
   */
  private loadTemplate(templateName: string): string {
    try {
      const templatePath = path.join(__dirname, '../templates', templateName);
      const template = fs.readFileSync(templatePath, 'utf-8');
      logger.info(`Email template loaded: ${templateName}`);
      return template;
    } catch (error) {
      logger.error(`Failed to load email template ${templateName}:`, error);
      throw new Error(`Email template not found: ${templateName}`);
    }
  }

  /**
   * Replace placeholders in template with actual values
   */
  private replaceTemplatePlaceholders(template: string, replacements: Record<string, string>): string {
    let result = template;
    for (const [key, value] of Object.entries(replacements)) {
      const placeholder = `{{${key}}}`;
      result = result.replace(new RegExp(placeholder, 'g'), value);
    }
    return result;
  }

  /**
   * Send OTP verification email
   */
  async sendOTP({ email, otpCode, expiryMinutes = 5 }: SendOTPParams): Promise<EmailResult> {
    try {
      // Validate inputs
      if (!email || !otpCode) {
        throw new Error('Email and OTP code are required');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Invalid email format');
      }

      // Prepare email content
      const htmlContent = this.replaceTemplatePlaceholders(this.otpTemplate, {
        OTP_CODE: otpCode,
      });

      // Email options
      const mailOptions = {
        from: `"${emailConfig.from.name}" <${emailConfig.from.address}>`,
        to: email,
        subject: 'Verify Your Email - Bookstore Registration',
        html: htmlContent,
        text: `Your verification code is: ${otpCode}. This code will expire in ${expiryMinutes} minutes.`,
      };

      // Send email
      logger.info(`Sending OTP email to: ${email}`);
      const info = await this.transport.sendMail(mailOptions);
      
      logger.info(`OTP email sent successfully to ${email}. Message ID: ${info.messageId}`);
      
      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Failed to send OTP email to ${email}:`, error);
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Verify email service is working
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transport.verify();
      logger.info('Email service connection verified');
      return true;
    } catch (error) {
      logger.error('Email service connection failed:', error);
      return false;
    }
  }
}

/**
 * Generic send email function
 * Used for password reset and other custom emails
 */
export async function sendEmail(options: { to: string; subject: string; html: string; text?: string }): Promise<EmailResult> {
  try {
    const transport = createTransport();
    
    const mailOptions = {
      from: `"${emailConfig.from.name}" <${emailConfig.from.address}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
    };

    logger.info(`Sending email to: ${options.to}`);
    const info = await transport.sendMail(mailOptions);
    
    logger.info(`Email sent successfully to ${options.to}. Message ID: ${info.messageId}`);
    
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Failed to send email to ${options.to}:`, error);
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// Export singleton instance
export const emailService = new EmailService();
export default emailService;
