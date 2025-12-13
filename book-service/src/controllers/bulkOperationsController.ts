/**
 * Bulk Operations Controller for Book Service
 * Handles bulk import and export of books
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */
import { Request, Response } from 'express';
import { query } from '../config/database';
import * as Papa from 'papaparse';
import * as XLSX from 'xlsx';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'book-service-bulk' },
  transports: [new winston.transports.Console()]
});

/**
 * Import Error Interface
 */
interface ImportError {
  row: number;
  field: string;
  message: string;
  value: any;
}

/**
 * Bulk Import Result Interface
 */
interface BulkImportResult {
  success: boolean;
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: ImportError[];
}

/**
 * Book Import Row Interface
 */
interface BookImportRow {
  title?: string;
  author?: string;
  isbn?: string;
  price?: string | number;
  originalPrice?: string | number;
  stock?: string | number;
  categoryId?: string | number;
  description?: string;
  coverImage?: string;
  publisher?: string;
  pages?: string | number;
  language?: string;
  publishedDate?: string;
}


/**
 * Validate a single book row
 * Requirement: 5.2 - validate data format before processing
 */
const validateBookRow = (row: BookImportRow, rowIndex: number): ImportError[] => {
  const errors: ImportError[] = [];

  if (!row.title || String(row.title).trim().length === 0) {
    errors.push({ row: rowIndex, field: 'title', message: 'Title is required', value: row.title });
  }

  if (!row.author || String(row.author).trim().length === 0) {
    errors.push({ row: rowIndex, field: 'author', message: 'Author is required', value: row.author });
  }

  const price = parseFloat(String(row.price));
  if (isNaN(price) || price < 0) {
    errors.push({ row: rowIndex, field: 'price', message: 'Price must be a positive number', value: row.price });
  }

  const categoryId = parseInt(String(row.categoryId));
  if (isNaN(categoryId) || categoryId <= 0) {
    errors.push({ row: rowIndex, field: 'categoryId', message: 'Category ID must be a positive integer', value: row.categoryId });
  }

  if (row.stock !== undefined && row.stock !== '') {
    const stock = parseInt(String(row.stock));
    if (isNaN(stock) || stock < 0) {
      errors.push({ row: rowIndex, field: 'stock', message: 'Stock must be a non-negative integer', value: row.stock });
    }
  }

  if (row.pages !== undefined && row.pages !== '') {
    const pages = parseInt(String(row.pages));
    if (isNaN(pages) || pages <= 0) {
      errors.push({ row: rowIndex, field: 'pages', message: 'Pages must be a positive integer', value: row.pages });
    }
  }

  return errors;
};

/**
 * Parse CSV file content - Requirement: 5.1
 */
const parseCSV = (content: string): BookImportRow[] => {
  const headerMap: Record<string, string> = {
    'title': 'title', 'tên sách': 'title',
    'author': 'author', 'tác giả': 'author',
    'isbn': 'isbn',
    'price': 'price', 'giá': 'price',
    'original_price': 'originalPrice', 'originalprice': 'originalPrice', 'giá gốc': 'originalPrice',
    'stock': 'stock', 'stock_quantity': 'stock', 'tồn kho': 'stock',
    'category_id': 'categoryId', 'categoryid': 'categoryId', 'danh mục': 'categoryId',
    'description': 'description', 'mô tả': 'description',
    'cover_image': 'coverImage', 'coverimage': 'coverImage', 'ảnh bìa': 'coverImage',
    'publisher': 'publisher', 'nhà xuất bản': 'publisher',
    'pages': 'pages', 'số trang': 'pages',
    'language': 'language', 'ngôn ngữ': 'language',
    'published_date': 'publishedDate', 'publisheddate': 'publishedDate', 'ngày xuất bản': 'publishedDate'
  };

  const result = Papa.parse<BookImportRow>(content, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header: string) => headerMap[header.toLowerCase().trim()] || header.toLowerCase().replace(/\s+/g, '')
  });

  return result.data;
};

/**
 * Parse Excel file content - Requirement: 5.1
 */
