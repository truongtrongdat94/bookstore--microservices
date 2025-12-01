import { Request, Response, NextFunction } from 'express';
import { BookModel } from '../models/Book';
import { ApiResponse, ApiError, BookQueryParams } from '../types';
import { cache } from '../config/redis';
import { searchService } from '../services/searchService';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'book-service' },
  transports: [new winston.transports.Console()]
});

export class BookController {
  // Get all books with filtering
  static async getAllBooks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const params: BookQueryParams = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string,
        category: req.query.category ? parseInt(req.query.category as string) : undefined,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        sortBy: req.query.sortBy as any || 'created_at',
        order: req.query.order as any || 'desc'
      };
      
      // Generate cache key from query params
      const cacheKey = `books:list:page:${params.page}:limit:${params.limit}:search:${params.search || ''}:category:${params.category || ''}:minPrice:${params.minPrice || ''}:maxPrice:${params.maxPrice || ''}:sortBy:${params.sortBy}:sortOrder:${params.order}`;
      
      // Try to get from cache
      const cached = await cache.get(cacheKey);
      if (cached) {
        logger.debug('Cache hit for books list', { cacheKey });
        res.json(cached);
        return;
      }
      
      const { books, total } = await BookModel.findAll(params);
      
      const response: ApiResponse = {
        success: true,
        data: books,
        meta: {
          page: params.page || 1,
          limit: params.limit || 10,
          total
        }
      };
      
      // Cache for 5 minutes
      await cache.set(cacheKey, response, 300);
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
  
  // Get book by ID
  static async getBookById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const bookId = parseInt(req.params.id);
      
      if (isNaN(bookId)) {
        throw new ApiError(400, 'Invalid book ID', 'INVALID_BOOK_ID');
      }
      
      // Try to get from cache
      const cacheKey = `book:${bookId}`;
      const cached = await cache.get(cacheKey);
      if (cached) {
        logger.debug('Cache hit for book', { bookId });
        res.json(cached);
        return;
      }
      
      const book = await BookModel.findById(bookId);
      
      if (!book) {
        throw new ApiError(404, 'Book not found', 'BOOK_NOT_FOUND');
      }
      
      const response: ApiResponse = {
        success: true,
        data: book
      };
      
      // Cache for 10 minutes
      await cache.set(cacheKey, response, 600);
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
  
  // Create new book (admin only)
  static async createBook(req: Request, res: Response, next: NextFunction) {
    try {
      const book = await BookModel.create(req.body);
      
      // Invalidate search cache when a new book is created (Requirement 5.4)
      await searchService.invalidateSearchCache();
      
      logger.info('Book created', { bookId: book.book_id, title: book.title });
      
      const response: ApiResponse = {
        success: true,
        data: book
      };
      
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
  
  // Update book (admin only)
  static async updateBook(req: Request, res: Response, next: NextFunction) {
    try {
      const bookId = parseInt(req.params.id);
      
      if (isNaN(bookId)) {
        throw new ApiError(400, 'Invalid book ID', 'INVALID_BOOK_ID');
      }
      
      const book = await BookModel.update(bookId, req.body);
      
      if (!book) {
        throw new ApiError(404, 'Book not found', 'BOOK_NOT_FOUND');
      }
      
      // Invalidate search cache when a book is updated (Requirement 5.4)
      await searchService.invalidateSearchCache();
      // Also invalidate the specific book cache
      await cache.del(`book:${bookId}`);
      
      logger.info('Book updated', { bookId });
      
      const response: ApiResponse = {
        success: true,
        data: book
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
  
  // Delete book (admin only)
  static async deleteBook(req: Request, res: Response, next: NextFunction) {
    try {
      const bookId = parseInt(req.params.id);
      
      if (isNaN(bookId)) {
        throw new ApiError(400, 'Invalid book ID', 'INVALID_BOOK_ID');
      }
      
      const deleted = await BookModel.delete(bookId);
      
      if (!deleted) {
        throw new ApiError(404, 'Book not found', 'BOOK_NOT_FOUND');
      }
      
      // Invalidate search cache when a book is deleted (Requirement 5.4)
      await searchService.invalidateSearchCache();
      // Also invalidate the specific book cache
      await cache.del(`book:${bookId}`);
      
      logger.info('Book deleted', { bookId });
      
      const response: ApiResponse = {
        success: true,
        data: { message: 'Book deleted successfully' }
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
  
  // Get best sellers
  static async getBestSellers(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const books = await BookModel.getBestSellers(limit);
      
      const response: ApiResponse = {
        success: true,
        data: books
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}
