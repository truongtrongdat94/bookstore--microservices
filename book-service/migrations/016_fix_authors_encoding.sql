-- Fix Authors Encoding Migration
-- This migration re-inserts author data with proper UTF-8 encoding

-- First, delete existing authors to re-insert with correct encoding
DELETE FROM authors;

-- Re-insert ALL authors with proper UTF-8 encoding
INSERT INTO authors (name, nationality, birth_year, death_year, bio, quote, image_url, website) VALUES

-- Vietnamese Authors
('Nguyễn Nhật Ánh', 'Việt Nam', 1955, NULL,
 'Nguyễn Nhật Ánh là một trong những nhà văn được yêu thích nhất Việt Nam, đặc biệt với độc giả trẻ. Sinh năm 1955 tại Quảng Nam, ông bắt đầu sự nghiệp văn chương từ những năm 1980. Tác phẩm nổi tiếng: "Mắt Biếc", "Tôi Thấy Hoa Vàng Trên Cỏ Xanh".',
 'Tuổi thơ là khoảng trời rộng lớn trong mỗi tâm hồn, nơi ta có thể trở về bất cứ lúc nào.',
 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600',
 NULL),

('Tô Hoài', 'Việt Nam', 1920, 2014,
 'Tô Hoài (1920-2014) là nhà văn lớn của văn học Việt Nam, đặc biệt nổi tiếng với văn học thiếu nhi. Tác phẩm nổi tiếng nhất: "Dế Mèn Phiêu Lưu Ký" (1941).',
 'Văn chương là để yêu thương con người, để con người tốt đẹp hơn.',
 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=600',
 NULL),

('Nguyễn Du', 'Việt Nam', 1766, 1820,
 'Nguyễn Du (1766-1820) là đại thi hào của dân tộc Việt Nam, tác giả của kiệt tác "Truyện Kiều" - tác phẩm văn học vĩ đại nhất trong lịch sử văn học Việt Nam.',
 'Trăm năm trong cõi người ta, chữ tài chữ mệnh khéo là ghét nhau.',
 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600',
 NULL),

('Nguyễn Ngọc Tư', 'Việt Nam', 1976, NULL,
 'Nguyễn Ngọc Tư là nhà văn nữ Việt Nam, nổi tiếng với những tác phẩm về miền Tây Nam Bộ.',
 'Viết là cách tôi sống với những ký ức về quê hương.',
 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600',
 NULL),

('Hoài Thanh', 'Việt Nam', 1909, 1982,
 'Hoài Thanh (1909-1982) là nhà phê bình văn học và nhà thơ Việt Nam.',
 'Văn học là nghệ thuật của ngôn từ.',
 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600',
 NULL),

('Hồ Chí Minh', 'Việt Nam', 1890, 1969,
 'Hồ Chí Minh (1890-1969) là lãnh tụ cách mạng, Chủ tịch nước Việt Nam Dân chủ Cộng hòa, đồng thời là nhà thơ, nhà văn.',
 'Không có gì quý hơn độc lập tự do.',
 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600',
 NULL),

('Trần Bạch Đằng', 'Việt Nam', 1926, 2007,
 'Trần Bạch Đằng (1926-2007) là họa sĩ và nhà văn Việt Nam, nổi tiếng với các tác phẩm lịch sử bằng tranh.',
 'Lịch sử là bài học quý giá nhất cho thế hệ mai sau.',
 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600',
 NULL),

('Thích Nhất Hạnh', 'Việt Nam', 1926, 2022,
 'Thích Nhất Hạnh (1926-2022) là thiền sư, nhà thơ và nhà hoạt động hòa bình người Việt Nam.',
 'Hạnh phúc có thể có ngay trong giây phút hiện tại.',
 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=600',
 NULL),

('BS. Nguyễn Ý Đức', 'Việt Nam', 1965, NULL,
 'Bác sĩ Nguyễn Ý Đức là bác sĩ và tác giả sách y học phổ thông tại Việt Nam.',
 'Sức khỏe là tài sản quý giá nhất của mỗi người.',
 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600',
 NULL),

-- Japanese Authors
('Haruki Murakami', 'Nhật Bản', 1949, NULL,
 'Haruki Murakami là một trong những nhà văn Nhật Bản được yêu thích nhất trên thế giới. Tác phẩm nổi tiếng: "Norwegian Wood", "Kafka on the Shore", "1Q84".',
 'Nếu bạn chỉ đọc những cuốn sách mà mọi người đang đọc, bạn chỉ có thể nghĩ những gì mọi người đang nghĩ.',
 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600',
 'https://www.harukimurakami.com'),

