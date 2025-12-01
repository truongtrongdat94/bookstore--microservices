-- Migration: Create blog_categories table
-- Description: Creates the blog categories table with Vietnamese category support
-- Date: 2025-11-19
-- Database: PostgreSQL

CREATE TABLE IF NOT EXISTS blog_categories (
  category_id SERIAL PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_blog_categories_slug ON blog_categories(slug);
CREATE INDEX IF NOT EXISTS idx_blog_categories_display_order ON blog_categories(display_order);

-- Trigger function for updated_at auto-update
CREATE OR REPLACE FUNCTION update_blog_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER blog_categories_updated_at
BEFORE UPDATE ON blog_categories
FOR EACH ROW
EXECUTE FUNCTION update_blog_categories_updated_at();
