-- Vietnamese Categories Migration
-- This migration adds Vietnamese book categories and sample books

-- Delete existing categories to start fresh
TRUNCATE TABLE categories CASCADE;

-- Insert main categories (Hư cấu, Phi hư cấu, Thiếu nhi)
INSERT INTO categories (name, parent_id, description) VALUES
('Hư cấu', NULL, 'Sách văn học hư cấu'),
('Phi hư cấu', NULL, 'Sách phi hư cấu'),
('Thiếu nhi', NULL, 'Sách dành cho thiếu nhi')
ON CONFLICT (name) DO NOTHING;

-- Insert Hư cấu subcategories
INSERT INTO categories (name, parent_id, description)
SELECT 'Văn học hiện đại', category_id, 'Văn học hiện đại' FROM categories WHERE name = 'Hư cấu'
UNION ALL
SELECT 'Văn học kinh điển', category_id, 'Văn học kinh điển' FROM categories WHERE name = 'Hư cấu'
UNION ALL
SELECT 'Văn học thiếu nhi', category_id, 'Văn học thiếu nhi' FROM categories WHERE name = 'Hư cấu'
UNION ALL
SELECT 'Lãng mạn', category_id, 'Tiểu thuyết lãng mạn' FROM categories WHERE name = 'Hư cấu'
UNION ALL
SELECT 'Kỳ ảo', category_id, 'Tiểu thuyết kỳ ảo' FROM categories WHERE name = 'Hư cấu'
UNION ALL
SELECT 'Trinh thám – Kinh dị', category_id, 'Trinh thám và kinh dị' FROM categories WHERE name = 'Hư cấu'
UNION ALL
SELECT 'Khoa học viễn tưởng', category_id, 'Khoa học viễn tưởng' FROM categories WHERE name = 'Hư cấu'
UNION ALL
SELECT 'Phiêu lưu ly kỳ', category_id, 'Phiêu lưu ly kỳ' FROM categories WHERE name = 'Hư cấu'
UNION ALL
SELECT 'Tản văn', category_id, 'Tản văn' FROM categories WHERE name = 'Hư cấu'
UNION ALL
SELECT 'Truyện tranh', category_id, 'Graphic novel' FROM categories WHERE name = 'Hư cấu'
UNION ALL
SELECT 'Sách tranh', category_id, 'Picture book' FROM categories WHERE name = 'Hư cấu'
UNION ALL
SELECT 'Thơ – kịch', category_id, 'Thơ và kịch' FROM categories WHERE name = 'Hư cấu'
UNION ALL
SELECT 'Light novel', category_id, 'Light novel' FROM categories WHERE name = 'Hư cấu'
UNION ALL
SELECT 'Sách tô màu', category_id, 'Sách tô màu' FROM categories WHERE name = 'Hư cấu'
ON CONFLICT (name) DO NOTHING;

-- Insert Phi hư cấu subcategories
INSERT INTO categories (name, parent_id, description)
SELECT 'Triết học', category_id, 'Triết học' FROM categories WHERE name = 'Phi hư cấu'
UNION ALL
SELECT 'Sử học', category_id, 'Sử học' FROM categories WHERE name = 'Phi hư cấu'
UNION ALL
SELECT 'Khoa học', category_id, 'Khoa học' FROM categories WHERE name = 'Phi hư cấu'
UNION ALL
SELECT 'Kinh doanh', category_id, 'Kinh doanh' FROM categories WHERE name = 'Phi hư cấu'
UNION ALL
SELECT 'Kinh tế chính trị', category_id, 'Kinh tế chính trị' FROM categories WHERE name = 'Phi hư cấu'
UNION ALL
SELECT 'Kỹ năng', category_id, 'Kỹ năng sống' FROM categories WHERE name = 'Phi hư cấu'
UNION ALL
SELECT 'Nghệ thuật', category_id, 'Nghệ thuật' FROM categories WHERE name = 'Phi hư cấu'
UNION ALL
SELECT 'Nuôi dạy con', category_id, 'Nuôi dạy con' FROM categories WHERE name = 'Phi hư cấu'
UNION ALL
SELECT 'Tiểu luận – phê bình', category_id, 'Tiểu luận và phê bình' FROM categories WHERE name = 'Phi hư cấu'
UNION ALL
SELECT 'Tâm lý ứng dụng', category_id, 'Tâm lý ứng dụng' FROM categories WHERE name = 'Phi hư cấu'
UNION ALL
SELECT 'Tâm lý học', category_id, 'Tâm lý học' FROM categories WHERE name = 'Phi hư cấu'
UNION ALL
SELECT 'Hồi ký', category_id, 'Hồi ký' FROM categories WHERE name = 'Phi hư cấu'
UNION ALL
SELECT 'Y học – Sức khỏe', category_id, 'Y học và sức khỏe' FROM categories WHERE name = 'Phi hư cấu'
UNION ALL
SELECT 'Tâm linh – Tôn giáo', category_id, 'Tâm linh và tôn giáo' FROM categories WHERE name = 'Phi hư cấu'
ON CONFLICT (name) DO NOTHING;