('Reki Kawahara', 'Nhật Bản', 1974, NULL,
 'Reki Kawahara là tác giả light novel người Nhật Bản, nổi tiếng với series "Sword Art Online".',
 'Trong thế giới ảo, cảm xúc của chúng ta vẫn là thật.',
 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600',
 NULL),

-- British Authors
('J.K. Rowling', 'Anh', 1965, NULL,
 'J.K. Rowling là tác giả của series Harry Potter - một trong những series sách bán chạy nhất mọi thời đại.',
 'Điều quan trọng không phải là khả năng của chúng ta, mà là những lựa chọn của chúng ta.',
 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600',
 'https://www.jkrowling.com'),

('Jane Austen', 'Anh', 1775, 1817,
 'Jane Austen (1775-1817) là một trong những tiểu thuyết gia vĩ đại nhất của văn học Anh. Tác phẩm nổi tiếng: "Pride and Prejudice", "Sense and Sensibility".',
 'Không có gì tôi sợ hơn là bị hiểu lầm.',
 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600',
 NULL),

('Arthur Conan Doyle', 'Anh', 1859, 1930,
 'Sir Arthur Conan Doyle (1859-1930) là bác sĩ và nhà văn người Scotland, nổi tiếng với việc sáng tạo ra thám tử Sherlock Holmes.',
 'Khi bạn loại bỏ những điều không thể, dù còn lại điều gì, dù không thể tin được, đó phải là sự thật.',
 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600',
 NULL),

('Agatha Christie', 'Anh', 1890, 1976,
 'Agatha Christie (1890-1976) là nữ hoàng truyện trinh thám, tác giả người Anh với hơn 2 tỷ bản sách được bán ra.',
 'Một manh mối là một manh mối, và một sự thật là một sự thật.',
 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600',
 NULL),

('J.R.R. Tolkien', 'Anh', 1892, 1973,
 'J.R.R. Tolkien (1892-1973) là tác giả của "The Hobbit" và "The Lord of the Rings", cha đẻ của thể loại văn học kỳ ảo hiện đại.',
 'Không phải tất cả những ai lang thang đều bị lạc.',
 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=600',
 NULL),

('Alan Moore', 'Anh', 1953, NULL,
 'Alan Moore là nhà văn truyện tranh người Anh, tác giả của "Watchmen", "V for Vendetta".',
 'Nghệ thuật là ma thuật được giải phóng khỏi nỗi dày vò sự thật.',
 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600',
 NULL),

('Stephen Hawking', 'Anh', 1942, 2018,
 'Stephen Hawking (1942-2018) là nhà vật lý lý thuyết và vũ trụ học người Anh, tác giả "A Brief History of Time".',
 'Trí thông minh là khả năng thích nghi với sự thay đổi.',
 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600',
 NULL),

('Jojo Moyes', 'Anh', 1969, NULL,
 'Jojo Moyes là tiểu thuyết gia người Anh, nổi tiếng với tiểu thuyết "Me Before You".',
 'Đôi khi bạn phải làm những điều bạn không muốn làm.',
 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600',
 NULL),

('Johanna Basford', 'Anh', 1983, NULL,
 'Johanna Basford là họa sĩ minh họa người Scotland, nổi tiếng với các sách tô màu dành cho người lớn.',
 'Nghệ thuật là cách để tìm thấy sự bình yên trong cuộc sống bận rộn.',
 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600',
 NULL),

-- German Authors
('Arthur Schopenhauer', 'Đức', 1788, 1860,
 'Arthur Schopenhauer (1788-1860) là triết gia người Đức, nổi tiếng với triết học bi quan.',
 'Nghệ thuật là ma thuật được giải phóng khỏi nỗi dày vò của sự tồn tại.',
 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600',
 NULL),

('Friedrich Nietzsche', 'Đức', 1844, 1900,
 'Friedrich Nietzsche (1844-1900) là triết gia, nhà thơ và nhà phê bình văn hóa người Đức.',
 'Điều gì không giết chết ta sẽ làm ta mạnh mẽ hơn.',
 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600',
 NULL),

('Karl Marx', 'Đức', 1818, 1883,
 'Karl Marx (1818-1883) là triết gia, kinh tế học gia và nhà cách mạng người Đức.',
 'Lịch sử của mọi xã hội cho đến nay là lịch sử của đấu tranh giai cấp.',
 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600',
 NULL),

('Eckhart Tolle', 'Đức', 1948, NULL,
 'Eckhart Tolle là tác giả và giáo viên tâm linh người Đức, tác giả "The Power of Now".',
 'Nhận ra rằng khoảnh khắc hiện tại là tất cả những gì bạn có.',
 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=600',
 NULL),

