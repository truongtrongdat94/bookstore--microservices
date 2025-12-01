import { OTPModel } from '../models/OTP';
import logger from '../utils/logger';

/**
 * OTP Cleanup Job
 * Runs periodically to delete expired OTP codes (>24 hours old)
 * Helps maintain database performance and removes stale data
 */
export class OTPCleanupJob {
  private intervalId: NodeJS.Timeout | null = null;
  private readonly intervalMs: number;
  
  /**
   * @param intervalHours - How often to run cleanup (default: 1 hour)
   */
  constructor(intervalHours: number = 1) {
    this.intervalMs = intervalHours * 60 * 60 * 1000;
  }
  
  /**
   * Start the cleanup job
   * Runs immediately and then at the specified interval
   */
  start(): void {
    if (this.intervalId) {
      logger.warn('OTP cleanup job is already running');
      return;
    }
    
    logger.info(`Starting OTP cleanup job (runs every ${this.intervalMs / 1000 / 60 / 60} hour(s))`);
    
    // Run immediately on start
    this.runCleanup();
    
    // Schedule periodic cleanup
    this.intervalId = setInterval(() => {
      this.runCleanup();
    }, this.intervalMs);
  }
  
  /**
   * Stop the cleanup job
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      logger.info('OTP cleanup job stopped');
    }
  }
  
  /**
   * Execute the cleanup operation
   * Deletes OTP codes older than 24 hours
   */
  private async runCleanup(): Promise<void> {
    try {
      logger.info('Running OTP cleanup job...');
      const deletedCount = await OTPModel.cleanup();
      
      if (deletedCount > 0) {
        logger.info(`OTP cleanup completed: ${deletedCount} expired codes removed`);
      } else {
        logger.info('OTP cleanup completed: no expired codes found');
      }
    } catch (error) {
      logger.error('Error during OTP cleanup:', error);
    }
  }
  
  /**
   * Check if the job is currently running
   */
  isRunning(): boolean {
    return this.intervalId !== null;
  }
}

// Export singleton instance
export const otpCleanupJob = new OTPCleanupJob();