-- Insert Thiếu nhi subcategories
INSERT INTO categories (name, parent_id, description)
SELECT '0–5 tuổi', category_id, 'Sách cho trẻ 0-5 tuổi' FROM categories WHERE name = 'Thiếu nhi'
UNION ALL
SELECT '6–8 tuổi', category_id, 'Sách cho trẻ 6-8 tuổi' FROM categories WHERE name = 'Thiếu nhi'
UNION ALL
SELECT '9–12 tuổi', category_id, 'Sách cho trẻ 9-12 tuổi' FROM categories WHERE name = 'Thiếu nhi'
UNION ALL
SELECT '13–15 tuổi', category_id, 'Sách cho trẻ 13-15 tuổi' FROM categories WHERE name = 'Thiếu nhi'
ON CONFLICT (name) DO NOTHING;

-- Insert sample books for each category
-- Văn học hiện đại
INSERT INTO books (title, author, isbn, price, stock_quantity, category_id, description, published_date) VALUES
('Mắt Biếc', 'Nguyễn Nhật Ánh', '9786041027343', 99000, 120,
 (SELECT category_id FROM categories WHERE name = 'Văn học hiện đại' LIMIT 1),
 'Câu chuyện tình đầu trong sáng và đẹp đẽ', '2014-09-01')
ON CONFLICT (isbn) DO NOTHING;

-- Văn học kinh điển
INSERT INTO books (title, author, isbn, price, stock_quantity, category_id, description, published_date) VALUES
('Chiến Tranh Và Hòa Bình', 'Leo Tolstoy', '9786041040401', 299000, 50,
 (SELECT category_id FROM categories WHERE name = 'Văn học kinh điển' LIMIT 1),
 'Kiệt tác văn học Nga về chiến tranh và hòa bình', '1869-01-01')
ON CONFLICT (isbn) DO NOTHING;

-- Văn học thiếu nhi
INSERT INTO books (title, author, isbn, price, stock_quantity, category_id, description, published_date) VALUES
('Dế Mèn Phiêu Lưu Ký', 'Tô Hoài', '9786041040402', 79000, 150,
 (SELECT category_id FROM categories WHERE name = 'Văn học thiếu nhi' LIMIT 1),
 'Câu chuyện phiêu lưu của chú dế mèn', '1941-01-01')
ON CONFLICT (isbn) DO NOTHING;

-- Lãng mạn
INSERT INTO books (title, author, isbn, price, stock_quantity, category_id, description, published_date) VALUES
('Kiêu Hãnh Và Định Kiến', 'Jane Austen', '9786041040403', 129000, 80,
 (SELECT category_id FROM categories WHERE name = 'Lãng mạn' LIMIT 1),
 'Tiểu thuyết lãng mạn kinh điển', '1813-01-28')
ON CONFLICT (isbn) DO NOTHING;

-- Kỳ ảo
INSERT INTO books (title, author, isbn, price, stock_quantity, category_id, description, published_date) VALUES
('Harry Potter Và Hòn Đá Phù Thủy', 'J.K. Rowling', '9786041040404', 149000, 200,
 (SELECT category_id FROM categories WHERE name = 'Kỳ ảo' LIMIT 1),
 'Phần đầu tiên của series Harry Potter', '1997-06-26')
ON CONFLICT (isbn) DO NOTHING;

