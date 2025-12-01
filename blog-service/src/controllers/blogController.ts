import { Request, Response } from 'express';
import BlogModel from '../models/Blog';
import BlogCategoryModel from '../models/BlogCategory';
import { BlogQueryParams } from '../types';

/**
 * Get all blogs with pagination and filtering
 */
export const getAllBlogs = async (req: Request, res: Response): Promise<void> => {
  try {
    // Parse and validate query parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const category = req.query.category as string | undefined;
    const featured = req.query.featured === 'true' ? true : req.query.featured === 'false' ? false : undefined;

    // Validate parameters
    if (page < 1) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PARAMETERS',
          message: 'Page must be greater than 0'
        }
      });
      return;
    }

    if (limit < 1 || limit > 100) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PARAMETERS',
          message: 'Limit must be between 1 and 100'
        }
      });
      return;
    }

    const params: BlogQueryParams = {
      page,
      limit,
      category,
      featured
    };

    const { blogs, total } = await BlogModel.findAll(params);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: blogs,
      meta: {
        page,
        limit,
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error in getAllBlogs:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while fetching blogs'
      }
    });
  }
};

/**
 * Get single blog by ID
 */
export const getBlogById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);

    // Validate ID
    if (isNaN(id) || id < 1) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PARAMETERS',
          message: 'Invalid blog ID'
        }
      });
      return;
    }

    const blog = await BlogModel.findById(id);

    if (!blog) {
      res.status(404).json({
        success: false,
        error: {
          code: 'BLOG_NOT_FOUND',
          message: 'Blog post not found'
        }
      });
      return;
    }

    // Optionally increment view count (fire and forget)
    BlogModel.incrementViewCount(id).catch(err => 
      console.error('Failed to increment view count:', err)
    );

    res.json({
      success: true,
      data: blog
    });
  } catch (error) {
    console.error('Error in getBlogById:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while fetching the blog'
      }
    });
  }
};

/**
 * Get single blog by slug
 */
export const getBlogBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const slug = req.params.slug;

    // Validate slug
    if (!slug || slug.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PARAMETERS',
          message: 'Invalid blog slug'
        }
      });
      return;
    }

    const blog = await BlogModel.findBySlug(slug);

    if (!blog) {
      res.status(404).json({
        success: false,
        error: {
          code: 'BLOG_NOT_FOUND',
          message: 'Blog post not found'
        }
      });
      return;
    }

    // Optionally increment view count (fire and forget)
    BlogModel.incrementViewCount(blog.blog_id).catch(err => 
      console.error('Failed to increment view count:', err)
    );

    res.json({
      success: true,
      data: blog
    });
  } catch (error) {
    console.error('Error in getBlogBySlug:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while fetching the blog'
      }
    });
  }
};

/**
 * Get related blogs for a specific blog
 */
export const getRelatedBlogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const limit = parseInt(req.query.limit as string) || 4;

    // Validate ID
    if (isNaN(id) || id < 1) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PARAMETERS',
          message: 'Invalid blog ID'
        }
      });
      return;
    }

    // Validate limit
    if (limit < 1 || limit > 20) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PARAMETERS',
          message: 'Limit must be between 1 and 20'
        }
      });
      return;
    }

    const relatedBlogs = await BlogModel.getRelated(id, limit);

    res.json({
      success: true,
      data: relatedBlogs
    });
  } catch (error) {
    console.error('Error in getRelatedBlogs:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while fetching related blogs'
      }
    });
  }
};

/**
 * Get featured blogs
 */
export const getFeaturedBlogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;

    // Validate limit
    if (limit < 1 || limit > 20) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PARAMETERS',
          message: 'Limit must be between 1 and 20'
        }
      });
      return;
    }

    const featuredBlogs = await BlogModel.getFeatured(limit);

    res.json({
      success: true,
      data: featuredBlogs
    });
  } catch (error) {
    console.error('Error in getFeaturedBlogs:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while fetching featured blogs'
      }
    });
  }
};

/**
 * Get all blog categories
 */
export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await BlogCategoryModel.findAll();

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error in getCategories:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while fetching categories'
      }
    });
  }
};

