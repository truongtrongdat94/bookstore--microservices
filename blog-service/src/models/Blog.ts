import { QueryResult } from 'pg';
import pool from '../config/database';
import { cacheHelper } from '../config/redis';
import { Blog, BlogQueryParams } from '../types';

export class BlogModel {
  /**
   * Find all blogs with pagination and filtering
   */
  static async findAll(params: BlogQueryParams = {}): Promise<{ blogs: Blog[]; total: number }> {
    const {
      page = 1,
      limit = 12,
      category,
      featured,
    } = params;

    const offset = (page - 1) * limit;

    // Generate cache key based on query parameters
    const cacheKey = `blogs:list:page:${page}:limit:${limit}:category:${category || 'all'}:featured:${featured || 'all'}`;

    // Try to get from cache
    const cached = await cacheHelper.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Build query
    let query = `
      SELECT 
        b.blog_id,
        b.title,
        b.slug,
        b.excerpt,
        b.content,
        b.featured_image,
        b.category_id,
        bc.name as category_name,
        bc.slug as category_slug,
        b.author,
        b.is_featured,
        b.view_count,
        b.published_at,
        b.created_at,
        b.updated_at
      FROM blogs b
      INNER JOIN blog_categories bc ON b.category_id = bc.category_id
      WHERE 1=1
    `;

    const queryParams: any[] = [];

    let paramIndex = 1;

    // Add category filter
    if (category) {
      query += ` AND bc.slug = $${paramIndex}`;
      queryParams.push(category);
      paramIndex++;
    }

    // Add featured filter
    if (featured !== undefined) {
      query += ` AND b.is_featured = $${paramIndex}`;
      queryParams.push(featured);
      paramIndex++;
    }

    // Add ordering and pagination
    query += ` ORDER BY b.published_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    // Get total count
    let countQuery = `
      SELECT COUNT(*) as total
      FROM blogs b
      INNER JOIN blog_categories bc ON b.category_id = bc.category_id
      WHERE 1=1
    `;

    const countParams: any[] = [];
    let countParamIndex = 1;

    if (category) {
      countQuery += ` AND bc.slug = $${countParamIndex}`;
      countParams.push(category);
      countParamIndex++;
    }

    if (featured !== undefined) {
      countQuery += ` AND b.is_featured = $${countParamIndex}`;
      countParams.push(featured);
      countParamIndex++;
    }

    try {
      const blogsResult: QueryResult = await pool.query(query, queryParams);
      const countResult: QueryResult = await pool.query(countQuery, countParams);
      
      const total = parseInt(countResult.rows[0]?.total || '0', 10);
      const result = { blogs: blogsResult.rows as Blog[], total };

      // Cache for 5 minutes (300 seconds)
      await cacheHelper.set(cacheKey, JSON.stringify(result), 300);

      return result;
    } catch (error) {
      console.error('Error in BlogModel.findAll:', error);
      throw error;
    }
  }

  /**
   * Find blog by ID
   */
  static async findById(id: number): Promise<Blog | null> {
    const cacheKey = `blog:${id}`;

    // Try to get from cache
    const cached = await cacheHelper.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const query = `
      SELECT 
        b.blog_id,
        b.title,
        b.slug,
        b.excerpt,
        b.content,
        b.featured_image,
        b.category_id,
        bc.name as category_name,
        bc.slug as category_slug,
        b.author,
        b.is_featured,
        b.view_count,
        b.published_at,
        b.created_at,
        b.updated_at
      FROM blogs b
      INNER JOIN blog_categories bc ON b.category_id = bc.category_id
      WHERE b.blog_id = $1
    `;

    try {
      const result: QueryResult = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }

      const blog = result.rows[0] as Blog;

      // Cache for 10 minutes (600 seconds)
      await cacheHelper.set(cacheKey, JSON.stringify(blog), 600);

      return blog;
    } catch (error) {
      console.error('Error in BlogModel.findById:', error);
      throw error;
    }
  }

  /**
   * Find blog by slug
   */
  static async findBySlug(slug: string): Promise<Blog | null> {
    const cacheKey = `blog:slug:${slug}`;

    // Try to get from cache
    const cached = await cacheHelper.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const query = `
      SELECT 
        b.blog_id,
        b.title,
        b.slug,
        b.excerpt,
        b.content,
        b.featured_image,
        b.category_id,
        bc.name as category_name,
        bc.slug as category_slug,
        b.author,
        b.is_featured,
        b.view_count,
        b.published_at,
        b.created_at,
        b.updated_at
      FROM blogs b
      INNER JOIN blog_categories bc ON b.category_id = bc.category_id
      WHERE b.slug = $1
    `;

    try {
      const result: QueryResult = await pool.query(query, [slug]);
      
      if (result.rows.length === 0) {
        return null;
      }

      const blog = result.rows[0] as Blog;

      // Cache for 10 minutes (600 seconds)
      await cacheHelper.set(cacheKey, JSON.stringify(blog), 600);

      return blog;
    } catch (error) {
      console.error('Error in BlogModel.findBySlug:', error);
      throw error;
    }
  }

  /**
   * Get related blogs from the same category
   */
  static async getRelated(id: number, limit: number = 4): Promise<Blog[]> {
    const cacheKey = `blog:${id}:related:${limit}`;

    // Try to get from cache
    const cached = await cacheHelper.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const query = `
      SELECT 
        b.blog_id,
        b.title,
        b.slug,
        b.excerpt,
        b.content,
        b.featured_image,
        b.category_id,
        bc.name as category_name,
        bc.slug as category_slug,
        b.author,
        b.is_featured,
        b.view_count,
        b.published_at,
        b.created_at,
        b.updated_at
      FROM blogs b
      INNER JOIN blog_categories bc ON b.category_id = bc.category_id
      WHERE b.category_id = (
        SELECT category_id FROM blogs WHERE blog_id = $1
      )
      AND b.blog_id != $2
      ORDER BY b.published_at DESC
      LIMIT $3
    `;

    try {
      const result: QueryResult = await pool.query(query, [id, id, limit]);
      const blogs = result.rows as Blog[];

      // Cache for 10 minutes (600 seconds)
      await cacheHelper.set(cacheKey, JSON.stringify(blogs), 600);

      return blogs;
    } catch (error) {
      console.error('Error in BlogModel.getRelated:', error);
      throw error;
    }
  }

  /**
   * Get featured blogs
   */
  static async getFeatured(limit: number = 5): Promise<Blog[]> {
    const cacheKey = `blogs:featured:${limit}`;

    // Try to get from cache
    const cached = await cacheHelper.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const query = `
      SELECT 
        b.blog_id,
        b.title,
        b.slug,
        b.excerpt,
        b.content,
        b.featured_image,
        b.category_id,
        bc.name as category_name,
        bc.slug as category_slug,
        b.author,
        b.is_featured,
        b.view_count,
        b.published_at,
        b.created_at,
        b.updated_at
      FROM blogs b
      INNER JOIN blog_categories bc ON b.category_id = bc.category_id
      WHERE b.is_featured = true
      ORDER BY b.published_at DESC
      LIMIT $1
    `;

    try {
      const result: QueryResult = await pool.query(query, [limit]);
      const blogs = result.rows as Blog[];

      // Cache for 5 minutes (300 seconds)
      await cacheHelper.set(cacheKey, JSON.stringify(blogs), 300);

      return blogs;
    } catch (error) {
      console.error('Error in BlogModel.getFeatured:', error);
      throw error;
    }
  }

  /**
   * Increment view count for a blog
   */
  static async incrementViewCount(id: number): Promise<void> {
    const query = `
      UPDATE blogs
      SET view_count = view_count + 1
      WHERE blog_id = $1
    `;

    try {
      await pool.query(query, [id]);

      // Invalidate cache for this blog
      await cacheHelper.del(`blog:${id}`);
    } catch (error) {
      console.error('Error in BlogModel.incrementViewCount:', error);
      // Don't throw error for view count increment failures
    }
  }
}

export default BlogModel;