-- American Authors
('Dale Carnegie', 'Mỹ', 1888, 1955,
 'Dale Carnegie (1888-1955) là tác giả "How to Win Friends and Influence People" (Đắc Nhân Tâm).',
 'Hãy quan tâm chân thành đến người khác.',
 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600',
 'https://www.dalecarnegie.com'),

('Eric Ries', 'Mỹ', 1978, NULL,
 'Eric Ries là tác giả "The Lean Startup" (Khởi Nghiệp Tinh Gọn).',
 'Thành công của startup không phải là thực hiện một kế hoạch hoàn hảo, mà là học hỏi nhanh chóng từ thất bại.',
 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=600',
 'http://theleanstartup.com'),

('Stephen Covey', 'Mỹ', 1932, 2012,
 'Stephen Covey (1932-2012) là tác giả "The 7 Habits of Highly Effective People".',
 'Hãy bắt đầu với mục tiêu cuối cùng trong tâm trí.',
 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=600',
 NULL),

('Robert Kiyosaki', 'Mỹ', 1947, NULL,
 'Robert Kiyosaki là tác giả "Rich Dad Poor Dad" (Dạy Con Làm Giàu).',
 'Người giàu không làm việc vì tiền, họ để tiền làm việc cho họ.',
 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600',
 NULL),

('James Clear', 'Mỹ', 1986, NULL,
 'James Clear là tác giả "Atomic Habits".',
 'Bạn không lên đến mục tiêu, bạn rơi xuống mức độ của hệ thống.',
 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600',
 NULL),

('Peter Thiel', 'Mỹ', 1967, NULL,
 'Peter Thiel là đồng sáng lập PayPal, tác giả "Zero to One".',
 'Cạnh tranh là dành cho kẻ thua cuộc. Hãy tạo ra độc quyền.',
 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600',
 NULL),

('Jeffrey Liker', 'Mỹ', 1954, NULL,
 'Jeffrey Liker là tác giả "The Toyota Way".',
 'Cải tiến liên tục là chìa khóa của sự xuất sắc.',
 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=600',
 NULL),

('Carl Sagan', 'Mỹ', 1934, 1996,
 'Carl Sagan (1934-1996) là nhà thiên văn học, tác giả "Cosmos".',
 'Chúng ta là cách để vũ trụ tự nhận thức về chính nó.',
 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600',
 NULL),

('Isaac Asimov', 'Mỹ', 1920, 1992,
 'Isaac Asimov (1920-1992) là nhà văn khoa học viễn tưởng vĩ đại với hơn 500 cuốn sách.',
 'Kẻ thù nguy hiểm nhất của tri thức không phải là vô tri, mà là ảo tưởng về tri thức.',
 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600',
 NULL),

('Frank Herbert', 'Mỹ', 1920, 1986,
 'Frank Herbert (1920-1986) là tác giả series "Dune".',
 'Tôi không được sợ hãi. Sợ hãi là kẻ giết chết tâm trí.',
 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600',
 NULL),

('Patrick Rothfuss', 'Mỹ', 1973, NULL,
 'Patrick Rothfuss là tác giả series "The Kingkiller Chronicle".',
 'Đó là những câu chuyện nhỏ nhặt làm nên một cuộc đời.',
 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600',
 NULL),

('Nicholas Sparks', 'Mỹ', 1965, NULL,
 'Nicholas Sparks là tác giả "The Notebook", "A Walk to Remember".',
 'Tình yêu thực sự là về sự hy sinh và cam kết.',
 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600',
 NULL),

('Eric Carle', 'Mỹ', 1929, 2021,
 'Eric Carle (1929-2021) là tác giả "The Very Hungry Caterpillar".',
 'Tôi tin rằng trẻ em là những người đọc tự nhiên.',
 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600',
 NULL),

('Bruce Barnbaum', 'Mỹ', 1943, NULL,
 'Bruce Barnbaum là tác giả "The Art of Photography".',
 'Nhiếp ảnh là nghệ thuật của việc nhìn.',
 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600',
 NULL),

('Martin Seligman', 'Mỹ', 1942, NULL,
 'Martin Seligman là cha đẻ của tâm lý học tích cực.',
 'Hạnh phúc không phải là kết quả của gen tốt hay may mắn.',
 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=600',
 NULL),

-- Other Countries
('Paulo Coelho', 'Brazil', 1947, NULL,
 'Paulo Coelho là tác giả "The Alchemist" (Nhà Giả Kim).',
 'Khi bạn muốn một điều gì đó, cả vũ trụ sẽ hợp lực giúp bạn đạt được điều đó.',
 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=600',
 'https://paulocoelhoblog.com'),

