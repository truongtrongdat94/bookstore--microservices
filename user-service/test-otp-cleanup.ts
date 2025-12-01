/**
 * Test script for OTP cleanup job
 * This script tests the OTP cleanup functionality
 */

import { OTPCleanupJob } from './src/jobs/otpCleanup';
import { OTPModel } from './src/models/OTP';
import pool from './src/config/database';
import logger from './src/utils/logger';

async function testCleanup() {
  try {
    logger.info('=== Testing OTP Cleanup Job ===');
    
    // Test 1: Check current OTP count
    const beforeResult = await pool.query('SELECT COUNT(*) FROM otp_codes');
    const beforeCount = parseInt(beforeResult.rows[0].count);
    logger.info(`Current OTP codes in database: ${beforeCount}`);
    
    // Test 2: Run cleanup manually
    logger.info('Running cleanup...');
    const deletedCount = await OTPModel.cleanup();
    logger.info(`Deleted ${deletedCount} expired OTP codes`);
    
    // Test 3: Check count after cleanup
    const afterResult = await pool.query('SELECT COUNT(*) FROM otp_codes');
    const afterCount = parseInt(afterResult.rows[0].count);
    logger.info(`OTP codes after cleanup: ${afterCount}`);
    
    // Test 4: Test the cleanup job class
    logger.info('\n=== Testing OTP Cleanup Job Class ===');
    const cleanupJob = new OTPCleanupJob(1); // 1 hour interval
    
    logger.info('Starting cleanup job...');
    cleanupJob.start();
    logger.info(`Job running: ${cleanupJob.isRunning()}`);
    
    // Wait 2 seconds to see if it runs
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    logger.info('Stopping cleanup job...');
    cleanupJob.stop();
    logger.info(`Job running: ${cleanupJob.isRunning()}`);
    
    logger.info('\n=== Test Complete ===');
    
    // Close database connection
    await pool.end();
    process.exit(0);
    
  } catch (error) {
    logger.error('Test failed:', error);
    await pool.end();
    process.exit(1);
  }
}

testCleanup();
