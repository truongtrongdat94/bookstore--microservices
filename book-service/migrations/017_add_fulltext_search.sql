-- Migration: Add PostgreSQL Full-Text Search support for books
-- Feature: Advanced Book Search
-- Requirements: 5.1, 5.2

-- ============================================
-- 1. Enable required PostgreSQL extensions
-- ============================================
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================
-- 2. Add search_vector column to books table
-- ============================================
ALTER TABLE books ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- ============================================
-- 3. Create GIN index for fast full-text search
-- ============================================
DROP INDEX IF EXISTS idx_books_fts;
CREATE INDEX idx_books_fts ON books USING GIN(search_vector);

-- Create trigram index for fuzzy matching (autocomplete)
CREATE INDEX IF NOT EXISTS idx_books_title_trgm ON books USING GIN(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_books_author_trgm ON books USING GIN(author gin_trgm_ops);

-- ============================================
-- 4. Create trigger function to auto-update search_vector
-- ============================================
CREATE OR REPLACE FUNCTION update_book_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('simple', unaccent(COALESCE(NEW.title, ''))), 'A') ||
    setweight(to_tsvector('simple', unaccent(COALESCE(NEW.author, ''))), 'B') ||
    setweight(to_tsvector('simple', unaccent(COALESCE(NEW.publisher, ''))), 'C') ||
    setweight(to_tsvector('simple', unaccent(COALESCE(NEW.description, ''))), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. Create trigger to auto-update on INSERT/UPDATE
-- ============================================
DROP TRIGGER IF EXISTS trg_books_search_vector ON books;
CREATE TRIGGER trg_books_search_vector
  BEFORE INSERT OR UPDATE OF title, author, publisher, description
  ON books
  FOR EACH ROW
  EXECUTE FUNCTION update_book_search_vector();

-- ============================================
-- 6. Populate search_vector for existing books
-- ============================================
UPDATE books SET search_vector = 
  setweight(to_tsvector('simple', unaccent(COALESCE(title, ''))), 'A') ||
  setweight(to_tsvector('simple', unaccent(COALESCE(author, ''))), 'B') ||
  setweight(to_tsvector('simple', unaccent(COALESCE(publisher, ''))), 'C') ||
  setweight(to_tsvector('simple', unaccent(COALESCE(description, ''))), 'D');

-- ============================================
-- 7. Add comment for documentation
-- ============================================
COMMENT ON COLUMN books.search_vector IS 'Pre-computed tsvector for full-text search with weighted fields: A=title, B=author, C=publisher, D=description';
COMMENT ON FUNCTION update_book_search_vector() IS 'Trigger function to automatically update search_vector when book fields change';
