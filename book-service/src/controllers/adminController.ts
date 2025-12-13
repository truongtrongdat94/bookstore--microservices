/**
 * Admin Controller for Book Service
 * Handles admin-related book statistics and CRUD operations
 * Requirements: 1.4, 2.1, 2.3, 2.4, 2.5
 */
import { Request, Response } from 'express';
import { query } from '../config/database';
import { cache } from '../config/redis';
import { CreateBookDto, UpdateBookDto, ApiError } from '../types';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'book-service-admin' },
  transports: [new winston.transports.Console()]
});

/**
 * Admin Book Query Parameters Interface
 */
interface AdminBookQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: number;
  minPrice?: number;
  maxPrice?: number;
  author?: string;
  status?: 'active' | 'inactive' | 'out_of_stock';
  sortBy?: string;
  order?: 'asc' | 'desc';
}

/**
 * Get top selling books for admin dashboard
 * GET /admin/top-selling
 * Requirement: 1.4
 */
export const getTopSellingBooks = async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

    const sql = `
      SELECT 
        b.book_id as id,
        b.title,
        b.author,
        b.price,
        b.cover_image as "coverImage",
        COALESCE(b.sales_count, 0) as "salesCount",
        COALESCE(b.sales_count, 0) * b.price as revenue
      FROM books b
      ORDER BY b.sales_count DESC NULLS LAST, b.created_at DESC
      LIMIT $1
    `;

    const result = await query(sql, [limit]);

    res.json({
      success: true,
      data: result.rows.map(row => ({
        id: row.id,
        title: row.title,
        author: row.author,
        salesCount: parseInt(row.salesCount) || 0,
        revenue: parseFloat(row.revenue) || 0,
        coverImage: row.coverImage || ''
      }))
    });
  } catch (error) {
    logger.error('Error fetching top selling books:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch top selling books'
      }
    });
  }
};

/**
 * Get book statistics for admin dashboard
 * GET /admin/stats
 */
export const getBookStats = async (req: Request, res: Response) => {
  try {
    const sql = `
      SELECT 
        COUNT(*) as total_books,
        COUNT(CASE WHEN stock_quantity > 0 THEN 1 END) as in_stock,
        COUNT(CASE WHEN stock_quantity = 0 THEN 1 END) as out_of_stock,
        COALESCE(SUM(sales_count), 0) as total_sales
      FROM books
    `;

    const result = await query(sql);
    const row = result.rows[0];

    res.json({
      success: true,
      data: {
        totalBooks: parseInt(row.total_books) || 0,
        inStock: parseInt(row.in_stock) || 0,
        outOfStock: parseInt(row.out_of_stock) || 0,
        totalSales: parseInt(row.total_sales) || 0
      }
    });
  } catch (error) {
    logger.error('Error fetching book stats:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch book statistics'
      }
    });
  }
};

/**
 * Get all books with pagination, sorting, filtering for admin
 * GET /admin/books
 * Requirements: 2.4, 2.5
 */
