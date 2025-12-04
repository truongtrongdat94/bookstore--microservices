-- ====================================
-- SETUP BOOKSTORE DATABASE WITH SAMPLE DATA
-- ====================================

-- Create database (run this separately if needed)
-- CREATE DATABASE bookstore_books;

-- Connect to database
\c bookstore_books;

-- ====================================
-- 1. CREATE CATEGORIES TABLE
-- ====================================
CREATE TABLE IF NOT EXISTS categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    parent_id INTEGER REFERENCES categories(category_id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert sample categories
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

-- ====================================
-- 2. CREATE BOOKS TABLE
-- ====================================
CREATE TABLE IF NOT EXISTS books (
    book_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(17) UNIQUE,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    discount_price DECIMAL(10,2) CHECK (discount_price >= 0 AND discount_price < price),
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    category_id INTEGER NOT NULL REFERENCES categories(category_id),
    description TEXT,
    cover_image_url VARCHAR(500),
    publisher VARCHAR(255),
    publication_date DATE,
    language VARCHAR(50) DEFAULT 'Tiếng Việt',
    page_count INTEGER,
    sales_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category_id);
CREATE INDEX IF NOT EXISTS idx_books_price ON books(price);
CREATE INDEX IF NOT EXISTS idx_books_created_at ON books(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_books_sales ON books(sales_count DESC);

-- ====================================
-- 3. INSERT 10 SAMPLE BOOKS (Vietnamese Books)
-- ====================================
INSERT INTO books (
    title, author, isbn, price, discount_price, stock_quantity, category_id, 
    description, cover_image_url, publisher, publication_date, language, page_count, sales_count
) VALUES
-- Book 1: Văn học Việt Nam
('Tôi Thấy Hoa Vàng Trên Cỏ Xanh', 'Nguyễn Nhật Ánh', '9786041040373', 95000, 85000, 150,
 (SELECT category_id FROM categories WHERE name = 'Văn học Việt Nam'),
 'Truyện kể về tuổi thơ dữ dội và tươi đẹp của hai anh em Thiều và Tường ở một vùng quê Việt Nam.',
 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
 'Nhã Nam', '2010-12-01', 'Tiếng Việt', 368, 5240),

-- Book 2: Văn học Việt Nam
('Mắt Biếc', 'Nguyễn Nhật Ánh', '9786041027343', 99000, 89000, 120,
 (SELECT category_id FROM categories WHERE name = 'Văn học Việt Nam'),
 'Câu chuyện tình đầu trong sáng và đẹp đẽ của Ngạn dành cho Hà Lan.',
 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
 'Nhã Nam', '2014-09-01', 'Tiếng Việt', 256, 4850),

-- Book 3: Văn học nước ngoài
('Kafka Bên Bờ Biển', 'Haruki Murakami', '9786041098596', 149000, 139000, 80,
 (SELECT category_id FROM categories WHERE name = 'Văn học nước ngoài'),
 'Kiệt tác văn học Nhật Bản về hành trình tìm kiếm chính mình của một cậu thiếu niên.',
 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400',
 'Nhã Nam', '2015-06-01', 'Tiếng Việt', 624, 3920),

-- Book 4: Văn học nước ngoài  
('Nhà Giả Kim', 'Paulo Coelho', '9786041040311', 89000, 79000, 200,
 (SELECT category_id FROM categories WHERE name = 'Văn học nước ngoài'),
 'Câu chuyện ngụ ngôn về hành trình theo đuổi ước mơ và tìm kiếm kho báu của mình.',
 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400',
 'Nhã Nam', '2013-05-01', 'Tiếng Việt', 224, 6780),

-- Book 5: Khoa học
('Sapiens: Lược Sử Loài Người', 'Yuval Noah Harari', '9786041067103', 199000, 179000, 100,
 (SELECT category_id FROM categories WHERE name = 'Khoa học'),
 'Cuốn sách về lịch sử tiến hóa của loài người từ thời tiền sử đến hiện đại.',
 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=400',
 'Nhã Nam', '2018-03-01', 'Tiếng Việt', 536, 4320),

-- Book 6: Khoa học
('Homo Deus: Lược Sử Tương Lai', 'Yuval Noah Harari', '9786041092167', 219000, 199000, 75,
 (SELECT category_id FROM categories WHERE name = 'Khoa học'),
 'Tác phẩm về tương lai của nhân loại trong thời đại công nghệ và trí tuệ nhân tạo.',
 'https://images.unsplash.com/photo-1491841573634-28140fc7ced7?w=400',
 'Nhã Nam', '2019-01-01', 'Tiếng Việt', 548, 3150),

-- Book 7: Tâm lý - Kỹ năng sống
('Đắc Nhân Tâm', 'Dale Carnegie', '9786041040274', 86000, 75000, 300,
 (SELECT category_id FROM categories WHERE name = 'Kỹ năng sống'),
 'Cuốn sách kinh điển về nghệ thuật giao tiếp và ứng xử để thành công trong cuộc sống.',
 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=400',
 'Nhã Nam', '2012-01-01', 'Tiếng Việt', 320, 8920),

-- Book 8: Kinh tế
('Tư Duy Nhanh Và Chậm', 'Daniel Kahneman', '9786041096097', 169000, 149000, 90,
 (SELECT category_id FROM categories WHERE name = 'Tâm lý'),
 'Khám phá hai hệ thống tư duy của con người và cách chúng ảnh hưởng đến quyết định.',
 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
 'Nhã Nam', '2019-08-01', 'Tiếng Việt', 640, 2840),

-- Book 9: Văn học nước ngoài
('1Q84 - Tập 1', 'Haruki Murakami', '9786041040779', 149000, 139000, 65,
 (SELECT category_id FROM categories WHERE name = 'Văn học nước ngoài'),
 'Tiểu thuyết kỳ ảo về hai nhân vật sống trong hai thế giới song song năm 1984.',
 'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=400',
 'Nhã Nam', '2016-03-01', 'Tiếng Việt', 488, 2560),

-- Book 10: Triết học
('Nghệ Thuật Sống Đẹp', 'Arthur Schopenhauer', '9786041095458', 79000, 69000, 110,
 (SELECT category_id FROM categories WHERE name = 'Triết học'),
 'Những triết lý sống giúp con người tìm thấy hạnh phúc trong cuộc sống.',
 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
 'Nhã Nam', '2018-11-01', 'Tiếng Việt', 256, 1980)
ON CONFLICT (isbn) DO NOTHING;

-- ====================================
-- 4. CREATE REVIEWS TABLE
-- ====================================
CREATE TABLE IF NOT EXISTS reviews (
    review_id SERIAL PRIMARY KEY,
    book_id INTEGER NOT NULL REFERENCES books(book_id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_book ON reviews(book_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);

-- ====================================
-- 5. VERIFICATION
-- ====================================
SELECT 'Categories created:' as info, COUNT(*) as count FROM categories;
SELECT 'Books created:' as info, COUNT(*) as count FROM books;
SELECT 'Sample book titles:' as info;
SELECT book_id, title, author, price, sales_count FROM books ORDER BY created_at DESC LIMIT 10;
