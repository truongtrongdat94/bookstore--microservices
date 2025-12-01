import { Router } from 'express';
import {
  getAllBlogs,
  getBlogById,
  getBlogBySlug,
  getRelatedBlogs,
  getFeaturedBlogs,
  getCategories
} from '../controllers/blogController';

const router = Router();

/**
 * GET /blogs
 * Get all blogs with pagination and filtering
 * Query params: page, limit, category, featured
 */
router.get('/', getAllBlogs);

/**
 * GET /blogs/categories
 * Get all blog categories
 */
router.get('/categories', getCategories);

/**
 * GET /blogs/featured
 * Get featured blogs
 * Query params: limit
 */
router.get('/featured', getFeaturedBlogs);

/**
 * GET /blogs/slug/:slug
 * Get single blog by slug
 */
router.get('/slug/:slug', getBlogBySlug);

/**
 * GET /blogs/related/:id
 * Get related blogs for a specific blog
 * Query params: limit
 */
router.get('/related/:id', getRelatedBlogs);

/**
 * GET /blogs/:id
 * Get single blog by ID
 */
router.get('/:id', getBlogById);

export default router;

