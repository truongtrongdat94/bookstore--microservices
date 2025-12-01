import Redis from 'ioredis';
import config from './index';
import { Cart, CartItem } from '../types';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'order-service' },
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

// Cart management functions
export const cartService = {
  // Get cart for user
  async getCart(userId: number): Promise<Cart | null> {
    try {
      const cartKey = `cart:${userId}`;
      const cartData = await redis.get(cartKey);
      
      if (!cartData) {
        return null;
      }
      
      const cart = JSON.parse(cartData);
      return {
        ...cart,
        updated_at: new Date(cart.updated_at)
      };
    } catch (error) {
      logger.error('Error getting cart:', { userId, error });
      return null;
    }
  },

  // Save cart for user
  async saveCart(userId: number, cart: Cart): Promise<void> {
    try {
      const cartKey = `cart:${userId}`;
      const cartData = {
        ...cart,
        updated_at: new Date().toISOString()
      };
      
      await redis.setex(cartKey, config.redis.ttl.cart, JSON.stringify(cartData));
    } catch (error) {
      logger.error('Error saving cart:', { userId, error });
      throw error;
    }
  },

  // Add item to cart
  async addItem(userId: number, item: CartItem): Promise<Cart> {
    try {
      let cart = await this.getCart(userId);
      
      if (!cart) {
        cart = {
          user_id: userId,
          items: [],
          total_items: 0,
          total_amount: 0,
          updated_at: new Date()
        };
      }
      
      // Check if item already exists
      const existingItemIndex = cart.items.findIndex(i => i.book_id === item.book_id);
      
      if (existingItemIndex >= 0) {
        // Update quantity
        cart.items[existingItemIndex].quantity += item.quantity;
      } else {
        // Add new item
        cart.items.push(item);
      }
      
      // Recalculate totals
      this.calculateTotals(cart);
      
      await this.saveCart(userId, cart);
      return cart;
    } catch (error) {
      logger.error('Error adding item to cart:', { userId, item, error });
      throw error;
    }
  },

  // Update item quantity
  async updateItem(userId: number, bookId: number, quantity: number): Promise<Cart | null> {
    try {
      const cart = await this.getCart(userId);
      
      if (!cart) {
        return null;
      }
      
      const itemIndex = cart.items.findIndex(i => i.book_id === bookId);
      
      if (itemIndex === -1) {
        return cart;
      }
      
      if (quantity <= 0) {
        // Remove item
        cart.items.splice(itemIndex, 1);
      } else {
        // Update quantity
        cart.items[itemIndex].quantity = quantity;
      }
      
      // Recalculate totals
      this.calculateTotals(cart);
      
      await this.saveCart(userId, cart);
      return cart;
    } catch (error) {
      logger.error('Error updating cart item:', { userId, bookId, quantity, error });
      throw error;
    }
  },

  // Remove item from cart
  async removeItem(userId: number, bookId: number): Promise<Cart | null> {
    try {
      const cart = await this.getCart(userId);
      
      if (!cart) {
        return null;
      }
      
      cart.items = cart.items.filter(i => i.book_id !== bookId);
      
      // Recalculate totals
      this.calculateTotals(cart);
      
      await this.saveCart(userId, cart);
      return cart;
    } catch (error) {
      logger.error('Error removing cart item:', { userId, bookId, error });
      throw error;
    }
  },

  // Clear cart
  async clearCart(userId: number): Promise<void> {
    try {
      const cartKey = `cart:${userId}`;
      await redis.del(cartKey);
    } catch (error) {
      logger.error('Error clearing cart:', { userId, error });
      throw error;
    }
  },

  // Calculate totals
  calculateTotals(cart: Cart): void {
    cart.total_items = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.total_amount = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  },

  // Get cart expiry time
  async getCartTTL(userId: number): Promise<number> {
    try {
      const cartKey = `cart:${userId}`;
      return await redis.ttl(cartKey);
    } catch (error) {
      logger.error('Error getting cart TTL:', { userId, error });
      return -1;
    }
  }
};

export default redis;
