-- Migration: Add cover images for books
-- This migration adds placeholder cover images for all books

-- Update Vietnamese books with placeholder images
UPDATE books 
SET cover_image_url = 'https://via.placeholder.com/300x400/1B5E20/FFFFFF?text=' || REPLACE(title, ' ', '+')
WHERE cover_image_url IS NULL;

-- For better visual representation, we can use a book cover placeholder service
-- Update with more realistic placeholder images
UPDATE books 
SET cover_image_url = CONCAT('https://picsum.photos/seed/', book_id, '/300/400')
WHERE cover_image_url LIKE '%placeholder%';

-- Alternative: Use a consistent placeholder for all books
-- UPDATE books 
-- SET cover_image_url = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=400&fit=crop'
-- WHERE cover_image_url IS NULL;
