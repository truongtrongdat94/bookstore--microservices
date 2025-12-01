import app from './app';
import config from './config';
import pool from './config/database';
import redisClient from './config/redis';

const PORT = config.PORT;

// Test database connection
async function testDatabaseConnection() {
  try {
    const client = await pool.connect();
    console.log('✓ Database connection established');
    client.release();
  } catch (error) {
    console.error('✗ Database connection failed:', error);
    process.exit(1);
  }
}

// Test Redis connection
async function testRedisConnection() {
  try {
    await redisClient.ping();
    console.log('✓ Redis connection established');
  } catch (error) {
    console.error('✗ Redis connection failed:', error);
    process.exit(1);
  }
}

// Start server
async function startServer() {
  try {
    // Test connections
    await testDatabaseConnection();
    await testRedisConnection();

    // Start listening
    app.listen(PORT, () => {
      console.log(`🚀 Blog Service running on port ${PORT}`);
      console.log(`   Environment: ${config.NODE_ENV}`);
      console.log(`   Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  try {
    await pool.end();
    await redisClient.quit();
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  try {
    await pool.end();
    await redisClient.quit();
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

// Start the server
startServer();