const parseExcel = (buffer: Buffer): BookImportRow[] => {
  const headerMap: Record<string, keyof BookImportRow> = {
    'title': 'title', 'tên sách': 'title',
    'author': 'author', 'tác giả': 'author',
    'isbn': 'isbn',
    'price': 'price', 'giá': 'price',
    'original_price': 'originalPrice', 'originalprice': 'originalPrice', 'giá gốc': 'originalPrice',
    'stock': 'stock', 'stock_quantity': 'stock', 'tồn kho': 'stock',
    'category_id': 'categoryId', 'categoryid': 'categoryId', 'danh mục': 'categoryId',
    'description': 'description', 'mô tả': 'description',
    'cover_image': 'coverImage', 'coverimage': 'coverImage', 'ảnh bìa': 'coverImage',
    'publisher': 'publisher', 'nhà xuất bản': 'publisher',
    'pages': 'pages', 'số trang': 'pages',
    'language': 'language', 'ngôn ngữ': 'language',
    'published_date': 'publishedDate', 'publisheddate': 'publishedDate', 'ngày xuất bản': 'publishedDate'
  };

  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

  return jsonData.map(row => {
    const normalizedRow: BookImportRow = {};
    Object.keys(row).forEach(key => {
      const normalizedKey = headerMap[key.toLowerCase().trim()] || key.toLowerCase().replace(/\s+/g, '') as keyof BookImportRow;
      (normalizedRow as any)[normalizedKey] = row[key];
    });
    return normalizedRow;
  });
};


/**
 * Bulk import books from CSV or Excel file
 * POST /admin/books/bulk-import
 * Requirements: 5.1, 5.2, 5.3
 */
export const bulkImportBooks = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_FILE_FORMAT', message: 'No file uploaded. Please upload a CSV or Excel file.' }
      });
      return;
    }

    const file = req.file;
    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();

    if (!['csv', 'xlsx', 'xls'].includes(fileExtension || '')) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_FILE_FORMAT', message: 'Invalid file format. Please upload a CSV or Excel file (.csv, .xlsx, .xls)' }
      });
      return;
    }

    let rows: BookImportRow[];
    if (fileExtension === 'csv') {
      rows = parseCSV(file.buffer.toString('utf-8'));
    } else {
      rows = parseExcel(file.buffer);
    }

    if (rows.length === 0) {
      res.status(400).json({
        success: false,
        error: { code: 'IMPORT_VALIDATION_FAILED', message: 'File is empty or has no valid data rows' }
      });
      return;
    }

    // Validate all rows (Requirement 5.2)
    const allErrors: ImportError[] = [];
    rows.forEach((row, index) => {
      allErrors.push(...validateBookRow(row, index + 2));
    });

    if (allErrors.length > 0) {
      res.status(400).json({
        success: false,
        data: { success: false, totalRows: rows.length, successCount: 0, errorCount: allErrors.length, errors: allErrors },
        error: { code: 'IMPORT_VALIDATION_FAILED', message: `Validation failed for ${allErrors.length} field(s). Please fix the errors and try again.` }
      });
      return;
    }

    // Verify category IDs exist
    const categoryIds = [...new Set(rows.map(r => parseInt(String(r.categoryId))))];
    const categoryCheck = await query('SELECT category_id FROM categories WHERE category_id = ANY($1)', [categoryIds]);
    const validCategoryIds = new Set(categoryCheck.rows.map(r => r.category_id));
    const invalidCategories = categoryIds.filter(id => !validCategoryIds.has(id));

    if (invalidCategories.length > 0) {
      const categoryErrors: ImportError[] = [];
      rows.forEach((row, index) => {
        const catId = parseInt(String(row.categoryId));
        if (!validCategoryIds.has(catId)) {
          categoryErrors.push({ row: index + 2, field: 'categoryId', message: `Category ID ${catId} does not exist`, value: row.categoryId });
        }
      });
      res.status(400).json({
        success: false,
        data: { success: false, totalRows: rows.length, successCount: 0, errorCount: categoryErrors.length, errors: categoryErrors },
        error: { code: 'IMPORT_VALIDATION_FAILED', message: `Invalid category IDs found: ${invalidCategories.join(', ')}` }
      });
      return;
    }

    // Insert books
    let successCount = 0;
    const insertErrors: ImportError[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        const price = parseFloat(String(row.price));
        const originalPrice = row.originalPrice ? parseFloat(String(row.originalPrice)) : price;
        const stock = row.stock ? parseInt(String(row.stock)) : 0;
        const pages = row.pages ? parseInt(String(row.pages)) : null;

        await query(`
          INSERT INTO books (title, author, isbn, price, original_price, stock_quantity, category_id, description, cover_image, published_date, publisher, pages, language)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        `, [
          String(row.title).trim(), String(row.author).trim(), row.isbn || null, price, originalPrice, stock,
          parseInt(String(row.categoryId)), row.description || null, row.coverImage || null, row.publishedDate || null,
          row.publisher || null, pages, row.language || 'Tiếng Việt'
        ]);
        successCount++;
      } catch (error: any) {
        insertErrors.push({ row: i + 2, field: 'database', message: error.message || 'Database insert failed', value: row.title });
      }
    }

    const result: BulkImportResult = { success: insertErrors.length === 0, totalRows: rows.length, successCount, errorCount: insertErrors.length, errors: insertErrors };
    logger.info(`Bulk import completed: ${successCount}/${rows.length} books imported`);
    res.json({ success: true, data: result });
  } catch (error: any) {
    logger.error('Error in bulk import:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to process bulk import' } });
  }
};