export const getAdminBooks = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      minPrice,
      maxPrice,
      author,
      status,
      sortBy = 'created_at',
      order = 'desc'
    } = req.query as unknown as AdminBookQueryParams;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const offset = (pageNum - 1) * limitNum;

    // Build dynamic query
    const whereConditions: string[] = [];
    const queryParams: any[] = [];
    let paramCounter = 1;

    // Full-text search on title, author, description (Requirement 2.5)
    if (search) {
      whereConditions.push(`(
        LOWER(b.title) LIKE LOWER($${paramCounter}) OR 
        LOWER(b.author) LIKE LOWER($${paramCounter}) OR 
        LOWER(b.description) LIKE LOWER($${paramCounter})
      )`);
      queryParams.push(`%${search}%`);
      paramCounter++;
    }

    if (category) {
      whereConditions.push(`b.category_id = $${paramCounter}`);
      queryParams.push(Number(category));
      paramCounter++;
    }

    if (minPrice !== undefined) {
      whereConditions.push(`b.price >= $${paramCounter}`);
      queryParams.push(Number(minPrice));
      paramCounter++;
    }

    if (maxPrice !== undefined) {
      whereConditions.push(`b.price <= $${paramCounter}`);
      queryParams.push(Number(maxPrice));
      paramCounter++;
    }

    if (author) {
      whereConditions.push(`LOWER(b.author) LIKE LOWER($${paramCounter})`);
      queryParams.push(`%${author}%`);
      paramCounter++;
    }

    // Status filter based on stock
    if (status === 'out_of_stock') {
      whereConditions.push(`b.stock_quantity = 0`);
    } else if (status === 'active') {
      whereConditions.push(`b.stock_quantity > 0`);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    // Validate sortBy to prevent SQL injection
    const allowedSortFields = ['title', 'price', 'created_at', 'updated_at', 'stock_quantity', 'sales_count'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const safeOrder = order?.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    // Get books with category info
    const booksQuery = `
      SELECT 
        b.book_id as id,
        b.title,
        b.author as "authorName",
        b.category_id as "categoryId",
        c.name as "categoryName",
        b.price,
        b.original_price as "originalPrice",
        b.description,
        b.cover_image as "coverImage",
        b.stock_quantity as stock,
        b.isbn,
        b.publisher,
        b.pages,
        b.language,
        b.published_date as "publishedDate",
        COALESCE(b.sales_count, 0) as "salesCount",
        CASE 
          WHEN b.stock_quantity = 0 THEN 'out_of_stock'
          ELSE 'active'
        END as status,
        b.created_at as "createdAt",
        b.updated_at as "updatedAt"
      FROM books b
      LEFT JOIN categories c ON b.category_id = c.category_id
      ${whereClause}
      ORDER BY b.${safeSortBy} ${safeOrder}
      LIMIT $${paramCounter} OFFSET $${paramCounter + 1}
    `;

    queryParams.push(limitNum, offset);

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

    const total = parseInt(countResult.rows[0].total);

    res.json({
      success: true,
      data: booksResult.rows,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    logger.error('Error fetching admin books:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch books'
      }
    });
  }
};

/**
 * Get single book by ID for admin
 * GET /admin/books/:id
 * Requirement: 2.1
 */
export const getAdminBookById = async (req: Request, res: Response): Promise<any> => {
  try {
    const bookId = parseInt(req.params.id);

    if (isNaN(bookId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid book ID'
        }
      });
      return;
    }

    const sql = `
      SELECT 
        b.book_id as id,
        b.title,
        b.author as "authorName",
        b.category_id as "categoryId",
        c.name as "categoryName",
        b.price,
        b.original_price as "originalPrice",
        b.description,
        b.cover_image as "coverImage",
        b.stock_quantity as stock,
        b.isbn,
        b.publisher,
        b.pages,
        b.language,
        b.dimensions,
        b.published_date as "publishedDate",
        COALESCE(b.sales_count, 0) as "salesCount",
        CASE 
          WHEN b.stock_quantity = 0 THEN 'out_of_stock'
          ELSE 'active'
        END as status,
        b.created_at as "createdAt",
        b.updated_at as "updatedAt"
      FROM books b
      LEFT JOIN categories c ON b.category_id = c.category_id
      WHERE b.book_id = $1
    `;

    const result = await query(sql, [bookId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'BOOK_NOT_FOUND',
          message: 'Book not found'
        }
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error fetching book by ID:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch book'
      }
    });
  }
};

/**
 * Create a new book
 * POST /admin/books
 * Requirement: 2.1
 */
