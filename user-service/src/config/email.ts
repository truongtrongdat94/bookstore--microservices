import nodemailer from 'nodemailer';
import logger from '../utils/logger';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: {
    name: string;
    address: string;
  };
}

// Determine which SMTP service to use
// Always use Mailtrap for development/testing
const useMailtrap = true; // Force Mailtrap for now

// Email configuration
const emailConfig: EmailConfig = {
  host: process.env.SMTP_HOST || 'sandbox.smtp.mailtrap.io',
  port: parseInt(process.env.SMTP_PORT || '2525'),
  secure: false, // Use TLS
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
  from: {
    name: process.env.EMAIL_FROM_NAME || 'Bookstore',
    address: process.env.EMAIL_FROM_ADDRESS || 'noreply@bookstore.com',
  },
};

// Log which email service is being used and credentials status
logger.info('📧 Email Service Configuration');
logger.info(`   Host: ${emailConfig.host}:${emailConfig.port}`);
logger.info(`   User: ${emailConfig.auth.user ? '✓ Set' : '✗ Missing'}`);
logger.info(`   Pass: ${emailConfig.auth.pass ? '✓ Set' : '✗ Missing'}`);
logger.info(`   From: ${emailConfig.from.name} <${emailConfig.from.address}>`);
if (useMailtrap) {
  logger.info(`   Check emails at: https://mailtrap.io/inboxes`);
}

// Create nodemailer transport
const createTransport = () => {
  try {
    const transport = nodemailer.createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      auth: emailConfig.auth,
    });

    logger.info('Email transport configured successfully');
    return transport;
  } catch (error) {
    logger.error('Failed to create email transport:', error);
    throw error;
  }
};

// Verify email configuration
export const verifyEmailConfig = async (): Promise<boolean> => {
  try {
    const transport = createTransport();
    await transport.verify();
    logger.info('Email configuration verified successfully');
    return true;
  } catch (error) {
    logger.error('Email configuration verification failed:', error);
    return false;
  }
};

export { emailConfig, createTransport };
