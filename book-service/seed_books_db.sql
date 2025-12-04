-- Seed data for books_db (without CREATE DATABASE or \c)

-- Insert categories if not exist
INSERT INTO categories (name, description, parent_id) VALUES
('Văn học', 'Sách văn học trong và ngoài nước', NULL),
('Văn học Việt Nam', 'Tác phẩm văn học Việt Nam', 1),
('Văn học nước ngoài', 'Tác phẩm văn học dịch', 1),
('Kinh tế', 'Sách về kinh tế, tài chính, đầu tư', NULL),
('Kỹ năng sống', 'Sách phát triển bản thân', NULL),
('Khoa học', 'Sách khoa học phổ thông', NULL),
('Tâm lý', 'Sách tâm lý học', NULL),
('Triết học', 'Sách triết học', NULL)
ON CONFLICT (name) DO NOTHING;

-- Add sales_count column if not exists
ALTER TABLE books ADD COLUMN IF NOT EXISTS sales_count INTEGER DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_books_sales ON books(sales_count DESC);

-- Insert 10 Vietnamese books with cover images
INSERT INTO books (
    title, author, isbn, price, discount_price, stock_quantity, category_id, 
    description, cover_image_url, publisher, published_date, language, page_count, sales_count
) VALUES
('Tôi Thấy Hoa Vàng Trên Cỏ Xanh', 'Nguyễn Nhật Ánh', '9786041040373', 95000, 85000, 150,
 (SELECT category_id FROM categories WHERE name = 'Văn học Việt Nam' LIMIT 1),
 'Truyện kể về tuổi thơ dữ dội và tươi đẹp của hai anh em Thiều và Tường ở một vùng quê Việt Nam.',
 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
 'Nhã Nam', '2010-12-01', 'Tiếng Việt', 368, 5240),

('Mắt Biếc', 'Nguyễn Nhật Ánh', '9786041027343', 99000, 89000, 120,
 (SELECT category_id FROM categories WHERE name = 'Văn học Việt Nam' LIMIT 1),
 'Câu chuyện tình đầu trong sáng và đẹp đẽ của Ngạn dành cho Hà Lan.',
 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
 'Nhã Nam', '2014-09-01', 'Tiếng Việt', 256, 4850),

('Kafka Bên Bờ Biển', 'Haruki Murakami', '9786041098596', 149000, 139000, 80,
 (SELECT category_id FROM categories WHERE name = 'Văn học nước ngoài' LIMIT 1),
 'Kiệt tác văn học Nhật Bản về hành trình tìm kiếm chính mình của một cậu thiếu niên.',
 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400',
 'Nhã Nam', '2015-06-01', 'Tiếng Việt', 624, 3920),

('Nhà Giả Kim', 'Paulo Coelho', '9786041040311', 89000, 79000, 200,
 (SELECT category_id FROM categories WHERE name = 'Văn học nước ngoài' LIMIT 1),
 'Câu chuyện ngụ ngôn về hành trình theo đuổi ước mơ và tìm kiếm kho báu của mình.',
 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400',
 'Nhã Nam', '2013-05-01', 'Tiếng Việt', 224, 6780),

('Sapiens: Lược Sử Loài Người', 'Yuval Noah Harari', '9786041067103', 199000, 179000, 100,
 (SELECT category_id FROM categories WHERE name = 'Khoa học' LIMIT 1),
 'Cuốn sách về lịch sử tiến hóa của loài người từ thời tiền sử đến hiện đại.',
 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=400',
 'Nhã Nam', '2018-03-01', 'Tiếng Việt', 536, 4320),

('Homo Deus: Lược Sử Tương Lai', 'Yuval Noah Harari', '9786041092167', 219000, 199000, 75,
 (SELECT category_id FROM categories WHERE name = 'Khoa học' LIMIT 1),
 'Tác phẩm về tương lai của nhân loại trong thời đại công nghệ và trí tuệ nhân tạo.',
 'https://images.unsplash.com/photo-1491841573634-28140fc7ced7?w=400',
 'Nhã Nam', '2019-01-01', 'Tiếng Việt', 548, 3150),

('Đắc Nhân Tâm', 'Dale Carnegie', '9786041040274', 86000, 75000, 300,
 (SELECT category_id FROM categories WHERE name = 'Kỹ năng sống' LIMIT 1),
 'Cuốn sách kinh điển về nghệ thuật giao tiếp và ứng xử để thành công trong cuộc sống.',
 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=400',
 'Nhã Nam', '2012-01-01', 'Tiếng Việt', 320, 8920),

('Tư Duy Nhanh Và Chậm', 'Daniel Kahneman', '9786041096097', 169000, 149000, 90,
 (SELECT category_id FROM categories WHERE name = 'Tâm lý' LIMIT 1),
 'Khám phá hai hệ thống tư duy của con người và cách chúng ảnh hưởng đến quyết định.',
 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
 'Nhã Nam', '2019-08-01', 'Tiếng Việt', 640, 2840),

('1Q84 - Tập 1', 'Haruki Murakami', '9786041040779', 149000, 139000, 65,
 (SELECT category_id FROM categories WHERE name = 'Văn học nước ngoài' LIMIT 1),
 'Tiểu thuyết kỳ ảo về hai nhân vật sống trong hai thế giới song song năm 1984.',
 'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=400',
 'Nhã Nam', '2016-03-01', 'Tiếng Việt', 488, 2560),

('Nghệ Thuật Sống Đẹp', 'Arthur Schopenhauer', '9786041095458', 79000, 69000, 110,
 (SELECT category_id FROM categories WHERE name = 'Triết học' LIMIT 1),
 'Những triết lý sống giúp con người tìm thấy hạnh phúc trong cuộc sống.',
 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
 'Nhã Nam', '2018-11-01', 'Tiếng Việt', 256, 1980)
ON CONFLICT (isbn) DO NOTHING;

-- Verification
SELECT 'Total books:' as info, COUNT(*) as count FROM books;
SELECT book_id, title, author, sales_count, cover_image_url FROM books WHERE book_id > 10 ORDER BY sales_count DESC LIMIT 10;
