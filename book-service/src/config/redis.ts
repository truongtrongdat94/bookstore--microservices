import Redis from 'ioredis';
import config from './index';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'book-service' },
  transports: [new winston.transports.Console()]
});

// Create Redis client
const redis = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password || undefined,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
});

redis.on('connect', () => {
  logger.info('Redis connected successfully');
});

redis.on('error', (err) => {
  logger.error('Redis connection error:', err);
});

// Helper functions for caching
export const cache = {
  async get(key: string): Promise<any> {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Redis get error:', { key, error });
      return null;
    }
  },

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const data = JSON.stringify(value);
      if (ttl) {
        await redis.setex(key, ttl, data);
      } else {
        await redis.set(key, data);
      }
    } catch (error) {
      logger.error('Redis set error:', { key, error });
    }
  },

  async del(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      logger.error('Redis delete error:', { key, error });
    }
  },

  async flush(): Promise<void> {
    try {
      await redis.flushdb();
      logger.info('Redis cache flushed');
    } catch (error) {
      logger.error('Redis flush error:', error);
    }
  },
};

export default redis;
