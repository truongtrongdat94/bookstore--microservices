import app from './app';
import config from './config';
import pool from './config/database';
import eventConsumer from './services/eventConsumer';
import { emailService } from './services/emailService';
import winston from 'winston';

// Create logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'notification-service' },
  transports: [new winston.transports.Console()]
});

// Graceful shutdown handler
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}, starting graceful shutdown...`);
  
  try {
    // Stop consuming events
    await eventConsumer.disconnect();
    logger.info('Event consumer disconnected');
    
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
    
    // Test email service
    await emailService.testConnection();
    
    // Connect to RabbitMQ and start consuming
    await eventConsumer.connect();
    await eventConsumer.startConsuming();
    logger.info('Event consumer started');
    
    // Start listening
    const server = app.listen(config.port, () => {
      logger.info(`Notification Service running on port ${config.port}`);
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
