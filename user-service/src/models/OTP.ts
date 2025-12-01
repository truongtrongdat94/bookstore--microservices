import { query } from '../config/database';
import { OTP, CreateOTPDto } from '../types';
import bcrypt from 'bcryptjs';
import logger from '../utils/logger';
import { PoolClient } from 'pg';

export class OTPModel {
  /**
   * Create a new OTP record
   * Hashes the OTP code before storing
   * Sets expiration to 5 minutes from now
   */
  static async create(otpData: CreateOTPDto, client?: PoolClient): Promise<OTP> {
    const { email, otp_code, purpose, registration_data } = otpData;
    
    // Hash the OTP code with bcrypt
    const otp_code_hash = await bcrypt.hash(otp_code, 10);
    
    // Set expiration to 5 minutes from now
    const expires_at = new Date(Date.now() + 5 * 60 * 1000);
    
    const sql = `
      INSERT INTO otp_codes (email, otp_code_hash, purpose, expires_at, is_used, created_at, registration_data)
      VALUES ($1, $2, $3, $4, FALSE, NOW(), $5)
      RETURNING otp_id, email, otp_code_hash, purpose, expires_at, is_used, created_at, registration_data
    `;
    
    // Use client if provided (for transactions), otherwise use global query
    const queryFn = client ? client.query.bind(client) : query;
    const result = await queryFn(sql, [
      email, 
      otp_code_hash, 
      purpose, 
      expires_at,
      registration_data ? JSON.stringify(registration_data) : null
    ]);
    logger.info(`OTP created for email: ${email}, purpose: ${purpose}`);
    
    return result.rows[0];
  }
  
  /**
   * Find a valid OTP with registration data
   * Used for email verification during registration
   */
  static async findValidOTP(email: string, otp_code: string, purpose: string): Promise<OTP | null> {
    // Find the most recent unused OTP for this email and purpose
    const sql = `
      SELECT otp_id, email, otp_code_hash, purpose, expires_at, is_used, created_at, registration_data
      FROM otp_codes
      WHERE email = $1 
        AND purpose = $2 
        AND is_used = FALSE
        AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    const result = await query(sql, [email, purpose]);
    
    if (result.rows.length === 0) {
      logger.warn(`No valid OTP found for email: ${email}, purpose: ${purpose}`);
      return null;
    }
    
    const otpRecord = result.rows[0];
    
    // Verify the OTP code matches the hash
    const isValid = await bcrypt.compare(otp_code, otpRecord.otp_code_hash);
    
    if (!isValid) {
      logger.warn(`Invalid OTP code provided for email: ${email}`);
      return null;
    }
    
    logger.info(`OTP verified successfully for email: ${email}, purpose: ${purpose}`);
    return otpRecord;
  }
  
  /**
   * Verify an OTP code
   * Checks if the code matches, is not expired, and has not been used
   * Returns the OTP record if valid, null otherwise
   */
  static async verify(email: string, otp_code: string, purpose: string): Promise<OTP | null> {
    // Find the most recent unused OTP for this email and purpose
    const sql = `
      SELECT otp_id, email, otp_code_hash, purpose, expires_at, is_used, created_at
      FROM otp_codes
      WHERE email = $1 
        AND purpose = $2 
        AND is_used = FALSE
        AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    const result = await query(sql, [email, purpose]);
    
    if (result.rows.length === 0) {
      logger.warn(`No valid OTP found for email: ${email}, purpose: ${purpose}`);
      return null;
    }
    
    const otpRecord = result.rows[0];
    
    // Verify the OTP code matches the hash
    const isValid = await bcrypt.compare(otp_code, otpRecord.otp_code_hash);
    
    if (!isValid) {
      logger.warn(`Invalid OTP code provided for email: ${email}`);
      return null;
    }
    
    logger.info(`OTP verified successfully for email: ${email}, purpose: ${purpose}`);
    return otpRecord;
  }
  
  /**
   * Mark an OTP as used to prevent reuse
   */
  static async markAsUsed(otp_id: number): Promise<void> {
    const sql = `
      UPDATE otp_codes
      SET is_used = TRUE
      WHERE otp_id = $1
    `;
    
    await query(sql, [otp_id]);
    logger.info(`OTP marked as used: ${otp_id}`);
  }
  
  /**
   * Clean up expired OTP codes
   * Deletes OTPs that are older than 24 hours
   * Returns the number of deleted records
   */
  static async cleanup(): Promise<number> {
    const sql = `
      DELETE FROM otp_codes
      WHERE created_at < NOW() - INTERVAL '24 hours'
    `;
    
    const result = await query(sql);
    const deletedCount = result.rowCount || 0;
    
    if (deletedCount > 0) {
      logger.info(`Cleaned up ${deletedCount} expired OTP codes`);
    }
    
    return deletedCount;
  }
  
  /**
   * Count OTP requests for rate limiting
   * Returns the number of OTPs created for an email in the last N minutes
   */
  static async countRecentOTPs(email: string, minutes: number = 5): Promise<number> {
    const sql = `
      SELECT COUNT(*) as count
      FROM otp_codes
      WHERE email = $1 
        AND created_at > NOW() - INTERVAL '${minutes} minutes'
    `;
    
    const result = await query(sql, [email]);
    return parseInt(result.rows[0].count);
  }
}