export const createAdminBook = async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      title,
      author,
      categoryId,
      price,
      originalPrice,
      description,
      coverImage,
      stock,
      isbn,
      publisher,
      pages,
      language,
      dimensions,
      publishedDate
    } = req.body;

    // Validation
    if (!title || !author || !price || categoryId === undefined) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Title, author, price, and categoryId are required'
        }
      });
    }

    if (price < 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Price must be a positive number'
        }
      });
    }

    const sql = `
      INSERT INTO books (
        title, author, isbn, price, original_price, stock_quantity, 
        category_id, description, cover_image, published_date,
        publisher, pages, dimensions, language
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING 
        book_id as id,
        title,
        author as "authorName",
        category_id as "categoryId",
        price,
        original_price as "originalPrice",
        description,
        cover_image as "coverImage",
        stock_quantity as stock,
        isbn,
        publisher,
        pages,
        language,
        dimensions,
        published_date as "publishedDate",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    const values = [
      title,
      author,
      isbn || null,
      price,
      originalPrice || price,
      stock || 0,
      categoryId,
      description || null,
      coverImage || null,
      publishedDate || null,
      publisher || null,
      pages || null,
      dimensions || null,
      language || 'Tiếng Việt'
    ];

    const result = await query(sql, values);

    // Invalidate cache
    await cache.del('books:list:*');

    logger.info(`Book created: ${result.rows[0].id} - ${title}`);

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error: any) {
    logger.error('Error creating book:', error);
    
    if (error.code === '23503') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'FOREIGN_KEY_VIOLATION',
          message: 'Category does not exist'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create book'
      }
    });
  }
};

/**
 * Update a book
 * PUT /admin/books/:id
 * Requirement: 2.1
 */
export const updateAdminBook = async (req: Request, res: Response): Promise<any> => {
  try {
    const bookId = parseInt(req.params.id);

    if (isNaN(bookId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid book ID'
        }
      });
    }

    // Check if book exists
    const existsResult = await query('SELECT book_id FROM books WHERE book_id = $1', [bookId]);
    if (existsResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'BOOK_NOT_FOUND',
          message: 'Book not found'
        }
      });
    }

    const {
      title,
      author,
      categoryId,
      price,
      originalPrice,
      description,
      coverImage,
      stock,
      isbn,
      publisher,
      pages,
      language,
      dimensions,
      publishedDate
    } = req.body;

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramCounter = 1;

    const fieldMappings: Record<string, { value: any; column: string }> = {
      title: { value: title, column: 'title' },
      author: { value: author, column: 'author' },
      categoryId: { value: categoryId, column: 'category_id' },
      price: { value: price, column: 'price' },
      originalPrice: { value: originalPrice, column: 'original_price' },
      description: { value: description, column: 'description' },
      coverImage: { value: coverImage, column: 'cover_image' },
      stock: { value: stock, column: 'stock_quantity' },
      isbn: { value: isbn, column: 'isbn' },
      publisher: { value: publisher, column: 'publisher' },
      pages: { value: pages, column: 'pages' },
      language: { value: language, column: 'language' },
      dimensions: { value: dimensions, column: 'dimensions' },
      publishedDate: { value: publishedDate, column: 'published_date' }
    };

    for (const [key, mapping] of Object.entries(fieldMappings)) {
      if (mapping.value !== undefined) {
        updates.push(`${mapping.column} = $${paramCounter}`);
        values.push(mapping.value);
        paramCounter++;
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'No fields to update'
        }
      });
    }

    values.push(bookId);

    const sql = `
      UPDATE books
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE book_id = $${paramCounter}
      RETURNING 
        book_id as id,
        title,
        author as "authorName",
        category_id as "categoryId",
        price,
        original_price as "originalPrice",
        description,
        cover_image as "coverImage",
        stock_quantity as stock,
        isbn,
        publisher,
        pages,
        language,
        dimensions,
        published_date as "publishedDate",
        CASE 
          WHEN stock_quantity = 0 THEN 'out_of_stock'
          ELSE 'active'
        END as status,
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    const result = await query(sql, values);

    // Invalidate cache
    await cache.del(`book:${bookId}`);
    await cache.del('books:list:*');

    logger.info(`Book updated: ${bookId}`);

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error: any) {
    logger.error('Error updating book:', error);

    if (error.code === '23503') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'FOREIGN_KEY_VIOLATION',
          message: 'Category does not exist'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update book'
      }
    });
  }
};

/**
 * Delete a book
 * DELETE /admin/books/:id
 * Requirement: 2.3
 */