('Yuval Noah Harari', 'Israel', 1976, NULL,
 'Yuval Noah Harari là tác giả "Sapiens: Lược Sử Loài Người".',
 'Lịch sử bắt đầu khi con người phát minh ra các vị thần, và sẽ kết thúc khi con người trở thành thần.',
 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600',
 'https://www.ynharari.com'),

('Daniel Kahneman', 'Israel', 1934, 2024,
 'Daniel Kahneman (1934-2024) là nhà tâm lý học đoạt giải Nobel, tác giả "Thinking, Fast and Slow".',
 'Chúng ta có thể bị mù quáng trước những điều hiển nhiên.',
 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600',
 NULL),

('Leo Tolstoy', 'Nga', 1828, 1910,
 'Leo Tolstoy (1828-1910) là tác giả "War and Peace", "Anna Karenina".',
 'Tất cả những gia đình hạnh phúc đều giống nhau, mỗi gia đình bất hạnh đều bất hạnh theo cách riêng của nó.',
 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600',
 NULL),

('Gabriel García Márquez', 'Colombia', 1927, 2014,
 'Gabriel García Márquez (1927-2014) là tác giả "One Hundred Years of Solitude", đoạt giải Nobel Văn học 1982.',
 'Cuộc đời không phải là những gì chúng ta đã sống, mà là những gì chúng ta nhớ và cách chúng ta nhớ nó.',
 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600',
 NULL),

('Khaled Hosseini', 'Afghanistan', 1965, NULL,
 'Khaled Hosseini là tác giả "The Kite Runner" (Người Đua Diều).',
 'Có thể có nhiều cách để phá hủy một người, nhưng cách chắc chắn nhất là khiến họ cảm thấy vô giá trị.',
 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=600',
 'https://khaledhosseini.com'),

('Viktor Frankl', 'Áo', 1905, 1997,
 'Viktor Frankl (1905-1997) là tác giả "Man''s Search for Meaning".',
 'Giữa kích thích và phản ứng có một khoảng trống. Trong khoảng trống đó là quyền tự do lựa chọn.',
 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=600',
 NULL),

('Marcus Aurelius', 'La Mã', 121, 180,
 'Marcus Aurelius (121-180) là hoàng đế La Mã, tác giả "Meditations".',
 'Bạn có quyền lực trên tâm trí của mình, không phải các sự kiện bên ngoài.',
 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600',
 NULL),

('Jules Verne', 'Pháp', 1828, 1905,
 'Jules Verne (1828-1905) là cha đẻ của thể loại khoa học viễn tưởng.',
 'Bất cứ điều gì một người có thể tưởng tượng, người khác có thể biến nó thành hiện thực.',
 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600',
 NULL),

('Stieg Larsson', 'Thụy Điển', 1954, 2004,
 'Stieg Larsson (1954-2004) là tác giả "The Girl with the Dragon Tattoo".',
 'Tình bạn là điều quan trọng đối với tôi.',
 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600',
 NULL),

('Liu Cixin', 'Trung Quốc', 1963, NULL,
 'Liu Cixin là tác giả "The Three-Body Problem", giải Hugo 2015.',
 'Vũ trụ là một khu rừng tối, mỗi nền văn minh là một thợ săn.',
 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=600',
 NULL),

-- Generic for multiple authors books
('Nhiều tác giả', 'Quốc tế', NULL, NULL,
 'Đây là các tác phẩm được biên soạn bởi nhiều tác giả khác nhau.',
 'Sự hợp tác tạo nên sức mạnh.',
 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600',
 NULL)

ON CONFLICT (name) DO UPDATE SET
  nationality = EXCLUDED.nationality,
  birth_year = EXCLUDED.birth_year,
  death_year = EXCLUDED.death_year,
  bio = EXCLUDED.bio,
  quote = EXCLUDED.quote,
  image_url = EXCLUDED.image_url,
  website = EXCLUDED.website;

-- Re-link ALL books to authors after re-inserting
INSERT INTO book_authors (book_id, author_id, author_order)
SELECT b.book_id, a.author_id, 1
FROM books b
INNER JOIN authors a ON TRIM(b.author) = TRIM(a.name)
ON CONFLICT (book_id, author_id) DO NOTHING;

-- Verify results
SELECT 
    'Total Authors' as metric,
    COUNT(*)::text as value
FROM authors
UNION ALL
SELECT 
    'Total Book-Author Links' as metric,
    COUNT(*)::text as value
FROM book_authors
UNION ALL
SELECT 
    'Books Without Authors' as metric,
    COUNT(*)::text as value
FROM books b
WHERE NOT EXISTS (SELECT 1 FROM book_authors ba WHERE ba.book_id = b.book_id);
