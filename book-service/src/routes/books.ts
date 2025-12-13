import { Router } from 'express';
import { BookController } from '../controllers/bookController';
import { ReviewController } from '../controllers/reviewController';
import { SearchController } from '../controllers/searchController';

const router = Router();

// Search routes (must be before /:id to avoid conflicts)
// Requirement 6.1: GET /api/books/search with query parameters
router.get('/search', SearchController.search);
router.get('/search/suggestions', SearchController.suggest);

// Public routes
router.get('/', BookController.getAllBooks);
router.get('/bestsellers', BookController.getBestSellers);
router.get('/:id', BookController.getBookById);

// Review routes
router.get('/:bookId/reviews', ReviewController.getBookReviews);
router.get('/:bookId/reviews/stats', ReviewController.getBookReviewStats);

// Protected routes (would need auth middleware from API Gateway)
router.post('/:bookId/reviews', ReviewController.addReview as any);

// Admin routes (would need role-based auth)
router.post('/', BookController.createBook);
router.put('/:id', BookController.updateBook);
router.delete('/:id', BookController.deleteBook);

export default router;