export const deleteAdminBook = async (req: Request, res: Response): Promise<any> => {
  try {
    const bookId = parseInt(req.params.id);

    if (isNaN(bookId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid book ID'
        }
      });
    }

    // Check if book exists
    const existsResult = await query('SELECT book_id, title FROM books WHERE book_id = $1', [bookId]);
    if (existsResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'BOOK_NOT_FOUND',
          message: 'Book not found'
        }
      });
    }

    const bookTitle = existsResult.rows[0].title;

    // Delete the book
    await query('DELETE FROM books WHERE book_id = $1', [bookId]);

    // Invalidate cache
    await cache.del(`book:${bookId}`);
    await cache.del('books:list:*');

    logger.info(`Book deleted: ${bookId} - ${bookTitle}`);

    res.json({
      success: true,
      data: {
        id: bookId,
        message: `Book "${bookTitle}" has been deleted successfully`
      }
    });
  } catch (error: any) {
    logger.error('Error deleting book:', error);

    // Handle foreign key constraint (e.g., book has reviews or order items)
    if (error.code === '23503') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'FOREIGN_KEY_VIOLATION',
          message: 'Cannot delete book with existing orders or reviews'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete book'
      }
    });
  }
};

/**
 * Admin Author Query Parameters Interface
 */
interface AdminAuthorQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

/**
 * Get all authors with pagination for admin
 * GET /admin/authors
 * Requirement: 4.1
 */
export const getAdminAuthors = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      sortBy = 'name',
      order = 'asc'
    } = req.query as unknown as AdminAuthorQueryParams;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const offset = (pageNum - 1) * limitNum;

    // Build dynamic query
    const whereConditions: string[] = [];
    const queryParams: any[] = [];
    let paramCounter = 1;

    // Search on name and bio
    if (search) {
      whereConditions.push(`(
        LOWER(a.name) LIKE LOWER($${paramCounter}) OR 
        LOWER(a.bio) LIKE LOWER($${paramCounter})
      )`);
      queryParams.push(`%${search}%`);
      paramCounter++;
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    // Validate sortBy to prevent SQL injection
    const allowedSortFields = ['name', 'created_at', 'updated_at', 'book_count'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'name';
    const safeOrder = order?.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    // Get authors with book count
    const authorsQuery = `
      SELECT 
        a.author_id as id,
        a.name,
        a.nationality,
        a.birth_year as "birthYear",
        a.death_year as "deathYear",
        a.bio as biography,
        a.quote,
        a.image_url as "profileImage",
        a.website,
        COUNT(ba.book_id)::integer as "bookCount",
        a.created_at as "createdAt",
        a.updated_at as "updatedAt"
      FROM authors a
      LEFT JOIN book_authors ba ON a.author_id = ba.author_id
      ${whereClause}
      GROUP BY a.author_id
      ORDER BY ${safeSortBy === 'book_count' ? '"bookCount"' : `a.${safeSortBy}`} ${safeOrder}
      LIMIT $${paramCounter} OFFSET $${paramCounter + 1}
    `;

    queryParams.push(limitNum, offset);

    // Get total count
    const countQuery = `
      SELECT COUNT(DISTINCT a.author_id) as total
      FROM authors a
      ${whereClause}
    `;

    const [authorsResult, countResult] = await Promise.all([
      query(authorsQuery, queryParams),
      query(countQuery, queryParams.slice(0, -2)) // Remove limit and offset
    ]);

    const total = parseInt(countResult.rows[0].total);

    res.json({
      success: true,
      data: authorsResult.rows,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    logger.error('Error fetching admin authors:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch authors'
      }
    });
  }
};

/**
 * Get single author by ID for admin
 * GET /admin/authors/:id
 * Requirement: 4.1
 */
