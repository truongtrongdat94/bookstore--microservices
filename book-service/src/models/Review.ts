import { query } from '../config/database';
import { Review, CreateReviewDto } from '../types';
import { cache } from '../config/redis';

export class ReviewModel {
  // Create a new review
  static async create(bookId: number, userId: number, reviewData: CreateReviewDto): Promise<Review> {
    // Check if user already reviewed this book
    const existingReview = await this.findByUserAndBook(userId, bookId);
    if (existingReview) {
      throw new Error('User has already reviewed this book');
    }
    
    const sql = `
      INSERT INTO reviews (book_id, user_id, rating, comment)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const result = await query(sql, [
      bookId,
      userId,
      reviewData.rating,
      reviewData.comment || null
    ]);
    
    // Invalidate book cache to update average rating
    await cache.del(`book:${bookId}`);
    
    return result.rows[0];
  }
  
  // Get all reviews for a book
  static async findByBookId(bookId: number): Promise<Review[]> {
    const sql = `
      SELECT r.*, u.username, u.full_name
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.user_id
      WHERE r.book_id = $1
      ORDER BY r.created_at DESC
    `;
    
    const result = await query(sql, [bookId]);
    return result.rows;
  }
  
  // Get review by user and book
  static async findByUserAndBook(userId: number, bookId: number): Promise<Review | null> {
    const sql = `
      SELECT * FROM reviews
      WHERE user_id = $1 AND book_id = $2
    `;
    
    const result = await query(sql, [userId, bookId]);
    return result.rows[0] || null;
  }
  
  // Get all reviews by a user
  static async findByUserId(userId: number): Promise<Review[]> {
    const sql = `
      SELECT r.*, b.title as book_title
      FROM reviews r
      LEFT JOIN books b ON r.book_id = b.book_id
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC
    `;
    
    const result = await query(sql, [userId]);
    return result.rows;
  }
  
  // Update review
  static async update(reviewId: number, userId: number, updates: CreateReviewDto): Promise<Review | null> {
    // Verify ownership
    const verifySQL = 'SELECT * FROM reviews WHERE review_id = $1 AND user_id = $2';
    const verifyResult = await query(verifySQL, [reviewId, userId]);
    
    if (verifyResult.rows.length === 0) {
      return null;
    }
    
    const sql = `
      UPDATE reviews
      SET rating = $1, comment = $2, updated_at = NOW()
      WHERE review_id = $3 AND user_id = $4
      RETURNING *
    `;
    
    const result = await query(sql, [
      updates.rating,
      updates.comment || null,
      reviewId,
      userId
    ]);
    
    // Invalidate book cache
    const review = result.rows[0];
    if (review) {
      await cache.del(`book:${review.book_id}`);
    }
    
    return review || null;
  }
  
  // Delete review
  static async delete(reviewId: number, userId: number): Promise<boolean> {
    // Get book ID before deletion for cache invalidation
    const selectSQL = 'SELECT book_id FROM reviews WHERE review_id = $1 AND user_id = $2';
    const selectResult = await query(selectSQL, [reviewId, userId]);
    
    if (selectResult.rows.length === 0) {
      return false;
    }
    
    const bookId = selectResult.rows[0].book_id;
    
    const sql = 'DELETE FROM reviews WHERE review_id = $1 AND user_id = $2';
    const result = await query(sql, [reviewId, userId]);
    
    // Invalidate book cache
    await cache.del(`book:${bookId}`);
    
    return (result.rowCount ?? 0) > 0;
  }
  
  // Get review statistics for a book
  static async getBookReviewStats(bookId: number): Promise<any> {
    const sql = `
      SELECT 
        COUNT(*) as total_reviews,
        AVG(rating) as average_rating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
      FROM reviews
      WHERE book_id = $1
    `;
    
    const result = await query(sql, [bookId]);
    return result.rows[0];
  }
}
