-- ============================================
-- CLEANUP SCRIPT - DỌN DẸP DATABASE
-- ============================================
-- Mục đích:
-- 1. Xóa database thừa (bookstore_books)
-- 2. Xóa columns duplicate
-- 3. Update 10 books cũ có cover images
-- ============================================

-- STEP 1: Xóa database thừa
DROP DATABASE IF EXISTS bookstore_books;

-- STEP 2: Kết nối vào database chính
\c books_db;

-- STEP 3: Xóa columns duplicate (GIỮ columns mới)
ALTER TABLE books DROP COLUMN IF EXISTS cover_image;
ALTER TABLE books DROP COLUMN IF EXISTS publication_date;

-- STEP 4: Update 10 sách cũ có cover images + sales_count
UPDATE books SET 
  cover_image_url = CASE book_id
    WHEN 1 THEN 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400'
    WHEN 2 THEN 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400'
    WHEN 3 THEN 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400'
    WHEN 4 THEN 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400'
    WHEN 5 THEN 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=400'
    WHEN 6 THEN 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400'
    WHEN 7 THEN 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400'
    WHEN 8 THEN 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400'
    WHEN 9 THEN 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400'
    WHEN 10 THEN 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400'
  END,
  sales_count = FLOOR(RANDOM() * 3000 + 500)::INTEGER,
  discount_price = price * 0.85,
  publisher = CASE 
    WHEN book_id IN (1,3,4,10) THEN 'O''Reilly Media'
    WHEN book_id IN (2,8) THEN 'Packt Publishing'
    WHEN book_id = 5 THEN 'Ace Books'
    WHEN book_id = 6 THEN 'Crown Publishing'
    WHEN book_id = 7 THEN 'Vintage Crime'
    WHEN book_id = 9 THEN 'McGraw-Hill'
  END,
  language = 'English',
  page_count = CASE book_id
    WHEN 1 THEN 464
    WHEN 2 THEN 176
    WHEN 3 THEN 416
    WHEN 4 THEN 352
    WHEN 5 THEN 688
    WHEN 6 THEN 369
    WHEN 7 THEN 672
    WHEN 8 THEN 360
    WHEN 9 THEN 1376
    WHEN 10 THEN 380
  END
WHERE book_id <= 10;

-- STEP 5: Verification
SELECT '=== DATABASE CLEANUP COMPLETE ===' as status;
SELECT 'Total databases in container:' as info, COUNT(*) as count 
FROM pg_database WHERE datname LIKE '%book%';

SELECT 'Total books:' as info, COUNT(*) as count FROM books;
SELECT 'Books with covers:' as info, COUNT(*) as count FROM books WHERE cover_image_url IS NOT NULL;
SELECT 'Books with sales:' as info, COUNT(*) as count FROM books WHERE sales_count > 0;

-- Show sample books
SELECT book_id, title, author, sales_count, 
       cover_image_url IS NOT NULL as has_cover,
       discount_price IS NOT NULL as has_discount
FROM books 
ORDER BY sales_count DESC 
LIMIT 10;
