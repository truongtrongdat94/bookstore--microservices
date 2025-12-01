-- Add books from different countries for each category
-- This will provide variety for country filter

-- Văn học hiện đại (category_id varies, find by name)
INSERT INTO books (title, author, isbn, price, stock_quantity, category_id, description, language, published_date) VALUES
('Norwegian Wood', 'Haruki Murakami', '9786041040432', 129000, 80,
 (SELECT category_id FROM categories WHERE name = 'Văn học hiện đại' LIMIT 1),
 'A nostalgic story of loss and sexuality', 'Tiếng Nhật', '1987-09-04'),
 
('The Alchemist', 'Paulo Coelho', '9786041040433', 89000, 100,
 (SELECT category_id FROM categories WHERE name = 'Văn học hiện đại' LIMIT 1),
 'A fable about following your dreams', 'Tiếng Bồ Đào Nha', '1988-01-01'),
 
('One Hundred Years of Solitude', 'Gabriel García Márquez', '9786041040434', 159000, 70,
 (SELECT category_id FROM categories WHERE name = 'Văn học hiện đại' LIMIT 1),
 'The multi-generational story of the Buendía family', 'Tiếng Tây Ban Nha', '1967-05-30')
ON CONFLICT (isbn) DO NOTHING;

-- Khoa học viễn tưởng
INSERT INTO books (title, author, isbn, price, stock_quantity, category_id, description, language, published_date) VALUES
('Foundation', 'Isaac Asimov', '9786041040435', 149000, 60,
 (SELECT category_id FROM categories WHERE name = 'Khoa học viễn tưởng' LIMIT 1),
 'The first book in the Foundation series', 'Tiếng Anh', '1951-06-01'),
 
('The Three-Body Problem', 'Liu Cixin', '9786041040436', 169000, 75,
 (SELECT category_id FROM categories WHERE name = 'Khoa học viễn tưởng' LIMIT 1),
 'Chinese science fiction masterpiece', 'Tiếng Trung', '2008-01-01')
ON CONFLICT (isbn) DO NOTHING;

-- Trinh thám – Kinh dị
INSERT INTO books (title, author, isbn, price, stock_quantity, category_id, description, language, published_date) VALUES
('The Girl with the Dragon Tattoo', 'Stieg Larsson', '9786041040437', 139000, 85,
 (SELECT category_id FROM categories WHERE name = 'Trinh thám – Kinh dị' LIMIT 1),
 'Swedish crime thriller', 'Tiếng Thụy Điển', '2005-08-01'),
 
('Murder on the Orient Express', 'Agatha Christie', '9786041040438', 99000, 90,
 (SELECT category_id FROM categories WHERE name = 'Trinh thám – Kinh dị' LIMIT 1),
 'Classic mystery novel', 'Tiếng Anh', '1934-01-01')
ON CONFLICT (isbn) DO NOTHING;

-- Kinh doanh
INSERT INTO books (title, author, isbn, price, stock_quantity, category_id, description, language, published_date) VALUES
('Zero to One', 'Peter Thiel', '9786041040439', 149000, 70,
 (SELECT category_id FROM categories WHERE name = 'Kinh doanh' LIMIT 1),
 'Notes on startups and building the future', 'Tiếng Anh', '2014-09-16'),
 
('The Toyota Way', 'Jeffrey Liker', '9786041040440', 179000, 55,
 (SELECT category_id FROM categories WHERE name = 'Kinh doanh' LIMIT 1),
 'Management principles from Toyota', 'Tiếng Anh', '2003-12-17')
ON CONFLICT (isbn) DO NOTHING;

-- Tâm lý học
INSERT INTO books (title, author, isbn, price, stock_quantity, category_id, description, language, published_date) VALUES
('Man''s Search for Meaning', 'Viktor Frankl', '9786041040441', 119000, 95,
 (SELECT category_id FROM categories WHERE name = 'Tâm lý học' LIMIT 1),
 'A psychiatrist''s memoir of life in Nazi death camps', 'Tiếng Đức', '1946-01-01'),
 