export const getAdminAuthorById = async (req: Request, res: Response): Promise<any> => {
  try {
    const authorId = parseInt(req.params.id);

    if (isNaN(authorId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid author ID'
        }
      });
    }

    const sql = `
      SELECT 
        a.author_id as id,
        a.name,
        a.nationality,
        a.birth_year as "birthYear",
        a.death_year as "deathYear",
        a.bio as biography,
        a.quote,
        a.image_url as "profileImage",
        a.website,
        COUNT(ba.book_id)::integer as "bookCount",
        a.created_at as "createdAt",
        a.updated_at as "updatedAt"
      FROM authors a
      LEFT JOIN book_authors ba ON a.author_id = ba.author_id
      WHERE a.author_id = $1
      GROUP BY a.author_id
    `;

    const result = await query(sql, [authorId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'AUTHOR_NOT_FOUND',
          message: 'Author not found'
        }
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error fetching author by ID:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch author'
      }
    });
  }
};

/**
 * Create a new author
 * POST /admin/authors
 * Requirement: 4.1
 */
export const createAdminAuthor = async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      name,
      nationality,
      birthYear,
      deathYear,
      biography,
      quote,
      profileImage,
      website
    } = req.body;

    // Validation
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Author name is required'
        }
      });
    }

    const sql = `
      INSERT INTO authors (
        name, nationality, birth_year, death_year, bio, quote, image_url, website
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING 
        author_id as id,
        name,
        nationality,
        birth_year as "birthYear",
        death_year as "deathYear",
        bio as biography,
        quote,
        image_url as "profileImage",
        website,
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    const values = [
      name.trim(),
      nationality || null,
      birthYear || null,
      deathYear || null,
      biography || null,
      quote || null,
      profileImage || null,
      website || null
    ];

    const result = await query(sql, values);

    // Invalidate cache
    await cache.del('authors:*');

    logger.info(`Author created: ${result.rows[0].id} - ${name}`);

    res.status(201).json({
      success: true,
      data: { ...result.rows[0], bookCount: 0 }
    });
  } catch (error: any) {
    logger.error('Error creating author:', error);
    
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: {
          code: 'DUPLICATE_ENTRY',
          message: 'Author with this name already exists'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create author'
      }
    });
  }
};

/**
 * Update an author
 * PUT /admin/authors/:id
 * Requirement: 4.2
 */
export const updateAdminAuthor = async (req: Request, res: Response): Promise<any> => {
  try {
    const authorId = parseInt(req.params.id);

    if (isNaN(authorId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid author ID'
        }
      });
    }

    // Check if author exists
    const existsResult = await query('SELECT author_id FROM authors WHERE author_id = $1', [authorId]);
    if (existsResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'AUTHOR_NOT_FOUND',
          message: 'Author not found'
        }
      });
    }

    const {
      name,
      nationality,
      birthYear,
      deathYear,
      biography,
      quote,
      profileImage,
      website
    } = req.body;

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramCounter = 1;

    const fieldMappings: Record<string, { value: any; column: string }> = {
      name: { value: name, column: 'name' },
      nationality: { value: nationality, column: 'nationality' },
      birthYear: { value: birthYear, column: 'birth_year' },
      deathYear: { value: deathYear, column: 'death_year' },
      biography: { value: biography, column: 'bio' },
      quote: { value: quote, column: 'quote' },
      profileImage: { value: profileImage, column: 'image_url' },
      website: { value: website, column: 'website' }
    };

    for (const [key, mapping] of Object.entries(fieldMappings)) {
      if (mapping.value !== undefined) {
        updates.push(`${mapping.column} = $${paramCounter}`);
        values.push(mapping.value);
        paramCounter++;
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'No fields to update'
        }
      });
    }

    values.push(authorId);

    const sql = `
      UPDATE authors
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE author_id = $${paramCounter}
      RETURNING 
        author_id as id,
        name,
        nationality,
        birth_year as "birthYear",
        death_year as "deathYear",
        bio as biography,
        quote,
        image_url as "profileImage",
        website,
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    const result = await query(sql, values);

    // Get book count
    const bookCountResult = await query(
      'SELECT COUNT(*)::integer as count FROM book_authors WHERE author_id = $1',
      [authorId]
    );

    // Invalidate cache
    await cache.del(`author:${authorId}`);
    await cache.del(`author:${authorId}:books`);
    await cache.del('authors:*');

    logger.info(`Author updated: ${authorId}`);

    res.json({
      success: true,
      data: { 
        ...result.rows[0], 
        bookCount: bookCountResult.rows[0].count 
      }
    });
  } catch (error: any) {
    logger.error('Error updating author:', error);

    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: {
          code: 'DUPLICATE_ENTRY',
          message: 'Author with this name already exists'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update author'
      }
    });
  }
};

