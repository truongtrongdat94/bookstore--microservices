import app from './app';
import config from './config';
import pool from './config/database';
import redis from './config/redis';
import eventService from './services/eventService';
import { paymentExpiryJob } from './jobs/paymentExpiryJob';
import winston from 'winston';

// Create logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'order-service' },
  transports: [new winston.transports.Console()]
});

// Graceful shutdown handler
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}, starting graceful shutdown...`);
  
  try {
    // Stop payment expiry job
    paymentExpiryJob.stop();
    logger.info('Payment expiry job stopped');
    
    // Close RabbitMQ connection
    await eventService.disconnect();
    logger.info('RabbitMQ connection closed');
    
    // Close Redis connection
    await redis.quit();
    logger.info('Redis connection closed');
    
    // Close database pool
    await pool.end();
    logger.info('Database connections closed');
  } catch (error) {
    logger.error('Error during shutdown:', error);
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
    
    // Test Redis connection
    await redis.ping();
    logger.info('Redis connection successful');
    
    // Connect to RabbitMQ
    try {
      await eventService.connect();
      logger.info('RabbitMQ connection successful');
    } catch (error) {
      logger.warn('RabbitMQ not available, continuing without event publishing');
    }
    
    // Start payment expiry job (runs every minute)
    // Requirements: 2.1
    paymentExpiryJob.start();
    logger.info('Payment expiry job started');
    
    // Start listening
    const server = app.listen(config.port, () => {
      logger.info(`Order Service running on port ${config.port}`);
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
