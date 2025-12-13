/**
 * Admin Routes for Book Service
 * Handles admin-related book and author endpoints
 * Requirements: 1.4, 2.1, 2.3, 2.4, 2.5, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 5.4
 */
import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { 
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
} from '../controllers/adminController';
import { bulkImportBooks, exportBooks } from '../controllers/bulkOperationsController';

// Configure multer for file uploads (memory storage for processing)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/octet-stream' // Some browsers send this for CSV
    ];
    if (allowedMimes.includes(file.mimetype) || 
        file.originalname.endsWith('.csv') || 
        file.originalname.endsWith('.xlsx') || 
        file.originalname.endsWith('.xls')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV and Excel files are allowed.'));
    }
  }
});

const router = Router();

/**
 * Admin role check middleware
 */
const requireAdmin = (req: any, res: Response, next: NextFunction): void => {
  console.log('requireAdmin check:', { 
    user: req.user, 
    headers: {
      'x-user-id': req.headers['x-user-id'],
      'x-user-role': req.headers['x-user-role']
    }
  });
  
  if (!req.user || req.user.role !== 'admin') {
    console.log('Admin access denied:', { user: req.user });
    res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Admin access required'
      }
    });
    return;
  }
  next();
};

/**
 * Book Statistics Routes
 * Requirement: 1.4
 */

// GET /admin/top-selling - Get top selling books for dashboard
router.get('/top-selling', getTopSellingBooks);

// GET /admin/stats - Get book statistics
router.get('/stats', getBookStats);

/**
 * Book CRUD Routes
 * Requirements: 2.1, 2.3, 2.4, 2.5
 */

// GET /admin/books - Get all books with pagination, sorting, filtering, search
router.get('/books', getAdminBooks);

// GET /admin/books/:id - Get single book by ID
router.get('/books/:id', getAdminBookById);

// POST /admin/books - Create a new book
router.post('/books', requireAdmin, createAdminBook);

// PUT /admin/books/:id - Update a book
router.put('/books/:id', requireAdmin, updateAdminBook);

// DELETE /admin/books/:id - Delete a book
router.delete('/books/:id', requireAdmin, deleteAdminBook);

/**
 * Bulk Operations Routes
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */

// POST /admin/books/bulk-import - Import books from CSV/Excel
router.post('/books/bulk-import', requireAdmin, upload.single('file'), bulkImportBooks);

// GET /admin/books/export - Export books to CSV/Excel
router.get('/books/export', exportBooks);

/**
 * Author CRUD Routes
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */

// GET /admin/authors - Get all authors with pagination
router.get('/authors', getAdminAuthors);

// GET /admin/authors/:id - Get single author by ID
router.get('/authors/:id', getAdminAuthorById);

// GET /admin/authors/:id/books - Get all books by author
router.get('/authors/:id/books', getAdminAuthorBooks);

// POST /admin/authors - Create a new author
router.post('/authors', requireAdmin, createAdminAuthor);

// PUT /admin/authors/:id - Update an author
router.put('/authors/:id', requireAdmin, updateAdminAuthor);

// DELETE /admin/authors/:id - Delete an author (with book check)
router.delete('/authors/:id', requireAdmin, deleteAdminAuthor);

export default router;
