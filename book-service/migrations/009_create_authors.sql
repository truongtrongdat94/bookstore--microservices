-- Authors Feature Migration - Create Tables
-- This migration creates the authors table and book_authors junction table
-- for implementing a normalized many-to-many relationship between books and authors

-- Create authors table
CREATE TABLE IF NOT EXISTS authors (
    author_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    nationality VARCHAR(100),
    birth_year INTEGER,
    death_year INTEGER,  -- NULL if author is still living
    bio TEXT,
    quote TEXT,
    image_url VARCHAR(500),
    website VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create book_authors junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS book_authors (
    book_id INTEGER REFERENCES books(book_id) ON DELETE CASCADE,
    author_id INTEGER REFERENCES authors(author_id) ON DELETE CASCADE,
    author_order INTEGER DEFAULT 1,  -- Order of author for co-authored books (1 = primary author)
    PRIMARY KEY (book_id, author_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_authors_name ON authors(name);
CREATE INDEX IF NOT EXISTS idx_book_authors_book_id ON book_authors(book_id);
CREATE INDEX IF NOT EXISTS idx_book_authors_author_id ON book_authors(author_id);

-- Add comment to tables
COMMENT ON TABLE authors IS 'Stores author information including biographical data';
COMMENT ON TABLE book_authors IS 'Junction table for many-to-many relationship between books and authors';
COMMENT ON COLUMN book_authors.author_order IS 'Order of author for co-authored books, 1 = primary author';
