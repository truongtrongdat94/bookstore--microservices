import { Request, Response, NextFunction } from 'express';
import { cartService } from '../config/redis';
import { ApiResponse, ApiError, AuthRequest, AddToCartDto, UpdateCartItemDto } from '../types';
import winston from 'winston';
import axios from 'axios';
import config from '../config';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'order-service' },
  transports: [new winston.transports.Console()]
});

export class CartController {
  // Get user's cart
  static async getCart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
      }
      
      const cart = await cartService.getCart(req.user.user_id);
      
      const response: ApiResponse = {
        success: true,
        data: cart || {
          user_id: req.user.user_id,
          items: [],
          total_items: 0,
          total_amount: 0,
          updated_at: new Date()
        }
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
  
  // Add item to cart
  static async addToCart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
      }
      
      // Coerce and validate inputs
      const rawBookId = (req.body as any).book_id;
      const rawQuantity = (req.body as any).quantity;

      const bookId = Number(rawBookId);
      const qty = Number(rawQuantity);

      if (!Number.isInteger(bookId) || bookId <= 0) {
        throw new ApiError(400, 'Invalid book ID', 'INVALID_BOOK_ID');
      }

      if (!Number.isInteger(qty) || qty <= 0) {
        throw new ApiError(400, 'Quantity must be positive', 'INVALID_QUANTITY');
      }
      
      // Fetch book details from book service
      try {
        const bookResponse = await axios.get(`${config.services.bookService}/books/${bookId}`);
        const book = bookResponse.data.data;
        
        if (!book) {
          throw new ApiError(404, 'Book not found', 'BOOK_NOT_FOUND');
        }
        
        if (book.stock_quantity < qty) {
          throw new ApiError(400, 'Insufficient stock', 'INSUFFICIENT_STOCK');
        }
        
        const cartItem = {
          book_id: book.book_id,
          title: book.title,
          author: book.author,
          price: book.price,
          quantity: qty,
          stock_quantity: book.stock_quantity
        };
        
        const cart = await cartService.addItem(req.user.user_id, cartItem);
        
        logger.info('Item added to cart', { 
          userId: req.user.user_id, 
          bookId, 
          quantity: qty 
        });
        
        const response: ApiResponse = {
          success: true,
          data: cart
        };
        
        res.json(response);
      } catch (axiosError: any) {
        // Re-throw ApiErrors without wrapping
        if (axiosError.name === 'ApiError') {
          throw axiosError;
        }
        if (axiosError.response?.status === 404) {
          throw new ApiError(404, 'Book not found', 'BOOK_NOT_FOUND');
        }
        throw new ApiError(500, 'Failed to fetch book details', 'BOOK_SERVICE_ERROR');
      }
    } catch (error) {
      next(error);
    }
  }
  
  // Update cart item quantity
  static async updateCartItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
      }
      
      const bookId = parseInt(req.params.bookId);
      const { quantity }: UpdateCartItemDto = req.body;
      
      if (isNaN(bookId)) {
        throw new ApiError(400, 'Invalid book ID', 'INVALID_BOOK_ID');
      }
      
      if (quantity < 0) {
        throw new ApiError(400, 'Quantity cannot be negative', 'INVALID_QUANTITY');
      }
      
      const cart = await cartService.updateItem(req.user.user_id, bookId, quantity);
      
      if (!cart) {
        throw new ApiError(404, 'Cart not found', 'CART_NOT_FOUND');
      }
      
      logger.info('Cart item updated', { 
        userId: req.user.user_id, 
        bookId, 
        quantity 
      });
      
      const response: ApiResponse = {
        success: true,
        data: cart
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
  
  // Remove item from cart
  static async removeFromCart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
      }
      
      const bookId = parseInt(req.params.bookId);
      
      if (isNaN(bookId)) {
        throw new ApiError(400, 'Invalid book ID', 'INVALID_BOOK_ID');
      }
      
      const cart = await cartService.removeItem(req.user.user_id, bookId);
      
      if (!cart) {
        throw new ApiError(404, 'Cart not found', 'CART_NOT_FOUND');
      }
      
      logger.info('Item removed from cart', { 
        userId: req.user.user_id, 
        bookId 
      });
      
      const response: ApiResponse = {
        success: true,
        data: cart
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
  
  // Clear entire cart
  static async clearCart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
      }
      
      await cartService.clearCart(req.user.user_id);
      
      logger.info('Cart cleared', { userId: req.user.user_id });
      
      const response: ApiResponse = {
        success: true,
        data: { message: 'Cart cleared successfully' }
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}
