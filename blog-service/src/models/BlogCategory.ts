import { QueryResult } from 'pg';
import pool from '../config/database';
import { cacheHelper } from '../config/redis';
import { BlogCategory } from '../types';

export class BlogCategoryModel {
  /**
   * Find all blog categories
   */
  static async findAll(): Promise<BlogCategory[]> {
    const cacheKey = 'blog:categories';

    // Try to get from cache
    const cached = await cacheHelper.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const query = `
      SELECT 
        category_id,
        slug,
        name,
        description,
        display_order,
        created_at,
        updated_at
      FROM blog_categories
      ORDER BY display_order ASC, name ASC
    `;

    try {
      const result: QueryResult = await pool.query(query);
      const categories = result.rows as BlogCategory[];

      // Cache for 1 hour (3600 seconds)
      await cacheHelper.set(cacheKey, JSON.stringify(categories), 3600);

      return categories;
    } catch (error) {
      console.error('Error in BlogCategoryModel.findAll:', error);
      throw error;
    }
  }

  /**
   * Find category by slug
   */
  static async findBySlug(slug: string): Promise<BlogCategory | null> {
    const cacheKey = `blog:category:slug:${slug}`;

    // Try to get from cache
    const cached = await cacheHelper.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const query = `
      SELECT 
        category_id,
        slug,
        name,
        description,
        display_order,
        created_at,
        updated_at
      FROM blog_categories
      WHERE slug = $1
    `;

    try {
      const result: QueryResult = await pool.query(query, [slug]);
      
      if (result.rows.length === 0) {
        return null;
      }

      const category = result.rows[0] as BlogCategory;

      // Cache for 1 hour (3600 seconds)
      await cacheHelper.set(cacheKey, JSON.stringify(category), 3600);

      return category;
    } catch (error) {
      console.error('Error in BlogCategoryModel.findBySlug:', error);
      throw error;
    }
  }

  /**
   * Find category by ID
   */
  static async findById(id: number): Promise<BlogCategory | null> {
    const cacheKey = `blog:category:${id}`;

    // Try to get from cache
    const cached = await cacheHelper.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const query = `
      SELECT 
        category_id,
        slug,
        name,
        description,
        display_order,
        created_at,
        updated_at
      FROM blog_categories
      WHERE category_id = $1
    `;

    try {
      const result: QueryResult = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }

      const category = result.rows[0] as BlogCategory;

      // Cache for 1 hour (3600 seconds)
      await cacheHelper.set(cacheKey, JSON.stringify(category), 3600);

      return category;
    } catch (error) {
      console.error('Error in BlogCategoryModel.findById:', error);
      throw error;
    }
  }
}

export default BlogCategoryModel;
