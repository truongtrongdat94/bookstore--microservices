import { Request, Response, NextFunction } from 'express';
import { ReviewModel } from '../models/Review';
import { ApiResponse, ApiError, AuthRequest } from '../types';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'book-service' },
  transports: [new winston.transports.Console()]
});

export class ReviewController {
  // Get reviews for a book
  static async getBookReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const bookId = parseInt(req.params.bookId);
      
      if (isNaN(bookId)) {
        throw new ApiError(400, 'Invalid book ID', 'INVALID_BOOK_ID');
      }
      
      const reviews = await ReviewModel.findByBookId(bookId);
      
      const response: ApiResponse = {
        success: true,
        data: reviews
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
  
  // Get review statistics for a book
  static async getBookReviewStats(req: Request, res: Response, next: NextFunction) {
    try {
      const bookId = parseInt(req.params.bookId);
      
      if (isNaN(bookId)) {
        throw new ApiError(400, 'Invalid book ID', 'INVALID_BOOK_ID');
      }
      
      const stats = await ReviewModel.getBookReviewStats(bookId);
      
      const response: ApiResponse = {
        success: true,
        data: stats
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
  
  // Add review to a book
  static async addReview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const bookId = parseInt(req.params.bookId);
      
      if (isNaN(bookId)) {
        throw new ApiError(400, 'Invalid book ID', 'INVALID_BOOK_ID');
      }
      
      if (!req.user) {
        throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
      }
      
      const review = await ReviewModel.create(bookId, req.user.user_id, req.body);
      
      logger.info('Review added', { bookId, userId: req.user.user_id });
      
      const response: ApiResponse = {
        success: true,
        data: review
      };
      
      res.status(201).json(response);
    } catch (error: any) {
      if (error.message === 'User has already reviewed this book') {
        next(new ApiError(409, error.message, 'DUPLICATE_REVIEW'));
      } else {
        next(error);
      }
    }
  }
  
  // Update review
  static async updateReview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const reviewId = parseInt(req.params.reviewId);
      
      if (isNaN(reviewId)) {
        throw new ApiError(400, 'Invalid review ID', 'INVALID_REVIEW_ID');
      }
      
      if (!req.user) {
        throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
      }
      
      const review = await ReviewModel.update(reviewId, req.user.user_id, req.body);
      
      if (!review) {
        throw new ApiError(404, 'Review not found or unauthorized', 'REVIEW_NOT_FOUND');
      }
      
      logger.info('Review updated', { reviewId, userId: req.user.user_id });
      
      const response: ApiResponse = {
        success: true,
        data: review
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
  
  // Delete review
  static async deleteReview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const reviewId = parseInt(req.params.reviewId);
      
      if (isNaN(reviewId)) {
        throw new ApiError(400, 'Invalid review ID', 'INVALID_REVIEW_ID');
      }
      
      if (!req.user) {
        throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
      }
      
      const deleted = await ReviewModel.delete(reviewId, req.user.user_id);
      
      if (!deleted) {
        throw new ApiError(404, 'Review not found or unauthorized', 'REVIEW_NOT_FOUND');
      }
      
      logger.info('Review deleted', { reviewId, userId: req.user.user_id });
      
      const response: ApiResponse = {
        success: true,
        data: { message: 'Review deleted successfully' }
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
  
  // Get user's reviews
  static async getUserReviews(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
      }
      
      const reviews = await ReviewModel.findByUserId(req.user.user_id);
      
      const response: ApiResponse = {
        success: true,
        data: reviews
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}