('The Power of Now', 'Eckhart Tolle', '9786041040442', 129000, 80,
 (SELECT category_id FROM categories WHERE name = 'Tâm lý học' LIMIT 1),
 'A guide to spiritual enlightenment', 'Tiếng Anh', '1997-01-01')
ON CONFLICT (isbn) DO NOTHING;

-- Triết học
INSERT INTO books (title, author, isbn, price, stock_quantity, category_id, description, language, published_date) VALUES
('Thus Spoke Zarathustra', 'Friedrich Nietzsche', '9786041040443', 139000, 65,
 (SELECT category_id FROM categories WHERE name = 'Triết học' LIMIT 1),
 'Philosophical novel by Nietzsche', 'Tiếng Đức', '1883-01-01'),
 
('Meditations', 'Marcus Aurelius', '9786041040444', 89000, 100,
 (SELECT category_id FROM categories WHERE name = 'Triết học' LIMIT 1),
 'Personal writings of the Roman Emperor', 'Tiếng La Tinh', '180-01-01')
ON CONFLICT (isbn) DO NOTHING;

-- Kỳ ảo
INSERT INTO books (title, author, isbn, price, stock_quantity, category_id, description, language, published_date) VALUES
('The Lord of the Rings', 'J.R.R. Tolkien', '9786041040445', 299000, 120,
 (SELECT category_id FROM categories WHERE name = 'Kỳ ảo' LIMIT 1),
 'Epic high fantasy novel', 'Tiếng Anh', '1954-07-29'),
 
('The Name of the Wind', 'Patrick Rothfuss', '9786041040446', 189000, 75,
 (SELECT category_id FROM categories WHERE name = 'Kỳ ảo' LIMIT 1),
 'First book in The Kingkiller Chronicle', 'Tiếng Anh', '2007-03-27')
ON CONFLICT (isbn) DO NOTHING;

-- Lãng mạn
INSERT INTO books (title, author, isbn, price, stock_quantity, category_id, description, language, published_date) VALUES
('Me Before You', 'Jojo Moyes', '9786041040447', 119000, 85,
 (SELECT category_id FROM categories WHERE name = 'Lãng mạn' LIMIT 1),
 'A romance novel about love and choices', 'Tiếng Anh', '2012-01-05'),
 
('The Notebook', 'Nicholas Sparks', '9786041040448', 99000, 90,
 (SELECT category_id FROM categories WHERE name = 'Lãng mạn' LIMIT 1),
 'A timeless love story', 'Tiếng Anh', '1996-10-01')
ON CONFLICT (isbn) DO NOTHING;

-- Khoa học
INSERT INTO books (title, author, isbn, price, stock_quantity, category_id, description, language, published_date) VALUES
('A Brief History of Time', 'Stephen Hawking', '9786041040449', 179000, 70,
 (SELECT category_id FROM categories WHERE name = 'Khoa học' LIMIT 1),
 'From the Big Bang to Black Holes', 'Tiếng Anh', '1988-04-01'),
 
('Cosmos', 'Carl Sagan', '9786041040450', 189000, 65,
 (SELECT category_id FROM categories WHERE name = 'Khoa học' LIMIT 1),
 'A journey through space and time', 'Tiếng Anh', '1980-09-28')
ON CONFLICT (isbn) DO NOTHING;

-- Kỹ năng
INSERT INTO books (title, author, isbn, price, stock_quantity, category_id, description, language, published_date) VALUES
('Atomic Habits', 'James Clear', '9786041040451', 139000, 150,
 (SELECT category_id FROM categories WHERE name = 'Kỹ năng' LIMIT 1),
 'An easy and proven way to build good habits', 'Tiếng Anh', '2018-10-16'),
 
('The 7 Habits of Highly Effective People', 'Stephen Covey', '9786041040452', 149000, 120,
 (SELECT category_id FROM categories WHERE name = 'Kỹ năng' LIMIT 1),
 'Powerful lessons in personal change', 'Tiếng Anh', '1989-08-15')
ON CONFLICT (isbn) DO NOTHING;