-- Trinh thám – Kinh dị
INSERT INTO books (title, author, isbn, price, stock_quantity, category_id, description, published_date) VALUES
('Sherlock Holmes', 'Arthur Conan Doyle', '9786041040405', 119000, 90,
 (SELECT category_id FROM categories WHERE name = 'Trinh thám – Kinh dị' LIMIT 1),
 'Tuyển tập truyện trinh thám Sherlock Holmes', '1892-10-14')
ON CONFLICT (isbn) DO NOTHING;

-- Khoa học viễn tưởng
INSERT INTO books (title, author, isbn, price, stock_quantity, category_id, description, published_date) VALUES
('Dune', 'Frank Herbert', '9786041040406', 189000, 70,
 (SELECT category_id FROM categories WHERE name = 'Khoa học viễn tưởng' LIMIT 1),
 'Kiệt tác khoa học viễn tưởng về hành tinh sa mạc', '1965-08-01')
ON CONFLICT (isbn) DO NOTHING;

-- Phiêu lưu ly kỳ
INSERT INTO books (title, author, isbn, price, stock_quantity, category_id, description, published_date) VALUES
('Hành Trình Vòng Quanh Thế Giới 80 Ngày', 'Jules Verne', '9786041040407', 99000, 100,
 (SELECT category_id FROM categories WHERE name = 'Phiêu lưu ly kỳ' LIMIT 1),
 'Cuộc phiêu lưu vòng quanh thế giới', '1873-01-30')
ON CONFLICT (isbn) DO NOTHING;

-- Tản văn
INSERT INTO books (title, author, isbn, price, stock_quantity, category_id, description, published_date) VALUES
('Vừa Nhắm Mắt Vừa Mở Mắt Mà Ngủ', 'Nguyễn Ngọc Tư', '9786041040408', 89000, 85,
 (SELECT category_id FROM categories WHERE name = 'Tản văn' LIMIT 1),
 'Tuyển tập tản văn của Nguyễn Ngọc Tư', '2014-01-01')
ON CONFLICT (isbn) DO NOTHING;

-- Truyện tranh
INSERT INTO books (title, author, isbn, price, stock_quantity, category_id, description, published_date) VALUES
('Watchmen', 'Alan Moore', '9786041040409', 199000, 60,
 (SELECT category_id FROM categories WHERE name = 'Truyện tranh' LIMIT 1),
 'Graphic novel kinh điển về siêu anh hùng', '1986-09-01')
ON CONFLICT (isbn) DO NOTHING;

-- Sách tranh
INSERT INTO books (title, author, isbn, price, stock_quantity, category_id, description, published_date) VALUES
('The Very Hungry Caterpillar', 'Eric Carle', '9786041040410', 79000, 120,
 (SELECT category_id FROM categories WHERE name = 'Sách tranh' LIMIT 1),
 'Sách tranh kinh điển cho trẻ em', '1969-06-03')
ON CONFLICT (isbn) DO NOTHING;

-- Thơ – kịch
INSERT INTO books (title, author, isbn, price, stock_quantity, category_id, description, published_date) VALUES
('Truyện Kiều', 'Nguyễn Du', '9786041040411', 69000, 150,
 (SELECT category_id FROM categories WHERE name = 'Thơ – kịch' LIMIT 1),
 'Tác phẩm thơ nôm bất hủ của Việt Nam', '1820-01-01')
ON CONFLICT (isbn) DO NOTHING;

-- Light novel
INSERT INTO books (title, author, isbn, price, stock_quantity, category_id, description, published_date) VALUES
('Sword Art Online', 'Reki Kawahara', '9786041040412', 89000, 110,
 (SELECT category_id FROM categories WHERE name = 'Light novel' LIMIT 1),
 'Light novel về thế giới game ảo', '2009-04-10')
ON CONFLICT (isbn) DO NOTHING;

-- Sách tô màu
INSERT INTO books (title, author, isbn, price, stock_quantity, category_id, description, published_date) VALUES
('Vườn Bí Mật - Sách Tô Màu', 'Johanna Basford', '9786041040413', 99000, 80,
 (SELECT category_id FROM categories WHERE name = 'Sách tô màu' LIMIT 1),
 'Sách tô màu dành cho người lớn', '2013-03-14')
ON CONFLICT (isbn) DO NOTHING;

