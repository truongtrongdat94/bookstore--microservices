-- Migration: Add sales_count column for bestsellers feature
-- This column tracks the number of sales for each book

-- Add sales_count column if not exists
ALTER TABLE books ADD COLUMN IF NOT EXISTS sales_count INTEGER DEFAULT 0;

-- Create index for bestsellers sorting
CREATE INDEX IF NOT EXISTS idx_books_sales ON books(sales_count DESC);

-- Populate sales_count with random values for existing books (for demo purposes)
UPDATE books SET sales_count = FLOOR(RANDOM() * 3000 + 100)::INTEGER 
WHERE sales_count = 0 OR sales_count IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN books.sales_count IS 'Number of times this book has been sold, used for bestseller ranking';