/**
 * Delete an author (with book check)
 * DELETE /admin/authors/:id
 * Requirement: 4.4
 */
export const deleteAdminAuthor = async (req: Request, res: Response): Promise<any> => {
  try {
    const authorId = parseInt(req.params.id);

    if (isNaN(authorId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid author ID'
        }
      });
    }

    // Check if author exists
    const existsResult = await query('SELECT author_id, name FROM authors WHERE author_id = $1', [authorId]);
    if (existsResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'AUTHOR_NOT_FOUND',
          message: 'Author not found'
        }
      });
    }

    const authorName = existsResult.rows[0].name;

    // Check if author has associated books (Requirement 4.4)
    const bookCountResult = await query(
      'SELECT COUNT(*)::integer as count FROM book_authors WHERE author_id = $1',
      [authorId]
    );

    if (bookCountResult.rows[0].count > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'AUTHOR_HAS_BOOKS',
          message: `Cannot delete author "${authorName}" because they have ${bookCountResult.rows[0].count} associated book(s). Please remove the book associations first.`
        }
      });
    }

    // Delete the author
    await query('DELETE FROM authors WHERE author_id = $1', [authorId]);

    // Invalidate cache
    await cache.del(`author:${authorId}`);
    await cache.del(`author:${authorId}:books`);
    await cache.del('authors:*');

    logger.info(`Author deleted: ${authorId} - ${authorName}`);

    res.json({
      success: true,
      data: {
        id: authorId,
        message: `Author "${authorName}" has been deleted successfully`
      }
    });
  } catch (error: any) {
    logger.error('Error deleting author:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete author'
      }
    });
  }
};

/**
 * Get books by author for admin
 * GET /admin/authors/:id/books
 * Requirement: 4.3
 */
export const getAdminAuthorBooks = async (req: Request, res: Response): Promise<any> => {
  try {
    const authorId = parseInt(req.params.id);

    if (isNaN(authorId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid author ID'
        }
      });
    }

    // Check if author exists
    const authorResult = await query('SELECT author_id, name FROM authors WHERE author_id = $1', [authorId]);
    if (authorResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'AUTHOR_NOT_FOUND',
          message: 'Author not found'
        }
      });
    }

    const sql = `
      SELECT 
        b.book_id as id,
        b.title,
        b.author as "authorName",
        b.category_id as "categoryId",
        c.name as "categoryName",
        b.price,
        b.original_price as "originalPrice",
        b.cover_image as "coverImage",
        b.stock_quantity as stock,
        COALESCE(b.sales_count, 0) as "salesCount",
        CASE 
          WHEN b.stock_quantity = 0 THEN 'out_of_stock'
          ELSE 'active'
        END as status,
        b.created_at as "createdAt"
      FROM books b
      INNER JOIN book_authors ba ON b.book_id = ba.book_id
      LEFT JOIN categories c ON b.category_id = c.category_id
      WHERE ba.author_id = $1
      ORDER BY b.created_at DESC
    `;

    const result = await query(sql, [authorId]);

    res.json({
      success: true,
      data: result.rows,
      meta: {
        authorId,
        authorName: authorResult.rows[0].name,
        total: result.rows.length
      }
    });
  } catch (error) {
    logger.error('Error fetching author books:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch author books'
      }
    });
  }
};

export default {
  getTopSellingBooks,
  getBookStats,
  getAdminBooks,
  getAdminBookById,
  createAdminBook,
  updateAdminBook,
  deleteAdminBook,
  getAdminAuthors,
  getAdminAuthorById,
  createAdminAuthor,
  updateAdminAuthor,
  deleteAdminAuthor,
  getAdminAuthorBooks
};
