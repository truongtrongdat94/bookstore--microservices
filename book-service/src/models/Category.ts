import { query } from '../config/database';
import { Category } from '../types';
import { cache } from '../config/redis';
import config from '../config';

export class CategoryModel {
  // Create a new category
  static async create(name: string, parentId?: number, description?: string): Promise<Category> {
    const sql = `
      INSERT INTO categories (name, parent_id, description)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const result = await query(sql, [name, parentId || null, description || null]);
    
    // Invalidate cache
    await cache.del('categories:all');
    await cache.del('categories:tree');
    
    return result.rows[0];
  }
  
  // Get all categories
  static async findAll(): Promise<Category[]> {
    const cacheKey = 'categories:all';
    const cached = await cache.get(cacheKey);
    if (cached) return cached;
    
    const sql = `
      SELECT c.*, COUNT(b.book_id) as book_count
      FROM categories c
      LEFT JOIN books b ON c.category_id = b.category_id
      GROUP BY c.category_id
      ORDER BY c.name
    `;
    
    const result = await query(sql);
    const categories = result.rows;
    
    // Cache for 15 minutes
    await cache.set(cacheKey, categories, config.redis.ttl.categories);
    
    return categories;
  }
  
  // Get category by ID
  static async findById(categoryId: number): Promise<Category | null> {
    const sql = `
      SELECT c.*, COUNT(b.book_id) as book_count
      FROM categories c
      LEFT JOIN books b ON c.category_id = b.category_id
      WHERE c.category_id = $1
      GROUP BY c.category_id
    `;
    
    const result = await query(sql, [categoryId]);
    return result.rows[0] || null;
  }
  
  // Get category tree (hierarchical structure)
  static async getCategoryTree(): Promise<any[]> {
    const cacheKey = 'categories:tree';
    const cached = await cache.get(cacheKey);
    if (cached) return cached;
    
    const categories = await this.findAll();
    
    // Build tree structure
    const tree: any[] = [];
    const categoryMap = new Map();
    
    // First pass: create map
    categories.forEach(cat => {
      categoryMap.set(cat.category_id, { ...cat, children: [] });
    });
    
    // Second pass: build tree
    categories.forEach(cat => {
      if (cat.parent_id) {
        const parent = categoryMap.get(cat.parent_id);
        if (parent) {
          parent.children.push(categoryMap.get(cat.category_id));
        }
      } else {
        tree.push(categoryMap.get(cat.category_id));
      }
    });
    
    // Cache for 15 minutes
    await cache.set(cacheKey, tree, config.redis.ttl.categories);
    
    return tree;
  }
  
  // Update category
  static async update(categoryId: number, updates: Partial<Category>): Promise<Category | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCounter = 1;
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && key !== 'category_id') {
        fields.push(`${key} = $${paramCounter}`);
        values.push(value);
        paramCounter++;
      }
    });
    
    if (fields.length === 0) {
      return this.findById(categoryId);
    }
    
    values.push(categoryId);
    const sql = `
      UPDATE categories
      SET ${fields.join(', ')}
      WHERE category_id = $${paramCounter}
      RETURNING *
    `;
    
    const result = await query(sql, values);
    
    // Invalidate cache
    await cache.del('categories:all');
    await cache.del('categories:tree');
    
    return result.rows[0] || null;
  }
  
  // Delete category (only if no books associated)
  static async delete(categoryId: number): Promise<boolean> {
    const sql = 'DELETE FROM categories WHERE category_id = $1';
    const result = await query(sql, [categoryId]);
    
    // Invalidate cache
    await cache.del('categories:all');
    await cache.del('categories:tree');
    
    return (result.rowCount ?? 0) > 0;
  }
}
