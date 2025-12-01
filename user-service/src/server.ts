import app from './app';
import config from './config';
import pool from './config/database';
import winston from 'winston';
import { otpCleanupJob } from './jobs/otpCleanup';

// Create logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [new winston.transports.Console()]
});

// Graceful shutdown handler
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}, starting graceful shutdown...`);
  
  // Stop OTP cleanup job
  if (otpCleanupJob.isRunning()) {
    otpCleanupJob.stop();
    logger.info('OTP cleanup job stopped');
  }
  
  // Close database pool
  try {
    await pool.end();
    logger.info('Database connections closed');
  } catch (error) {
    logger.error('Error closing database connections:', error);
  }
  
  process.exit(0);
};

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    logger.info('Database connection successful');
    
    // Start OTP cleanup job
    otpCleanupJob.start();
    logger.info('OTP cleanup job started');
    
    // Start listening
    const server = app.listen(config.port, () => {
      logger.info(`User Service running on port ${config.port}`);
      logger.info(`Environment: ${config.nodeEnv}`);
      logger.info(`Health check: http://localhost:${config.port}/health`);
    });
    
    // Handle graceful shutdown
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      gracefulShutdown('uncaughtException');
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('unhandledRejection');
    });
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
