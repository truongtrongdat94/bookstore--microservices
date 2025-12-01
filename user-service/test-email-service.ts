/**
 * Manual test script for email service
 * This script tests the email service configuration and OTP sending
 * 
 * Usage: ts-node test-email-service.ts
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

import { emailService } from './src/services/emailService';
import logger from './src/utils/logger';

async function testEmailService() {
  console.log('\n=== Email Service Test ===\n');

  // Test 1: Verify email connection
  console.log('Test 1: Verifying email service connection...');
  const isConnected = await emailService.verifyConnection();
  
  if (isConnected) {
    console.log('✓ Email service connection verified successfully\n');
  } else {
    console.log('✗ Email service connection failed');
    console.log('Please check your Gmail credentials in .env file\n');
    return;
  }

  // Test 2: Send test OTP email
  console.log('Test 2: Sending test OTP email...');
  const testEmail = process.env.TEST_EMAIL || 'test@example.com';
  const testOTP = '123456';

  console.log(`Sending OTP to: ${testEmail}`);
  console.log(`OTP Code: ${testOTP}\n`);

  const result = await emailService.sendOTP({
    email: testEmail,
    otpCode: testOTP,
    expiryMinutes: 5,
  });

  if (result.success) {
    console.log('✓ OTP email sent successfully');
    console.log(`Message ID: ${result.messageId}\n`);
    console.log('Please check the inbox of the test email address.');
  } else {
    console.log('✗ Failed to send OTP email');
    console.log(`Error: ${result.error}\n`);
  }

  console.log('\n=== Test Complete ===\n');
}

// Run the test
testEmailService().catch((error) => {
  console.error('Test failed with error:', error);
  process.exit(1);
});
