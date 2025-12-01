import { PaymentSessionModel } from '../models/PaymentSession';
import { OrderModel } from '../models/Order';
import { OrderStatus, PaymentStatus, PaymentSessionStatus } from '../types';
import eventService from '../services/eventService';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'order-service' },
  transports: [new winston.transports.Console()]
});

/**
 * Payment Expiry Job
 * Runs periodically to check and cancel orders with expired payment sessions
 * Requirements: 2.1, 2.4
 */
export class PaymentExpiryJob {
  private intervalId: NodeJS.Timeout | null = null;
  private readonly intervalMs: number;

  /**
   * @param intervalMinutes - How often to run the check (default: 1 minute)
   */
  constructor(intervalMinutes: number = 1) {
    this.intervalMs = intervalMinutes * 60 * 1000;
  }

  /**
   * Start the expiry job
   * Runs immediately and then at the specified interval
   */
  start(): void {
    if (this.intervalId) {
      logger.warn('Payment expiry job is already running');
      return;
    }

    logger.info(`Starting payment expiry job (runs every ${this.intervalMs / 1000 / 60} minute(s))`);

    // Run immediately on start
    this.checkExpiredPayments();

    // Schedule periodic check
    this.intervalId = setInterval(() => {
      this.checkExpiredPayments();
    }, this.intervalMs);
  }

  /**
   * Stop the expiry job
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      logger.info('Payment expiry job stopped');
    }
  }

  /**
   * Check for expired payment sessions and cancel associated orders
   * Requirements: 2.1
   */
  async checkExpiredPayments(): Promise<number> {
    try {
      logger.info('Running payment expiry check...');
      
      // Query payment_sessions with status active and expires_at < now
      const expiredSessions = await PaymentSessionModel.findExpiredActiveSessions();
      
      if (expiredSessions.length === 0) {
        logger.info('Payment expiry check completed: no expired sessions found');
        return 0;
      }

      logger.info(`Found ${expiredSessions.length} expired payment session(s)`);

      let cancelledCount = 0;
      for (const session of expiredSessions) {
        try {
          await this.cancelExpiredOrder(session.order_id, session.session_id);
          cancelledCount++;
        } catch (error) {
          logger.error('Error cancelling expired order:', { 
            orderId: session.order_id, 
            sessionId: session.session_id, 
            error 
          });
        }
      }

      logger.info(`Payment expiry check completed: ${cancelledCount} order(s) cancelled`);
      return cancelledCount;
    } catch (error) {
      logger.error('Error during payment expiry check:', { error });
      return 0;
    }
  }

  /**
   * Cancel a single expired order
   * - Update order status to cancelled, payment_status to failed
   * - Update session status to expired
   * - Publish order cancelled event
   * Requirements: 2.1, 2.4
   */
  async cancelExpiredOrder(orderId: number, sessionId: number): Promise<void> {
    logger.info('Cancelling expired order', { orderId, sessionId });

    // Update order status to cancelled
    const updatedOrder = await OrderModel.updateStatus(orderId, OrderStatus.CANCELLED);
    if (!updatedOrder) {
      logger.warn('Order not found or already cancelled', { orderId });
      return;
    }

    // Update payment_status to failed
    await OrderModel.updatePaymentStatus(orderId, PaymentStatus.FAILED);

    // Update session status to expired
    await PaymentSessionModel.updateStatus(sessionId, PaymentSessionStatus.EXPIRED);

    // Publish order cancelled event
    try {
      await eventService.publishOrderUpdated({
        order_id: orderId,
        old_status: OrderStatus.PENDING,
        new_status: OrderStatus.CANCELLED,
        updated_at: new Date()
      });
      logger.info('Order cancelled event published', { orderId });
    } catch (error) {
      // Log but don't fail if event publishing fails
      logger.warn('Failed to publish order cancelled event', { orderId, error });
    }

    logger.info('Order cancelled due to payment expiry', { orderId, sessionId });
  }

  /**
   * Check if the job is currently running
   */
  isRunning(): boolean {
    return this.intervalId !== null;
  }
}

// Export singleton instance
export const paymentExpiryJob = new PaymentExpiryJob();
export default paymentExpiryJob;
