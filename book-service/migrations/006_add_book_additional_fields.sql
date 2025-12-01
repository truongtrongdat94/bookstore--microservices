-- Migration: Add additional fields to books table
-- API #4: Book Model Additional Fields

-- Add new columns
ALTER TABLE books 
  ADD COLUMN IF NOT EXISTS publisher VARCHAR(255),
  ADD COLUMN IF NOT EXISTS pages INTEGER,
  ADD COLUMN IF NOT EXISTS dimensions VARCHAR(50),
  ADD COLUMN IF NOT EXISTS language VARCHAR(50) DEFAULT 'Tiếng Việt',
  ADD COLUMN IF NOT EXISTS original_price DECIMAL(10,2);

-- Update existing records to set original_price same as price
UPDATE books 
SET original_price = price 
WHERE original_price IS NULL;

-- Add check constraint for original_price
ALTER TABLE books 
ADD CONSTRAINT IF NOT EXISTS check_original_price_positive 
CHECK (original_price > 0);

-- Add check constraint for pages
ALTER TABLE books 
ADD CONSTRAINT IF NOT EXISTS check_pages_positive 
CHECK (pages IS NULL OR pages > 0);

-- Add index for publisher (for filtering)
CREATE INDEX IF NOT EXISTS idx_books_publisher ON books(publisher);

-- Add index for language (for filtering)
CREATE INDEX IF NOT EXISTS idx_books_language ON books(language);

-- Comment
COMMENT ON COLUMN books.publisher IS 'Nhà xuất bản';
COMMENT ON COLUMN books.pages IS 'Số trang';
COMMENT ON COLUMN books.dimensions IS 'Kích thước sách (VD: 20x30cm)';
COMMENT ON COLUMN books.language IS 'Ngôn ngữ';
COMMENT ON COLUMN books.original_price IS 'Giá gốc (để hiển thị giảm giá)';
