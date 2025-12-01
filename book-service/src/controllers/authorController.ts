import { Request, Response, NextFunction } from 'express';
import { AuthorModel } from '../models/Author';
import { ApiResponse, ApiError } from '../types';
import { cache } from '../config/redis';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'book-service' },
  transports: [new winston.transports.Console()]
});

export class AuthorController {
  /**
   * Get all authors with book count
   * GET /authors
   */
  static async getAllAuthors(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info('Fetching all authors');
      
      // Generate cache key
      const cacheKey = 'authors:list';
      
      // Try to get from cache
      const cached = await cache.get(cacheKey);
      if (cached) {
        logger.debug('Cache hit for authors list', { cacheKey });
        res.json(cached);
        return;
      }
      
      const authors = await AuthorModel.findAll();
      
      logger.info('Authors fetched successfully', { count: authors.length });
      
      const response: ApiResponse = {
        success: true,
        data: authors
      };
      
      // Cache for 10 minutes (600 seconds)
      await cache.set(cacheKey, response, 600);
      
      res.json(response);
    } catch (error) {
      logger.error('Error fetching authors', { error });
      next(error);
    }
  }
  
  /**
   * Get author by ID with book count
   * GET /authors/:id
   */
  static async getAuthorById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authorId = parseInt(req.params.id);
      
      // Validate author ID
      if (isNaN(authorId)) {
        logger.warn('Invalid author ID provided', { id: req.params.id });
        throw new ApiError(400, 'Invalid author ID', 'INVALID_AUTHOR_ID');
      }
      
      logger.info('Fetching author by ID', { authorId });
      
      // Generate cache key
      const cacheKey = `author:${authorId}`;
      
      // Try to get from cache
      const cached = await cache.get(cacheKey);
      if (cached) {
        logger.debug('Cache hit for author', { authorId });
        res.json(cached);
        return;
      }
      
      const author = await AuthorModel.findById(authorId);
      
      if (!author) {
        logger.warn('Author not found', { authorId });
        throw new ApiError(404, 'Author not found', 'AUTHOR_NOT_FOUND');
      }
      
      logger.info('Author fetched successfully', { authorId, name: author.name });
      
      const response: ApiResponse = {
        success: true,
        data: author
      };
      
      // Cache for 15 minutes (900 seconds)
      await cache.set(cacheKey, response, 900);
      
      res.json(response);
    } catch (error) {
      logger.error('Error fetching author', { authorId: req.params.id, error });
      next(error);
    }
  }
  
  /**
   * Get all books by a specific author
   * GET /authors/:id/books
   */
  static async getAuthorBooks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authorId = parseInt(req.params.id);
      
      // Validate author ID
      if (isNaN(authorId)) {
        logger.warn('Invalid author ID provided for books', { id: req.params.id });
        throw new ApiError(400, 'Invalid author ID', 'INVALID_AUTHOR_ID');
      }
      
      logger.info('Fetching books for author', { authorId });
      
      // Generate cache key
      const cacheKey = `author:${authorId}:books`;
      
      // Try to get from cache
      const cached = await cache.get(cacheKey);
      if (cached) {
        logger.debug('Cache hit for author books', { authorId });
        res.json(cached);
        return;
      }
      
      // First verify the author exists
      const author = await AuthorModel.findById(authorId);
      if (!author) {
        logger.warn('Author not found when fetching books', { authorId });
        throw new ApiError(404, 'Author not found', 'AUTHOR_NOT_FOUND');
      }
      
      const books = await AuthorModel.getBooksByAuthor(authorId);
      
      logger.info('Books fetched successfully for author', { authorId, count: books.length });
      
      const response: ApiResponse = {
        success: true,
        data: books
      };
      
      // Cache for 10 minutes (600 seconds)
      await cache.set(cacheKey, response, 600);
      
      res.json(response);
    } catch (error) {
      logger.error('Error fetching author books', { authorId: req.params.id, error });
      next(error);
    }
  }
  
  /**
   * Get top authors by total sales
   * GET /authors/top/sales
   */
  static async getTopAuthorsBySales(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 6;
      
      logger.info('Fetching top authors by sales', { limit });
      
      // Generate cache key
      const cacheKey = `authors:top:sales:${limit}`;
      
      // Try to get from cache
      const cached = await cache.get(cacheKey);
      if (cached) {
        logger.debug('Cache hit for top authors', { cacheKey });
        res.json(cached);
        return;
      }
      
      const authors = await AuthorModel.getTopAuthorsBySales(limit);
      
      logger.info('Top authors fetched successfully', { count: authors.length });
      
      const response: ApiResponse = {
        success: true,
        data: authors
      };
      
      // Cache for 1 hour (3600 seconds)
      await cache.set(cacheKey, response, 3600);
      
      res.json(response);
    } catch (error) {
      logger.error('Error fetching top authors', { error });
      next(error);
    }
  }
}
