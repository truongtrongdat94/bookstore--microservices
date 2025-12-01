import { query, transaction } from '../config/database';
import { PaymentSession, PaymentSessionStatus, CreatePaymentSessionDto } from '../types';
import config from '../config';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'order-service' },
  transports: [new winston.transports.Console()]
});

// Default expiry time in minutes
const PAYMENT_EXPIRY_MINUTES = config.vietqr?.qrExpiryMinutes || 15;

export class PaymentSessionModel {
  /**
   * Create a new payment session with QR data
   * Automatically calculates expires_at = created_at + 15 minutes
   * Requirements: 1.2, 1.5
   */
  static async create(data: CreatePaymentSessionDto): Promise<PaymentSession> {
    const sql = `
      INSERT INTO payment_sessions (
        order_id, qr_code, qr_data_url, amount, transfer_content, 
        expires_at, status, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, NOW() + INTERVAL '${PAYMENT_EXPIRY_MINUTES} minutes', 'active', NOW(), NOW())
      RETURNING *
    `;

    try {
      const result = await query(sql, [
        data.order_id,
        data.qr_code,
        data.qr_data_url,
        data.amount,
        data.transfer_content
      ]);
      
      logger.info('Payment session created', { 
        sessionId: result.rows[0].session_id, 
        orderId: data.order_id 
      });
      
      return result.rows[0];
    } catch (error) {
      logger.error('Error creating payment session:', { data, error });
      throw error;
    }
  }

  /**
   * Find payment session by order ID
   * Returns the most recent active session for the order
   */
  static async findByOrderId(orderId: number): Promise<PaymentSession | null> {
    const sql = `
      SELECT * FROM payment_sessions 
      WHERE order_id = $1 
      ORDER BY created_at DESC 
      LIMIT 1
    `;

    try {
      const result = await query(sql, [orderId]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error finding payment session by order ID:', { orderId, error });
      throw error;
    }
  }

  /**
   * Find active payment session by order ID
   */
  static async findActiveByOrderId(orderId: number): Promise<PaymentSession | null> {
    const sql = `
      SELECT * FROM payment_sessions 
      WHERE order_id = $1 AND status = 'active'
      ORDER BY created_at DESC 
      LIMIT 1
    `;

    try {
      const result = await query(sql, [orderId]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error finding active payment session:', { orderId, error });
      throw error;
    }
  }

  /**
   * Find payment session by ID
   */
  static async findById(sessionId: number): Promise<PaymentSession | null> {
    const sql = `SELECT * FROM payment_sessions WHERE session_id = $1`;

    try {
      const result = await query(sql, [sessionId]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error finding payment session by ID:', { sessionId, error });
      throw error;
    }
  }

  /**
   * Update payment session status
   */
  static async updateStatus(
    sessionId: number, 
    status: PaymentSessionStatus
  ): Promise<PaymentSession | null> {
    const sql = `
      UPDATE payment_sessions 
      SET status = $2, updated_at = NOW()
      WHERE session_id = $1
      RETURNING *
    `;

    try {
      const result = await query(sql, [sessionId, status]);
      
      if (result.rows[0]) {
        logger.info('Payment session status updated', { sessionId, status });
      }
      
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error updating payment session status:', { sessionId, status, error });
      throw error;
    }
  }

  /**
   * Mark session as completed with admin confirmation
   */
  static async markCompleted(
    sessionId: number, 
    confirmedBy: number
  ): Promise<PaymentSession | null> {
    const sql = `
      UPDATE payment_sessions 
      SET status = 'completed', confirmed_by = $2, confirmed_at = NOW(), updated_at = NOW()
      WHERE session_id = $1
      RETURNING *
    `;

    try {
      const result = await query(sql, [sessionId, confirmedBy]);
      
      if (result.rows[0]) {
        logger.info('Payment session marked completed', { sessionId, confirmedBy });
      }
      
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error marking payment session completed:', { sessionId, error });
      throw error;
    }
  }

  /**
   * Mark session as cancelled with rejection reason
   */
  static async markCancelled(
    sessionId: number, 
    rejectionReason: string,
    adminId?: number
  ): Promise<PaymentSession | null> {
    const sql = `
      UPDATE payment_sessions 
      SET status = 'cancelled', rejection_reason = $2, confirmed_by = $3, updated_at = NOW()
      WHERE session_id = $1
      RETURNING *
    `;

    try {
      const result = await query(sql, [sessionId, rejectionReason, adminId || null]);
      
      if (result.rows[0]) {
        logger.info('Payment session marked cancelled', { sessionId, rejectionReason });
      }
      
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error marking payment session cancelled:', { sessionId, error });
      throw error;
    }
  }

  /**
   * Check if session is still valid (not expired)
   * Requirements: 2.2, 2.3
   * @returns Object with isValid flag and remaining seconds
   */
  static isSessionValid(session: PaymentSession): { isValid: boolean; remainingSeconds: number } {
    const now = new Date();
    const expiresAt = new Date(session.expires_at);
    const remainingMs = expiresAt.getTime() - now.getTime();
    const remainingSeconds = Math.max(0, Math.floor(remainingMs / 1000));
    
    return {
      isValid: session.status === PaymentSessionStatus.ACTIVE && remainingSeconds > 0,
      remainingSeconds
    };
  }

  /**
   * Calculate remaining seconds until expiry
   * Requirements: 2.3
   */
  static calculateRemainingSeconds(expiresAt: Date): number {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const remainingMs = expiry.getTime() - now.getTime();
    return Math.max(0, Math.floor(remainingMs / 1000));
  }

  /**
   * Find all expired active sessions
   * Used by the expiry job
   * Requirements: 2.1
   */
  static async findExpiredActiveSessions(): Promise<PaymentSession[]> {
    const sql = `
      SELECT * FROM payment_sessions 
      WHERE status = 'active' AND expires_at < NOW()
    `;

    try {
      const result = await query(sql, []);
      return result.rows;
    } catch (error) {
      logger.error('Error finding expired active sessions:', { error });
      throw error;
    }
  }

  /**
   * Invalidate previous sessions for an order
   * Used when regenerating QR
   * Requirements: 6.3
   */
  static async invalidatePreviousSessions(orderId: number): Promise<number> {
    const sql = `
      UPDATE payment_sessions 
      SET status = 'expired', updated_at = NOW()
      WHERE order_id = $1 AND status = 'active'
      RETURNING session_id
    `;

    try {
      const result = await query(sql, [orderId]);
      const count = result.rowCount || 0;
      
      if (count > 0) {
        logger.info('Invalidated previous payment sessions', { orderId, count });
      }
      
      return count;
    } catch (error) {
      logger.error('Error invalidating previous sessions:', { orderId, error });
      throw error;
    }
  }
}
