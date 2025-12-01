import { OTPModel } from '../models/OTP';
import { emailService } from './emailService';
import logger from '../utils/logger';
import { ApiError } from '../types';

export class OTPService {
  /**
   * Generate a random 6-digit OTP code
   * Made public to allow external usage in transaction flows
   */
  static generateOTPCode(): string {
    // Generate a random 6-digit number
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp.toString();
  }
  
  /**
   * Send OTP email without storing in database
   * Used in transaction flows where storage is handled separately
   */
  static async sendOTPEmail(email: string, otpCode: string): Promise<void> {
    try {
      // Send OTP via email
      const emailResult = await emailService.sendOTP({ email, otpCode });
      
      if (!emailResult.success) {
        logger.error(`Failed to send OTP email to ${email}: ${emailResult.error}`);
        throw new ApiError(
          500,
          'Failed to send verification email. Please try again.',
          'EMAIL_SEND_FAILED'
        );
      }
      
      logger.info(`OTP email sent successfully to ${email}`);
    } catch (error) {
      logger.error('Error sending OTP email:', error);
      throw error;
    }
  }
  
  /**
   * Generate and send OTP to user's email
   * Implements rate limiting check
   * Kept for backward compatibility with resendOTP
   */
  static async generateAndSend(
    email: string, 
    purpose: 'register' | 'login' | 'reset_password'
  ): Promise<void> {
    try {
      // Check rate limiting (max 3 OTP per 5 minutes)
      const recentOTPCount = await OTPModel.countRecentOTPs(email, 5);
      
      if (recentOTPCount >= 3) {
        logger.warn(`Rate limit exceeded for email: ${email}`);
        throw new ApiError(
          429,
          'Too many OTP requests. Please wait 5 minutes before requesting again.',
          'RATE_LIMIT_EXCEEDED'
        );
      }
      
      // Generate 6-digit OTP code using public method
      const otpCode = this.generateOTPCode();
      
      // Send OTP email first (fail fast if email service is down)
      await this.sendOTPEmail(email, otpCode);
      
      // Store OTP in database (hashed) - only after email sent successfully
      await OTPModel.create({
        email,
        otp_code: otpCode,
        purpose
      });
      
      logger.info(`OTP generated and sent to ${email} for purpose: ${purpose}`);
    } catch (error) {
      logger.error('Error generating and sending OTP:', error);
      throw error;
    }
  }
  
  /**
   * Verify OTP code
   * Checks if the code is valid, not expired, and not used
   * Marks the OTP as used if valid
   */
  static async verifyOTP(
    email: string,
    otpCode: string,
    purpose: 'register' | 'login' | 'reset_password'
  ): Promise<boolean> {
    try {
      // Verify the OTP
      const otpRecord = await OTPModel.verify(email, otpCode, purpose);
      
      if (!otpRecord) {
        logger.warn(`OTP verification failed for email: ${email}`);
        return false;
      }
      
      // Mark OTP as used to prevent reuse
      await OTPModel.markAsUsed(otpRecord.otp_id);
      
      logger.info(`OTP verified and marked as used for email: ${email}`);
      return true;
    } catch (error) {
      logger.error('Error verifying OTP:', error);
      return false;
    }
  }
  
  /**
   * Resend OTP to user
   * Generates a new OTP and sends it
   */
  static async resendOTP(
    email: string,
    purpose: 'register' | 'login' | 'reset_password'
  ): Promise<void> {
    // Use the same generateAndSend method which includes rate limiting
    await this.generateAndSend(email, purpose);
  }
}

export const otpService = new OTPService();