/**
 * Export books to CSV or Excel format
 * GET /admin/books/export
 * Requirement: 5.4
 */
export const exportBooks = async (req: Request, res: Response): Promise<void> => {
  try {
    const format = (req.query.format as string)?.toLowerCase() || 'csv';
    const ids = req.query.ids ? String(req.query.ids).split(',').map(Number) : null;

    if (!['csv', 'xlsx'].includes(format)) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_FILE_FORMAT', message: 'Invalid export format. Supported formats: csv, xlsx' }
      });
      return;
    }

    let sql = `
      SELECT b.book_id as id, b.title, b.author, b.isbn, b.price, b.original_price as "originalPrice",
        b.stock_quantity as stock, b.category_id as "categoryId", c.name as "categoryName",
        b.description, b.cover_image as "coverImage", b.publisher, b.pages, b.language,
        b.published_date as "publishedDate", b.created_at as "createdAt", b.updated_at as "updatedAt"
      FROM books b LEFT JOIN categories c ON b.category_id = c.category_id
    `;

    const params: any[] = [];
    if (ids && ids.length > 0) {
      sql += ' WHERE b.book_id = ANY($1)';
      params.push(ids);
    }
    sql += ' ORDER BY b.book_id';

    const result = await query(sql, params);
    const books = result.rows;

    if (books.length === 0) {
      res.status(404).json({ success: false, error: { code: 'NO_DATA', message: 'No books found to export' } });
      return;
    }

    const exportData = books.map(book => ({
      'ID': book.id,
      'Tên sách': book.title,
      'Tác giả': book.author,
      'ISBN': book.isbn || '',
      'Giá': book.price,
      'Giá gốc': book.originalPrice || book.price,
      'Tồn kho': book.stock,
      'Danh mục ID': book.categoryId,
      'Danh mục': book.categoryName || '',
      'Mô tả': book.description || '',
      'Ảnh bìa': book.coverImage || '',
      'Nhà xuất bản': book.publisher || '',
      'Số trang': book.pages || '',
      'Ngôn ngữ': book.language || '',
      'Ngày xuất bản': book.publishedDate || '',
      'Ngày tạo': book.createdAt,
      'Ngày cập nhật': book.updatedAt
    }));

    if (format === 'csv') {
      const csv = Papa.unparse(exportData);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=books_export_${Date.now()}.csv`);
      res.send('\ufeff' + csv);
    } else {
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Books');
      worksheet['!cols'] = [
        { wch: 8 }, { wch: 40 }, { wch: 25 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 10 },
        { wch: 12 }, { wch: 20 }, { wch: 50 }, { wch: 50 }, { wch: 25 }, { wch: 10 }, { wch: 15 },
        { wch: 15 }, { wch: 20 }, { wch: 20 }
      ];
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=books_export_${Date.now()}.xlsx`);
      res.send(buffer);
    }

    logger.info(`Books exported: ${books.length} books in ${format} format`);
  } catch (error: any) {
    logger.error('Error in export:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to export books' } });
  }
};

export default { bulkImportBooks, exportBooks };
