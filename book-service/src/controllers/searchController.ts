/**
 * SearchController - Handles search API endpoints
 * 
 * Implements:
 * - GET /api/books/search - Full-text search with ranking
 * - GET /api/books/search/suggestions - Autocomplete suggestions
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4
 */

import { Request, Response, NextFunction } from 'express';
import { searchService, SearchParams } from '../services/searchService';
import { ApiResponse, ApiError } from '../types';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'book-service-search' },
  transports: [new winston.transports.Console()]
});

export class SearchController {
  /**
   * Main search endpoint
   * GET /api/books/search
   * 
   * Query parameters:
   * - q: search term (required)
   * - page: page number (default: 1)
   * - limit: results per page (default: 20)
   * - highlight: enable highlighting (default: false)
   * 
   * Requirements: 6.1, 6.2, 6.3, 6.4
   */
  static async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const q = req.query.q as string;
      const page = req.query.page as string;
      const limit = req.query.limit as string;
      const highlight = req.query.highlight as string;

      // Validate required query parameter
      // Requirement 6.4: Empty or whitespace-only query returns 400
      if (!q || q.trim() === '') {
        throw new ApiError(400, 'Search query is required', 'EMPTY_QUERY');
      }

      // Validate page parameter
      // Requirement 6.3: Invalid parameters return 400
      let pageNum = 1;
      if (page !== undefined) {
        pageNum = parseInt(page, 10);
        if (isNaN(pageNum) || pageNum < 1) {
          throw new ApiError(400, 'Page must be a positive integer', 'INVALID_PARAMS');
        }
      }

      // Validate limit parameter
      let limitNum = 20;
      if (limit !== undefined) {
        limitNum = parseInt(limit, 10);
        if (isNaN(limitNum) || limitNum < 1) {
          throw new ApiError(400, 'Limit must be a positive integer', 'INVALID_PARAMS');
        }
        // Cap limit to prevent abuse
        if (limitNum > 100) {
          limitNum = 100;
        }
      }

      // Parse highlight parameter
      const highlightEnabled = highlight === 'true' || highlight === '1';

      const searchParams: SearchParams = {
        query: q.trim(),
        page: pageNum,
        limit: limitNum,
        highlight: highlightEnabled
      };

      logger.info('Search request', { query: q, page: pageNum, limit: limitNum, highlight: highlightEnabled });

      const result = await searchService.searchBooks(searchParams);

      // Build standardized response format
      // Requirement 6.2: Return JSON with structure { success, data, meta }
      const response: ApiResponse = {
        success: true,
        data: {
          books: result.books,
          suggestions: result.suggestions
        },
        meta: {
          total: result.total,
          page: pageNum,
          limit: limitNum,
          query: q.trim()
        }
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Autocomplete suggestions endpoint
   * GET /api/books/search/suggestions
   * 
   * Query parameters:
   * - q: search term (required, min 2 characters)
   * - limit: max suggestions (default: 10)
   * 
   * Requirements: 3.1, 3.2
   */
  static async suggest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const q = req.query.q as string;
      const limit = req.query.limit as string;

      // Validate required query parameter
      if (!q || q.trim() === '') {
        throw new ApiError(400, 'Search query is required', 'EMPTY_QUERY');
      }

      // Validate minimum query length for suggestions
      if (q.trim().length < 2) {
        throw new ApiError(400, 'Query must be at least 2 characters', 'QUERY_TOO_SHORT');
      }

      // Validate limit parameter
      let limitNum = 10;
      if (limit !== undefined) {
        limitNum = parseInt(limit, 10);
        if (isNaN(limitNum) || limitNum < 1) {
          throw new ApiError(400, 'Limit must be a positive integer', 'INVALID_PARAMS');
        }
        // Cap limit to prevent abuse
        if (limitNum > 20) {
          limitNum = 20;
        }
      }

      const suggestions = await searchService.getSuggestions(q.trim(), limitNum);

      const response: ApiResponse = {
        success: true,
        data: {
          suggestions
        },
        meta: {
          query: q.trim(),
          count: suggestions.length
        }
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}
