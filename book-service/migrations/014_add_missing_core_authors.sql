-- Add the 4 missing core authors that were deleted
INSERT INTO authors (name, nationality, birth_year, death_year, bio, quote, image_url) VALUES
('Nguyễn Nhật Ánh', 'Việt Nam', 1955, NULL,
 'Nguyễn Nhật Ánh là một trong những nhà văn được yêu thích nhất Việt Nam, đặc biệt với độc giả trẻ.',
 'Tuổi thơ là khoảng trời rộng lớn trong mỗi tâm hồn.',
 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600'),
 
('Tô Hoài', 'Việt Nam', 1920, 2014,
 'Tô Hoài là nhà văn lớn của văn học Việt Nam, đặc biệt nổi tiếng với văn học thiếu nhi.',
 'Văn chương là để yêu thương con người.',
 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=600'),
 
('Nguyễn Du', 'Việt Nam', 1766, 1820,
 'Nguyễn Du là đại thi hào của dân tộc Việt Nam, tác giả của kiệt tác Truyện Kiều.',
 'Trăm năm trong cõi người ta, chữ tài chữ mệnh khéo là ghét nhau.',
 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600'),
 
('Gabriel García Márquez', 'Colombia', 1927, 2014,
 'Gabriel García Márquez là nhà văn Colombia, người đoạt giải Nobel Văn học năm 1982.',
 'Cuộc đời không phải là những gì chúng ta đã sống, mà là những gì chúng ta nhớ.',
 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600')
ON CONFLICT (name) DO NOTHING;

-- Link these books to authors
INSERT INTO book_authors (book_id, author_id, author_order)
SELECT 
    b.book_id,
    a.author_id,
    1
FROM books b
INNER JOIN authors a ON b.author = a.name
WHERE b.book_id IN (21, 23, 32, 55)
ON CONFLICT (book_id, author_id) DO NOTHING;

-- Final verification
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
