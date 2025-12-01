import { query } from '../config/database';
import { Book, CreateBookDto, UpdateBookDto, BookQueryParams } from '../types';
import { cache } from '../config/redis';
import config from '../config';

export class BookModel {
  // Create a new book
  static async create(bookData: CreateBookDto): Promise<Book> {
    const sql = `
      INSERT INTO books (
        title, author, isbn, price, original_price, stock_quantity, 
        category_id, description, cover_image, published_date,
        publisher, pages, dimensions, language
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;
    
    const values = [
      bookData.title,
      bookData.author,
      bookData.isbn || null,
      bookData.price,
      bookData.original_price || bookData.price, // Default to price if not provided
      bookData.stock_quantity,
      bookData.category_id,
      bookData.description || null,
      bookData.cover_image || null,
      bookData.published_date || null,
      bookData.publisher || null,
      bookData.pages || null,
      bookData.dimensions || null,
      bookData.language || 'Tiếng Việt'
    ];
    
    const result = await query(sql, values);
    
    // Invalidate cache
    await cache.del('books:list:*');
    
    return result.rows[0];
  }
  
  // Find all books with filtering and pagination
  static async findAll(params: BookQueryParams): Promise<{ books: Book[], total: number }> {
    const { 
      page = 1, 
      limit = config.pagination.defaultLimit, 
      search, 
      category, 
      minPrice, 
      maxPrice,
      author,
      publisher,
      language,
      year,
      sortBy = 'created_at',
      order = 'desc'
    } = params;
    
    const offset = (page - 1) * limit;
    
    // Try to get from cache
    const cacheKey = `books:list:${JSON.stringify(params)}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;
    
    // Build dynamic query
    let whereConditions = [];
    let queryParams = [];
    let paramCounter = 1;
    
    if (search) {
      whereConditions.push(`(LOWER(b.title) LIKE LOWER($${paramCounter}) OR LOWER(b.author) LIKE LOWER($${paramCounter}))`);
      queryParams.push(`%${search}%`);
      paramCounter++;
    }
    
    if (category) {
      whereConditions.push(`b.category_id = $${paramCounter}`);
      queryParams.push(category);
      paramCounter++;
    }
    
    if (minPrice !== undefined) {
      whereConditions.push(`b.price >= $${paramCounter}`);
      queryParams.push(minPrice);
      paramCounter++;
    }
    
    if (maxPrice !== undefined) {
      whereConditions.push(`b.price <= $${paramCounter}`);
      queryParams.push(maxPrice);
      paramCounter++;
    }
    
    if (author) {
      whereConditions.push(`LOWER(b.author) LIKE LOWER($${paramCounter})`);
      queryParams.push(`%${author}%`);
      paramCounter++;
    }
    
    if (publisher) {
      whereConditions.push(`LOWER(b.publisher) LIKE LOWER($${paramCounter})`);
      queryParams.push(`%${publisher}%`);
      paramCounter++;
    }
    
    if (language) {
      whereConditions.push(`LOWER(b.language) = LOWER($${paramCounter})`);
      queryParams.push(language);
      paramCounter++;
    }
    
    if (year) {
      whereConditions.push(`EXTRACT(YEAR FROM b.published_date) = $${paramCounter}`);
      queryParams.push(year);
      paramCounter++;
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    // Get books with category info
    const booksQuery = `
      SELECT 
        b.*, 
        b.cover_image as cover_image_url,
        c.name as category_name,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(DISTINCT r.review_id) as review_count
      FROM books b
      LEFT JOIN categories c ON b.category_id = c.category_id
      LEFT JOIN reviews r ON b.book_id = r.book_id
      ${whereClause}
      GROUP BY b.book_id, c.category_id
      ORDER BY b.${sortBy} ${order.toUpperCase()}
      LIMIT $${paramCounter} OFFSET $${paramCounter + 1}
    `;
    
    queryParams.push(limit, offset);
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM books b
      ${whereClause}
    `;
    
    const [booksResult, countResult] = await Promise.all([
      query(booksQuery, queryParams),
      query(countQuery, queryParams.slice(0, -2)) // Remove limit and offset
    ]);
    
    const result = {
      books: booksResult.rows,
      total: parseInt(countResult.rows[0].total)
    };
    
    // Cache the result
    await cache.set(cacheKey, result, config.redis.ttl.bookList);
    
    return result;
  }
  
  // Find book by ID
  static async findById(bookId: number): Promise<Book | null> {
    // Try cache first
    const cacheKey = `book:${bookId}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;
    
    const sql = `
      SELECT 
        b.*,
        b.cover_image as cover_image_url,
        c.name as category_name,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(DISTINCT r.review_id) as review_count
      FROM books b
      LEFT JOIN categories c ON b.category_id = c.category_id
      LEFT JOIN reviews r ON b.book_id = r.book_id
      WHERE b.book_id = $1
      GROUP BY b.book_id, c.category_id
    `;
    
    const result = await query(sql, [bookId]);
    const book = result.rows[0] || null;
    
    if (book) {
      await cache.set(cacheKey, book, config.redis.ttl.bookDetail);
    }
    
    return book;
  }
  
  // Update book
  static async update(bookId: number, updates: UpdateBookDto): Promise<Book | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCounter = 1;
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCounter}`);
        values.push(value);
        paramCounter++;
      }
    });
    
    if (fields.length === 0) {
      return this.findById(bookId);
    }
    
    values.push(bookId);
    const sql = `
      UPDATE books
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE book_id = $${paramCounter}
      RETURNING *
    `;
    
    const result = await query(sql, values);
    
    // Invalidate cache
    await cache.del(`book:${bookId}`);
    await cache.del('books:list:*');
    
    return result.rows[0] || null;
  }
  
  // Delete book
  static async delete(bookId: number): Promise<boolean> {
    const sql = 'DELETE FROM books WHERE book_id = $1';
    const result = await query(sql, [bookId]);
    
    // Invalidate cache
    await cache.del(`book:${bookId}`);
    await cache.del('books:list:*');
    
    return (result.rowCount ?? 0) > 0;
  }
  
  // Update stock quantity
  static async updateStock(bookId: number, quantity: number): Promise<Book | null> {
    const sql = `
      UPDATE books
      SET stock_quantity = stock_quantity + $2
      WHERE book_id = $1
      RETURNING *
    `;
    
    const result = await query(sql, [bookId, quantity]);
    
    // Invalidate cache
    await cache.del(`book:${bookId}`);
    
    return result.rows[0] || null;
  }
  
  // Get best sellers (using sales_count field instead of JOIN)
  static async getBestSellers(limit: number = 10): Promise<Book[]> {
    const cacheKey = `books:bestsellers:${limit}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;
    
    const sql = `
      SELECT b.*, b.cover_image as cover_image_url, c.name as category_name,
             COALESCE(AVG(r.rating), 0) as average_rating,
             COUNT(r.review_id)::text as review_count
      FROM books b
      LEFT JOIN categories c ON b.category_id = c.category_id
      LEFT JOIN reviews r ON b.book_id = r.book_id
      GROUP BY b.book_id, c.name
      ORDER BY b.sales_count DESC, b.created_at DESC
      LIMIT $1
    `;
    
    const result = await query(sql, [limit]);
    
    // Cache for 1 hour
    await cache.set(cacheKey, result.rows, 3600);
    
    return result.rows;
  }
}
