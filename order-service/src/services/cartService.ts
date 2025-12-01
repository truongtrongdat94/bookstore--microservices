import Redis from 'ioredis';
import axios from 'axios';
import { Cart, CartItem } from '../types';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: 3,
});

const BOOK_SERVICE_URL = process.env.BOOK_SERVICE_URL || 'http://localhost:3002';

interface BookDetails {
  book_id: number;
  title: string;
  author: string;
  price: number;
  stock_quantity: number;
  cover_image_url?: string;
}

class BookServiceClient {
  async getBook(bookId: number): Promise<BookDetails | null> {
    try {
      const response = await axios.get(`${BOOK_SERVICE_URL}/books/${bookId}`);
      if (response.data.success && response.data.data) {
        const data = response.data.data;
        // Ensure price is a number (book-service may return string from DECIMAL column)
        return {
          ...data,
          price: typeof data.price === 'string' ? parseFloat(data.price) : data.price,
        };
      }
      return null;
    } catch (error) {
      console.error(`Error fetching book ${bookId}:`, error);
      return null;
    }
  }
}

const bookServiceClient = new BookServiceClient();

export class CartService {
  private static getCartKey(userId: number): string {
    return `cart:${userId}`;
  }

  static async getCart(userId: number): Promise<Cart> {
    try {
      const cartKey = this.getCartKey(userId);
      const cartData = await redis.get(cartKey);
      
      if (!cartData) {
        return {
          user_id: userId,
          items: [],
          total_items: 0,
          total_amount: 0,
          updated_at: new Date(),
        };
      }
      
      const cart: Cart = JSON.parse(cartData);
      
      // Refresh book details and validate stock
      const updatedItems: CartItem[] = [];
      for (const item of cart.items) {
        try {
          const bookDetails = await bookServiceClient.getBook(item.book_id);
          if (bookDetails && bookDetails.stock_quantity > 0) {
            updatedItems.push({
              ...item,
              title: bookDetails.title,
              author: bookDetails.author,
              price: bookDetails.price,
              stock_quantity: bookDetails.stock_quantity,
              image: bookDetails.cover_image_url,
            });
          }
        } catch (error) {
          // Skip items for books that no longer exist
          console.warn(`Book ${item.book_id} not found, removing from cart`);
        }
      }
      
      const updatedCart = this.calculateCartTotals({
        ...cart,
        items: updatedItems,
      });
      
      // Save updated cart
      await this.saveCart(userId, updatedCart);
      
      return updatedCart;
    } catch (error) {
      console.error('Error getting cart:', error);
      throw error;
    }
  }

  static async addItem(userId: number, bookId: number, quantity: number): Promise<Cart> {
    try {
      // Validate book exists and has sufficient stock
      const bookDetails = await bookServiceClient.getBook(bookId);
      if (!bookDetails) {
        throw new Error('Book not found');
      }
      
      const cart = await this.getCart(userId);
      
      // Check if item already exists in cart
      const existingItemIndex = cart.items.findIndex(item => item.book_id === bookId);
      
      if (existingItemIndex >= 0) {
        // Update existing item
        const newQuantity = cart.items[existingItemIndex].quantity + quantity;
        
        if (newQuantity > bookDetails.stock_quantity) {
          throw new Error(`Insufficient stock. Available: ${bookDetails.stock_quantity}`);
        }
        
        cart.items[existingItemIndex].quantity = newQuantity;
      } else {
        // Add new item
        if (quantity > bookDetails.stock_quantity) {
          throw new Error(`Insufficient stock. Available: ${bookDetails.stock_quantity}`);
        }
        
        cart.items.push({
          book_id: bookId,
          title: bookDetails.title,
          author: bookDetails.author,
          price: bookDetails.price,
          quantity,
          stock_quantity: bookDetails.stock_quantity,
          image: bookDetails.cover_image_url,
        });
      }
      
      const updatedCart = this.calculateCartTotals(cart);
      await this.saveCart(userId, updatedCart);
      
      return updatedCart;
    } catch (error) {
      console.error('Error adding item to cart:', error);
      throw error;
    }
  }

  static async updateItem(userId: number, bookId: number, quantity: number): Promise<Cart> {
    try {
      if (quantity <= 0) {
        return this.removeItem(userId, bookId);
      }
      
      // Validate stock
      const bookDetails = await bookServiceClient.getBook(bookId);
      if (!bookDetails) {
        throw new Error('Book not found');
      }
      
      if (quantity > bookDetails.stock_quantity) {
        throw new Error(`Insufficient stock. Available: ${bookDetails.stock_quantity}`);
      }
      
      const cart = await this.getCart(userId);
      const itemIndex = cart.items.findIndex(item => item.book_id === bookId);
      
      if (itemIndex === -1) {
        throw new Error('Item not found in cart');
      }
      
      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].price = bookDetails.price;
      
      const updatedCart = this.calculateCartTotals(cart);
      await this.saveCart(userId, updatedCart);
      
      return updatedCart;
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  }

  static async removeItem(userId: number, bookId: number): Promise<Cart> {
    try {
      const cart = await this.getCart(userId);
      cart.items = cart.items.filter(item => item.book_id !== bookId);
      
      const updatedCart = this.calculateCartTotals(cart);
      await this.saveCart(userId, updatedCart);
      
      return updatedCart;
    } catch (error) {
      console.error('Error removing cart item:', error);
      throw error;
    }
  }

  static async clearCart(userId: number): Promise<void> {
    try {
      const cartKey = this.getCartKey(userId);
      await redis.del(cartKey);
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }

  private static calculateCartTotals(cart: Cart): Cart {
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    return {
      ...cart,
      total_items: totalItems,
      total_amount: Math.round(totalAmount * 100) / 100, // Round to 2 decimal places
      updated_at: new Date(),
    };
  }

  private static async saveCart(userId: number, cart: Cart): Promise<void> {
    try {
      const cartKey = this.getCartKey(userId);
      const cartData = JSON.stringify(cart);
      
      // Set TTL to 24 hours (86400 seconds)
      await redis.setex(cartKey, 86400, cartData);
    } catch (error) {
      console.error('Error saving cart:', error);
      throw error;
    }
  }

  static async validateCartForCheckout(userId: number): Promise<{ valid: boolean; issues: string[] }> {
    try {
      const cart = await this.getCart(userId);
      const issues: string[] = [];
      
      if (cart.items.length === 0) {
        issues.push('Cart is empty');
        return { valid: false, issues };
      }
      
      // Validate each item
      for (const item of cart.items) {
        try {
          const bookDetails = await bookServiceClient.getBook(item.book_id);
          
          if (!bookDetails) {
            issues.push(`Book "${item.title}" is no longer available`);
            continue;
          }
          
          if (bookDetails.stock_quantity < item.quantity) {
            issues.push(`Insufficient stock for "${item.title}". Available: ${bookDetails.stock_quantity}, Requested: ${item.quantity}`);
          }
          
          // Check if price has changed significantly (more than 10%)
          const priceDiff = Math.abs(bookDetails.price - item.price) / item.price;
          if (priceDiff > 0.1) {
            issues.push(`Price for "${item.title}" has changed. Current price: $${bookDetails.price}`);
          }
        } catch (error) {
          issues.push(`Unable to validate "${item.title}"`);
        }
      }
      
      return {
        valid: issues.length === 0,
        issues,
      };
    } catch (error) {
      console.error('Error validating cart:', error);
      return {
        valid: false,
        issues: ['Unable to validate cart'],
      };
    }
  }
}