-- Triết học
INSERT INTO books (title, author, isbn, price, stock_quantity, category_id, description, published_date) VALUES
('Nghệ Thuật Sống Đẹp', 'Arthur Schopenhauer', '9786041040414', 79000, 95,
 (SELECT category_id FROM categories WHERE name = 'Triết học' LIMIT 1),
 'Những triết lý sống của Schopenhauer', '2018-11-01')
ON CONFLICT (isbn) DO NOTHING;

-- Sử học
INSERT INTO books (title, author, isbn, price, stock_quantity, category_id, description, published_date) VALUES
('Lịch Sử Việt Nam Bằng Tranh', 'Trần Bạch Đằng', '9786041040415', 149000, 70,
 (SELECT category_id FROM categories WHERE name = 'Sử học' LIMIT 1),
 'Lịch sử Việt Nam qua tranh minh họa', '2015-01-01')
ON CONFLICT (isbn) DO NOTHING;

-- Khoa học
INSERT INTO books (title, author, isbn, price, stock_quantity, category_id, description, published_date) VALUES
('Sapiens: Lược Sử Loài Người', 'Yuval Noah Harari', '9786041040416', 199000, 150,
 (SELECT category_id FROM categories WHERE name = 'Khoa học' LIMIT 1),
 'Lịch sử tiến hóa của loài người', '2011-01-01')
ON CONFLICT (isbn) DO NOTHING;

-- Kinh doanh
INSERT INTO books (title, author, isbn, price, stock_quantity, category_id, description, published_date) VALUES
('Khởi Nghiệp Tinh Gọn', 'Eric Ries', '9786041040417', 129000, 100,
 (SELECT category_id FROM categories WHERE name = 'Kinh doanh' LIMIT 1),
 'Phương pháp khởi nghiệp hiệu quả', '2011-09-13')
ON CONFLICT (isbn) DO NOTHING;

-- Kinh tế chính trị
INSERT INTO books (title, author, isbn, price, stock_quantity, category_id, description, published_date) VALUES
('Tư Bản', 'Karl Marx', '9786041040418', 249000, 50,
 (SELECT category_id FROM categories WHERE name = 'Kinh tế chính trị' LIMIT 1),
 'Tác phẩm kinh điển về kinh tế chính trị', '1867-09-14')
ON CONFLICT (isbn) DO NOTHING;

-- Kỹ năng
INSERT INTO books (title, author, isbn, price, stock_quantity, category_id, description, published_date) VALUES
('Đắc Nhân Tâm', 'Dale Carnegie', '9786041040419', 86000, 200,
 (SELECT category_id FROM categories WHERE name = 'Kỹ năng' LIMIT 1),
 'Nghệ thuật giao tiếp và ứng xử', '1936-10-01')
ON CONFLICT (isbn) DO NOTHING;

-- Nghệ thuật
INSERT INTO books (title, author, isbn, price, stock_quantity, category_id, description, published_date) VALUES
('Nghệ Thuật Nhiếp Ảnh', 'Bruce Barnbaum', '9786041040420', 179000, 60,
 (SELECT category_id FROM categories WHERE name = 'Nghệ thuật' LIMIT 1),
 'Hướng dẫn nghệ thuật nhiếp ảnh', '2010-01-01')
ON CONFLICT (isbn) DO NOTHING;

-- Nuôi dạy con
INSERT INTO books (title, author, isbn, price, stock_quantity, category_id, description, published_date) VALUES
('Dạy Con Làm Giàu', 'Robert Kiyosaki', '9786041040421', 99000, 120,
 (SELECT category_id FROM categories WHERE name = 'Nuôi dạy con' LIMIT 1),
 'Giáo dục tài chính cho trẻ em', '1997-04-08')
ON CONFLICT (isbn) DO NOTHING;

-- Tiểu luận – phê bình
INSERT INTO books (title, author, isbn, price, stock_quantity, category_id, description, published_date) VALUES
('Văn Học Việt Nam Hiện Đại', 'Hoài Thanh', '9786041040422', 119000, 70,
 (SELECT category_id FROM categories WHERE name = 'Tiểu luận – phê bình' LIMIT 1),
 'Phê bình văn học Việt Nam', '1942-01-01')
ON CONFLICT (isbn) DO NOTHING;

