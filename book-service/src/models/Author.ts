import { query } from '../config/database';
import { AuthorWithBookCount, Book } from '../types';

export class AuthorModel {
  /**
   * Get all authors with book count
   * Uses JOIN with book_authors to calculate the number of books per author
   * Note: Caching is handled at the controller level to ensure proper ApiResponse format
   */
  static async findAll(): Promise<AuthorWithBookCount[]> {
    const sql = `
      SELECT 
        a.*,
        COUNT(ba.book_id)::integer as book_count
      FROM authors a
      LEFT JOIN book_authors ba ON a.author_id = ba.author_id
      GROUP BY a.author_id
      ORDER BY a.name
    `;
    
    const result = await query(sql);
    return result.rows;
  }
  
  /**
   * Get author by ID with book count
   * Uses JOIN with book_authors to calculate the number of books
   * Note: Caching is handled at the controller level to ensure proper ApiResponse format
   */
  static async findById(authorId: number): Promise<AuthorWithBookCount | null> {
    const sql = `
      SELECT 
        a.*,
        COUNT(ba.book_id)::integer as book_count
      FROM authors a
      LEFT JOIN book_authors ba ON a.author_id = ba.author_id
      WHERE a.author_id = $1
      GROUP BY a.author_id
    `;
    
    const result = await query(sql, [authorId]);
    return result.rows[0] || null;
  }
  
  /**
   * Get all books by a specific author
   * Uses JOIN with book_authors, books, and categories tables
   * Note: Caching is handled at the controller level to ensure proper ApiResponse format
   */
  static async getBooksByAuthor(authorId: number): Promise<Book[]> {
    const sql = `
      SELECT 
        b.*,
        c.name as category_name,
        ba.author_order
      FROM books b
      INNER JOIN book_authors ba ON b.book_id = ba.book_id
      LEFT JOIN categories c ON b.category_id = c.category_id
      WHERE ba.author_id = $1
      ORDER BY ba.author_order, b.published_date DESC
    `;
    
    const result = await query(sql, [authorId]);
    return result.rows;
  }
  
  /**
   * Get top authors by total sales count
   * Returns authors sorted by the sum of sales_count from their books
   * Note: Caching is handled at the controller level to ensure proper ApiResponse format
   */
  static async getTopAuthorsBySales(limit: number = 6): Promise<AuthorWithBookCount[]> {
    const sql = `
      SELECT 
        a.*,
        COUNT(ba.book_id)::integer as book_count,
        COALESCE(SUM(b.sales_count), 0)::integer as total_sales
      FROM authors a
      LEFT JOIN book_authors ba ON a.author_id = ba.author_id
      LEFT JOIN books b ON ba.book_id = b.book_id
      GROUP BY a.author_id
      HAVING COUNT(ba.book_id) > 0
      ORDER BY total_sales DESC, book_count DESC, a.name
      LIMIT $1
    `;
    
    const result = await query(sql, [limit]);
    return result.rows;
  }
}
