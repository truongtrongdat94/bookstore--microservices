-- Fix Vietnamese authors encoding and add missing authors
-- Delete incorrectly encoded authors first
DELETE FROM authors WHERE name LIKE '%??%';

-- Insert Vietnamese authors with correct encoding
INSERT INTO authors (name, nationality, birth_year, death_year, bio, quote, image_url) VALUES
('Nguyễn Ngọc Tư', 'Việt Nam', 1976, NULL,
 'Nguyễn Ngọc Tư là nhà văn nữ Việt Nam, nổi tiếng với những tác phẩm về miền Tây Nam Bộ.',
 'Viết là cách tôi sống với những ký ức về quê hương.',
 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600'),
 
('Hoài Thanh', 'Việt Nam', 1909, 1982,
 'Hoài Thanh là nhà phê bình văn học và nhà thơ Việt Nam.',
 'Văn học là nghệ thuật của ngôn từ.',
 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600'),
 
('Hồ Chí Minh', 'Việt Nam', 1890, 1969,
 'Hồ Chí Minh là lãnh tụ cách mạng, Chủ tịch nước Việt Nam Dân chủ Cộng hòa.',
 'Không có gì quý hơn độc lập tự do.',
 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600'),
 
('Trần Bạch Đằng', 'Việt Nam', 1926, 2007,
 'Trần Bạch Đằng là họa sĩ và nhà văn Việt Nam, nổi tiếng với các tác phẩm lịch sử bằng tranh.',
 'Lịch sử là bài học quý giá nhất cho thế hệ mai sau.',
 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600'),
 
('Thích Nhất Hạnh', 'Việt Nam', 1926, 2022,
 'Thích Nhất Hạnh là thiền sư, nhà thơ và nhà hoạt động hòa bình người Việt Nam.',
 'Hạnh phúc có thể có ngay trong giây phút hiện tại.',
 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=600'),
 
('BS. Nguyễn Ý Đức', 'Việt Nam', 1965, NULL,
 'Bác sĩ Nguyễn Ý Đức là bác sĩ và tác giả sách y học phổ thông tại Việt Nam.',
 'Sức khỏe là tài sản quý giá nhất của mỗi người.',
 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600'),
 
('Nhiều tác giả', 'Quốc tế', NULL, NULL,
 'Đây là các tác phẩm được biên soạn bởi nhiều tác giả khác nhau.',
 'Sự hợp tác tạo nên sức mạnh.',
 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600')
ON CONFLICT (name) DO NOTHING;

-- Link all books to authors
INSERT INTO book_authors (book_id, author_id, author_order)
SELECT 
    b.book_id,
    a.author_id,
    1
FROM books b
INNER JOIN authors a ON b.author = a.name
WHERE NOT EXISTS (
    SELECT 1 FROM book_authors ba 
    WHERE ba.book_id = b.book_id AND ba.author_id = a.author_id
)
ON CONFLICT (book_id, author_id) DO NOTHING;

-- Show results
SELECT 
    'Total Authors' as metric,
    COUNT(*)::text as value
FROM authors
UNION ALL
SELECT 
    'Total Book-Author Links',
    COUNT(*)::text
FROM book_authors
UNION ALL
SELECT 
    'Books Without Authors',
    COUNT(*)::text
FROM books b
WHERE NOT EXISTS (SELECT 1 FROM book_authors ba WHERE ba.book_id = b.book_id);
