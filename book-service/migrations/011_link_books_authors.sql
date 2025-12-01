-- Authors Feature Migration - Link Books to Authors
-- This migration creates relationships between existing books and authors
-- by matching the author name in the books table with the authors table

-- Insert book-author relationships
-- This matches books to authors based on the author name field in the books table
INSERT INTO book_authors (book_id, author_id, author_order)
SELECT 
    b.book_id,
    a.author_id,
    1 as author_order  -- All initial relationships are primary authors
FROM books b
INNER JOIN authors a ON TRIM(b.author) = TRIM(a.name)
ON CONFLICT (book_id, author_id) DO NOTHING;

-- Verify the linking worked
-- This query shows how many books each author has
SELECT 
    a.name,
    a.nationality,
    COUNT(ba.book_id) as book_count
FROM authors a
LEFT JOIN book_authors ba ON a.author_id = ba.author_id
GROUP BY a.author_id, a.name, a.nationality
ORDER BY book_count DESC, a.name;
