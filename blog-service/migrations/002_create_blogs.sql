-- Migration: Create blogs table
-- Description: Creates the main blogs table with all required fields and indexes
-- Date: 2025-11-19
-- Database: PostgreSQL

CREATE TABLE IF NOT EXISTS blogs (
  blog_id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image VARCHAR(1000),
  category_id INTEGER NOT NULL,
  author VARCHAR(255),
  is_featured BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  search_vector tsvector,
  
  -- Foreign key constraint
  CONSTRAINT fk_blogs_category FOREIGN KEY (category_id) 
    REFERENCES blog_categories(category_id) 
    ON DELETE RESTRICT 
    ON UPDATE CASCADE
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_blogs_category ON blogs(category_id);
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_published ON blogs(published_at);
CREATE INDEX IF NOT EXISTS idx_blogs_featured ON blogs(is_featured);
CREATE INDEX IF NOT EXISTS idx_blogs_category_published ON blogs(category_id, published_at);
CREATE INDEX IF NOT EXISTS idx_blogs_featured_published ON blogs(is_featured, published_at);

-- Full-text search index using GIN
CREATE INDEX IF NOT EXISTS idx_blogs_search ON blogs USING GIN(search_vector);

-- Trigger function for updated_at auto-update
CREATE OR REPLACE FUNCTION update_blogs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER blogs_updated_at
BEFORE UPDATE ON blogs
FOR EACH ROW
EXECUTE FUNCTION update_blogs_updated_at();

-- Trigger function for search_vector auto-update
CREATE OR REPLACE FUNCTION update_blogs_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.excerpt, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for search_vector
CREATE TRIGGER blogs_search_vector
BEFORE INSERT OR UPDATE ON blogs
FOR EACH ROW
EXECUTE FUNCTION update_blogs_search_vector();
