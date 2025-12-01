import { createClient } from 'redis';
import config from './index';

const redisPassword = String(config.REDIS_PASSWORD || '');

const redisClient = createClient({
  socket: {
    host: String(config.REDIS_HOST),
    port: Number(config.REDIS_PORT),
  },
  ...(redisPassword ? { password: redisPassword } : {}),
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('Redis Client Connected');
});

// Connect to Redis
(async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
  }
})();

// Cache helper functions
export const cacheHelper = {
  async get(key: string): Promise<string | null> {
    try {
      return await redisClient.get(key);
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  },

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    try {
      if (ttlSeconds) {
        await redisClient.setEx(key, ttlSeconds, value);
      } else {
        await redisClient.set(key, value);
      }
    } catch (error) {
      console.error('Redis SET error:', error);
    }
  },

  async del(key: string): Promise<void> {
    try {
      await redisClient.del(key);
    } catch (error) {
      console.error('Redis DEL error:', error);
    }
  },

  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } catch (error) {
      console.error('Redis DEL pattern error:', error);
    }
  },
};

export default redisClient;