-- Tâm lý ứng dụng
INSERT INTO books (title, author, isbn, price, stock_quantity, category_id, description, published_date) VALUES
('Tâm Lý Học Tích Cực', 'Martin Seligman', '9786041040423', 139000, 90,
 (SELECT category_id FROM categories WHERE name = 'Tâm lý ứng dụng' LIMIT 1),
 'Khoa học về hạnh phúc', '2002-01-01')
ON CONFLICT (isbn) DO NOTHING;

-- Tâm lý học
INSERT INTO books (title, author, isbn, price, stock_quantity, category_id, description, published_date) VALUES
('Tư Duy Nhanh Và Chậm', 'Daniel Kahneman', '9786041040424', 169000, 110,
 (SELECT category_id FROM categories WHERE name = 'Tâm lý học' LIMIT 1),
 'Hai hệ thống tư duy của con người', '2011-10-25')
ON CONFLICT (isbn) DO NOTHING;

-- Hồi ký
INSERT INTO books (title, author, isbn, price, stock_quantity, category_id, description, published_date) VALUES
('Nhật Ký Trong Tù', 'Hồ Chí Minh', '9786041040425', 59000, 150,
 (SELECT category_id FROM categories WHERE name = 'Hồi ký' LIMIT 1),
 'Tập thơ viết trong tù của Bác Hồ', '1960-01-01')
ON CONFLICT (isbn) DO NOTHING;

-- Y học – Sức khỏe
INSERT INTO books (title, author, isbn, price, stock_quantity, category_id, description, published_date) VALUES
('Cẩm Nang Sức Khỏe Gia Đình', 'BS. Nguyễn Ý Đức', '9786041040426', 149000, 80,
 (SELECT category_id FROM categories WHERE name = 'Y học – Sức khỏe' LIMIT 1),
 'Hướng dẫn chăm sóc sức khỏe', '2018-01-01')
ON CONFLICT (isbn) DO NOTHING;

-- Tâm linh – Tôn giáo
INSERT INTO books (title, author, isbn, price, stock_quantity, category_id, description, published_date) VALUES
('Thiền Và Cuộc Sống', 'Thích Nhất Hạnh', '9786041040427', 99000, 100,
 (SELECT category_id FROM categories WHERE name = 'Tâm linh – Tôn giáo' LIMIT 1),
 'Thiền học trong cuộc sống hiện đại', '1975-01-01')
ON CONFLICT (isbn) DO NOTHING;

-- 0–5 tuổi
INSERT INTO books (title, author, isbn, price, stock_quantity, category_id, description, published_date) VALUES
('Bé Học Đếm Số', 'Nhiều tác giả', '9786041040428', 49000, 150,
 (SELECT category_id FROM categories WHERE name = '0–5 tuổi' LIMIT 1),
 'Sách học đếm số cho bé', '2020-01-01')
ON CONFLICT (isbn) DO NOTHING;

-- 6–8 tuổi
INSERT INTO books (title, author, isbn, price, stock_quantity, category_id, description, published_date) VALUES
('Truyện Cổ Tích Việt Nam', 'Nhiều tác giả', '9786041040429', 69000, 130,
 (SELECT category_id FROM categories WHERE name = '6–8 tuổi' LIMIT 1),
 'Tuyển tập truyện cổ tích Việt Nam', '2015-01-01')
ON CONFLICT (isbn) DO NOTHING;

-- 9–12 tuổi
INSERT INTO books (title, author, isbn, price, stock_quantity, category_id, description, published_date) VALUES
('Nhà Khoa Học Nhí', 'Nhiều tác giả', '9786041040430', 89000, 100,
 (SELECT category_id FROM categories WHERE name = '9–12 tuổi' LIMIT 1),
 'Khám phá khoa học cho trẻ em', '2019-01-01')
ON CONFLICT (isbn) DO NOTHING;

-- 13–15 tuổi
INSERT INTO books (title, author, isbn, price, stock_quantity, category_id, description, published_date) VALUES
('Tuổi 13 Bạn Đã Biết Gì', 'Nhiều tác giả', '9786041040431', 99000, 90,
 (SELECT category_id FROM categories WHERE name = '13–15 tuổi' LIMIT 1),
 'Kiến thức cho tuổi teen', '2017-01-01')
ON CONFLICT (isbn) DO NOTHING;
