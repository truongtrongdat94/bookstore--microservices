-- Migration: Add cover images for all books
-- Uses a combination of Open Library covers (for books with ISBN) and placeholder images

-- Update books with real ISBN to use Open Library covers
UPDATE books 
SET cover_image = 'https://covers.openlibrary.org/b/isbn/' || REPLACE(REPLACE(isbn, '-', ''), ' ', '') || '-L.jpg'
WHERE isbn IS NOT NULL 
  AND isbn != ''
  AND (cover_image IS NULL OR cover_image = '');

-- For books without valid Open Library covers, use picsum placeholder
-- Vietnamese books and others that may not have Open Library covers
UPDATE books 
SET cover_image = 'https://picsum.photos/seed/book' || book_id || '/300/450'
WHERE cover_image IS NULL OR cover_image = '';

-- Specific cover images for popular Vietnamese books (using high-quality placeholders)
UPDATE books SET cover_image = 'https://picsum.photos/seed/matbiec/300/450' WHERE title = 'Mắt Biếc';
UPDATE books SET cover_image = 'https://picsum.photos/seed/demen/300/450' WHERE title = 'Dế Mèn Phiêu Lưu Ký';
UPDATE books SET cover_image = 'https://picsum.photos/seed/kieu/300/450' WHERE title = 'Truyện Kiều';
UPDATE books SET cover_image = 'https://picsum.photos/seed/dacnhantam/300/450' WHERE title = 'Đắc Nhân Tâm';
UPDATE books SET cover_image = 'https://picsum.photos/seed/sapiens/300/450' WHERE title LIKE 'Sapiens%';
UPDATE books SET cover_image = 'https://picsum.photos/seed/atomichabits/300/450' WHERE title = 'Atomic Habits';

-- International bestsellers with better placeholder seeds
UPDATE books SET cover_image = 'https://picsum.photos/seed/harrypotter/300/450' WHERE title LIKE 'Harry Potter%';
UPDATE books SET cover_image = 'https://picsum.photos/seed/dune/300/450' WHERE title = 'Dune';
UPDATE books SET cover_image = 'https://picsum.photos/seed/lotr/300/450' WHERE title LIKE '%Lord of the Rings%';
UPDATE books SET cover_image = 'https://picsum.photos/seed/alchemist/300/450' WHERE title = 'The Alchemist';
UPDATE books SET cover_image = 'https://picsum.photos/seed/norwegianwood/300/450' WHERE title = 'Norwegian Wood';
UPDATE books SET cover_image = 'https://picsum.photos/seed/threebody/300/450' WHERE title LIKE '%Three-Body%';

-- Verify results
SELECT book_id, title, cover_image FROM books ORDER BY book_id LIMIT 10;
