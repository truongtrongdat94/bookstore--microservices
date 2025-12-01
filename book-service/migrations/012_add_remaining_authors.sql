-- Add all remaining authors from books table
-- This migration adds authors that exist in books but not yet in authors table

INSERT INTO authors (name, nationality, birth_year, death_year, bio, quote, image_url) VALUES

-- Vietnamese Authors (continued)
('Nguyễn Ngọc Tư', 'Việt Nam', 1976, NULL,
 'Nguyễn Ngọc Tư là nhà văn nữ Việt Nam, nổi tiếng với những tác phẩm về miền Tây Nam Bộ. Sinh năm 1976 tại Cà Mau, bà đã tạo nên dấu ấn riêng trong văn học đương đại với phong cách viết giản dị nhưng sâu sắc.',
 'Viết là cách tôi sống với những ký ức về quê hương.',
 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600'),

('Hoài Thanh', 'Việt Nam', 1909, 1982,
 'Hoài Thanh (1909-1982) là nhà phê bình văn học và nhà thơ Việt Nam. Ông là một trong những nhà phê bình văn học tiên phong, có ảnh hưởng lớn đến văn học Việt Nam hiện đại.',
 'Văn học là nghệ thuật của ngôn từ.',
 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600'),

('Hồ Chí Minh', 'Việt Nam', 1890, 1969,
 'Hồ Chí Minh (1890-1969) là lãnh tụ cách mạng, Chủ tịch nước Việt Nam Dân chủ Cộng hòa, đồng thời là nhà thơ, nhà văn. Tác phẩm văn học của Người mang tính nhân văn sâu sắc và tinh thần yêu nước mãnh liệt.',
 'Không có gì quý hơn độc lập tự do.',
 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600'),

('Trần Bạch Đằng', 'Việt Nam', 1926, 2007,
 'Trần Bạch Đằng (1926-2007) là họa sĩ và nhà văn Việt Nam, nổi tiếng với các tác phẩm lịch sử bằng tranh. Ông đã cống hiến cả cuộc đời cho việc minh họa lịch sử dân tộc.',
 'Lịch sử là bài học quý giá nhất cho thế hệ mai sau.',
 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600'),

('Thích Nhất Hạnh', 'Việt Nam', 1926, 2022,
 'Thích Nhất Hạnh (1926-2022) là thiền sư, nhà thơ và nhà hoạt động hòa bình người Việt Nam. Ngài là một trong những nhà sư Phật giáo có ảnh hưởng nhất thế giới, người đưa thiền học vào cuộc sống hiện đại.',
 'Hạnh phúc có thể có ngay trong giây phút hiện tại.',
 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=600'),

('BS. Nguyễn Ý Đức', 'Việt Nam', 1965, NULL,
 'Bác sĩ Nguyễn Ý Đức là bác sĩ và tác giả sách y học phổ thông tại Việt Nam. Ông chuyên viết các cẩm nang sức khỏe dễ hiểu cho gia đình.',
 'Sức khỏe là tài sản quý giá nhất của mỗi người.',
 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600'),

-- American Authors (continued)
('Stephen Covey', 'Mỹ', 1932, 2012,
 'Stephen Covey (1932-2012) là tác giả, diễn giả và giáo sư người Mỹ. Cuốn sách "The 7 Habits of Highly Effective People" của ông đã bán được hơn 25 triệu bản và trở thành kinh điển về phát triển bản thân.',
 'Hãy bắt đầu với mục tiêu cuối cùng trong tâm trí.',
 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=600'),

('Robert Kiyosaki', 'Mỹ', 1947, NULL,
 'Robert Kiyosaki là doanh nhân, nhà đầu tư và tác giả người Mỹ. Cuốn sách "Rich Dad Poor Dad" của ông đã thay đổi cách nhìn về tài chính của hàng triệu người trên thế giới.',
 'Người giàu không làm việc vì tiền, họ để tiền làm việc cho họ.',
 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600'),

('James Clear', 'Mỹ', 1986, NULL,
 'James Clear là tác giả và diễn giả về thói quen, ra quyết định và cải thiện liên tục. Cuốn sách "Atomic Habits" của ông đã bán được hơn 10 triệu bản trên toàn thế giới.',
 'Bạn không lên đến mục tiêu, bạn rơi xuống mức độ của hệ thống.',
 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600'),

('Peter Thiel', 'Mỹ', 1967, NULL,
 'Peter Thiel là doanh nhân, nhà đầu tư mạo hiểm và tác giả người Mỹ gốc Đức. Ông là đồng sáng lập PayPal và nhà đầu tư đầu tiên vào Facebook. Cuốn sách "Zero to One" là kinh nghiệm khởi nghiệp của ông.',
 'Cạnh tranh là dành cho kẻ thua cuộc. Hãy tạo ra độc quyền.',
 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600'),

('Jeffrey Liker', 'Mỹ', 1954, NULL,
 'Jeffrey Liker là giáo sư và tác giả chuyên về hệ thống sản xuất Toyota. Cuốn sách "The Toyota Way" của ông đã trở thành tài liệu kinh điển về quản lý sản xuất tinh gọn.',
 'Cải tiến liên tục là chìa khóa của sự xuất sắc.',
 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=600'),

('Stephen Hawking', 'Anh', 1942, 2018,
 'Stephen Hawking (1942-2018) là nhà vật lý lý thuyết và vũ trụ học người Anh. Mặc dù mắc bệnh ALS, ông đã có những đóng góp to lớn cho khoa học và viết nhiều sách phổ biến khoa học như "A Brief History of Time".',
 'Trí thông minh là khả năng thích nghi với sự thay đổi.',
 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600'),

('Carl Sagan', 'Mỹ', 1934, 1996,
 'Carl Sagan (1934-1996) là nhà thiên văn học, nhà vũ trụ học và tác giả người Mỹ. Ông nổi tiếng với khả năng truyền đạt khoa học một cách dễ hiểu và truyền cảm hứng qua series "Cosmos".',
 'Chúng ta là cách để vũ trụ tự nhận thức về chính nó.',
 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600'),

('Isaac Asimov', 'Mỹ', 1920, 1992,
 'Isaac Asimov (1920-1992) là nhà văn khoa học viễn tưởng và giáo sư sinh hóa người Mỹ gốc Nga. Ông là một trong những tác giả khoa học viễn tưởng vĩ đại nhất, với hơn 500 cuốn sách.',
 'Kẻ thù nguy hiểm nhất của tri thức không phải là vô tri, mà là ảo tưởng về tri thức.',
 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600'),

-- British Authors (continued)
('Agatha Christie', 'Anh', 1890, 1976,
 'Agatha Christie (1890-1976) là nữ hoàng truyện trinh thám, tác giả người Anh. Bà đã viết 66 tiểu thuyết trinh thám và 14 tuyển tập truyện ngắn, với các nhân vật nổi tiếng như Hercule Poirot và Miss Marple.',
 'Một trong những điều thú vị nhất về tội phạm là động cơ.',
 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600'),

('J.R.R. Tolkien', 'Anh', 1892, 1973,
 'J.R.R. Tolkien (1892-1973) là nhà văn, nhà thơ và giáo sư người Anh, tác giả của "The Hobbit" và "The Lord of the Rings". Ông được coi là cha đẻ của thể loại văn học kỳ ảo hiện đại.',
 'Không phải tất cả những ai lang thang đều bị lạc.',
 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=600'),

('Alan Moore', 'Anh', 1953, NULL,
 'Alan Moore là nhà văn truyện tranh người Anh, được coi là một trong những tác giả truyện tranh vĩ đại nhất. Tác phẩm nổi tiếng của ông bao gồm "Watchmen", "V for Vendetta" và "From Hell".',
 'Nghệ thuật là ma thuật được giải phóng khỏi lời nói dối về sự thật.',
 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600'),

-- German Authors
('Friedrich Nietzsche', 'Đức', 1844, 1900,
 'Friedrich Nietzsche (1844-1900) là triết gia, nhà thơ và nhà phê bình văn hóa người Đức. Tư tưởng của ông về siêu nhân, ý chí quyền lực và sự tái diễn vĩnh cửu đã ảnh hưởng sâu rộng đến triết học hiện đại.',
 'Điều gì không giết chết ta sẽ làm ta mạnh mẽ hơn.',
 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600'),

('Arthur Schopenhauer', 'Đức', 1788, 1860,
 'Arthur Schopenhauer (1788-1860) là triết gia người Đức, nổi tiếng với triết học bi quan và ảnh hưởng của Phật giáo đến tư tưởng phương Tây. Tác phẩm chính của ông là "The World as Will and Representation".',
 'Cuộc sống dao động như con lắc giữa đau khổ và buồn chán.',
 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600'),

('Karl Marx', 'Đức', 1818, 1883,
 'Karl Marx (1818-1883) là triết gia, kinh tế học gia và nhà cách mạng người Đức. Tác phẩm "Das Kapital" và "The Communist Manifesto" của ông đã có ảnh hưởng to lớn đến lịch sử thế giới.',
 'Lịch sử của mọi xã hội cho đến nay là lịch sử của đấu tranh giai cấp.',
 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600'),

-- Austrian Authors
('Viktor Frankl', 'Áo', 1905, 1997,
 'Viktor Frankl (1905-1997) là bác sĩ tâm thần học và nhà tâm lý trị liệu người Áo. Ông là người sống sót sau Holocaust và sáng lập liệu pháp ý nghĩa. Cuốn sách "Man''s Search for Meaning" là di sản của ông.',
 'Giữa kích thích và phản ứng có một khoảng trống. Trong khoảng trống đó là quyền tự do lựa chọn của chúng ta.',
 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=600'),

-- Roman Emperor
('Marcus Aurelius', 'La Mã', 121, 180,
 'Marcus Aurelius (121-180) là hoàng đế La Mã và triết gia theo trường phái Khắc kỷ. Tác phẩm "Meditations" của ông là một trong những tác phẩm triết học vĩ đại nhất, viết trong thời gian ông chỉ huy quân đội.',
 'Bạn có quyền lực trên tâm trí của mình, không phải các sự kiện bên ngoài. Nhận ra điều này, bạn sẽ tìm thấy sức mạnh.',
 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600'),

-- French Author
('Jules Verne', 'Pháp', 1828, 1905,
 'Jules Verne (1828-1905) là nhà văn người Pháp, được coi là cha đẻ của thể loại khoa học viễn tưởng. Tác phẩm của ông như "Twenty Thousand Leagues Under the Sea" và "Around the World in Eighty Days" đã tiên đoán nhiều phát minh khoa học.',
 'Bất cứ điều gì một người có thể tưởng tượng, người khác có thể biến nó thành hiện thực.',
 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600'),

-- Swedish Author
('Stieg Larsson', 'Thụy Điển', 1954, 2004,
 'Stieg Larsson (1954-2004) là nhà báo và tác giả người Thụy Điển. Series "Millennium" của ông, bắt đầu với "The Girl with the Dragon Tattoo", đã trở thành hiện tượng toàn cầu sau khi ông qua đời.',
 'Tình bạn - sự gắn kết của tôi với bạn - là điều quan trọng đối với tôi.',
 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600'),

-- Chinese Author
('Liu Cixin', 'Trung Quốc', 1963, NULL,
 'Liu Cixin là nhà văn khoa học viễn tưởng người Trung Quốc. Tiểu thuyết "The Three-Body Problem" của ông đã giành giải Hugo năm 2015, là tác giả châu Á đầu tiên đạt được vinh dự này.',
 'Vũ trụ là một khu rừng tối, mỗi nền văn minh là một thợ săn.',
 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=600'),

-- Japanese Author
('Reki Kawahara', 'Nhật Bản', 1974, NULL,
 'Reki Kawahara là tác giả light novel người Nhật Bản, nổi tiếng với series "Sword Art Online". Tác phẩm của ông về thế giới game ảo đã trở thành hiện tượng văn hóa và được chuyển thể thành anime thành công.',
 'Trong thế giới ảo, cảm xúc của chúng ta vẫn là thật.',
 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600'),

-- American Authors (continued)
('Patrick Rothfuss', 'Mỹ', 1973, NULL,
 'Patrick Rothfuss là tác giả kỳ ảo người Mỹ, nổi tiếng với series "The Kingkiller Chronicle". Phong cách viết của ông kết hợp giữa kỳ ảo và văn học, tạo nên những câu chuyện sâu sắc về âm nhạc, ma thuật và tình yêu.',
 'Đó là những câu chuyện nhỏ nhặt làm nên một cuộc đời.',
 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600'),

('Nicholas Sparks', 'Mỹ', 1965, NULL,
 'Nicholas Sparks là tiểu thuyết gia người Mỹ, chuyên viết truyện lãng mạn. Nhiều tác phẩm của ông như "The Notebook", "A Walk to Remember" đã được chuyển thể thành phim điện ảnh thành công.',
 'Tình yêu thực sự là về sự hy sinh và cam kết.',
 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600'),

('Eckhart Tolle', 'Đức', 1948, NULL,
 'Eckhart Tolle là tác giả và giáo viên tâm linh người Đức. Cuốn sách "The Power of Now" của ông đã bán được hàng triệu bản, dạy về sống trong hiện tại và tỉnh thức.',
 'Nhận ra rằng khoảnh khắc hiện tại là tất cả những gì bạn có.',
 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=600'),

-- British Authors (continued)
('Jojo Moyes', 'Anh', 1969, NULL,
 'Jojo Moyes là tiểu thuyết gia người Anh, nổi tiếng với tiểu thuyết "Me Before You". Tác phẩm của bà thường xoay quanh các mối quan hệ con người và những quyết định khó khăn trong cuộc sống.',
 'Đôi khi bạn phải làm những điều bạn không muốn làm, và đôi khi bạn không có lựa chọn nào khác.',
 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600'),

('Eric Carle', 'Mỹ', 1929, 2021,
 'Eric Carle (1929-2021) là họa sĩ minh họa và tác giả sách thiếu nhi người Mỹ gốc Đức. Cuốn sách "The Very Hungry Caterpillar" của ông đã bán được hơn 50 triệu bản và được dịch ra 66 ngôn ngữ.',
 'Tôi tin rằng trẻ em là những người đọc tự nhiên.',
 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600'),

('Bruce Barnbaum', 'Mỹ', 1943, NULL,
 'Bruce Barnbaum là nhiếp ảnh gia và tác giả người Mỹ, nổi tiếng với nghệ thuật nhiếp ảnh phong cảnh đen trắng. Cuốn sách "The Art of Photography" của ông là tài liệu kinh điển về nghệ thuật nhiếp ảnh.',
 'Nhiếp ảnh là nghệ thuật của việc nhìn.',
 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600'),

('Johanna Basford', 'Anh', 1983, NULL,
 'Johanna Basford là họa sĩ minh họa người Scotland, nổi tiếng với các sách tô màu dành cho người lớn. Cuốn "Secret Garden" của bà đã khởi đầu trào lưu tô màu cho người lớn trên toàn thế giới.',
 'Nghệ thuật là cách để tìm thấy sự bình yên trong cuộc sống bận rộn.',
 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600'),

('Daniel Kahneman', 'Israel', 1934, NULL,
 'Daniel Kahneman là nhà tâm lý học người Israel-Mỹ, đoạt giải Nobel Kinh tế năm 2002. Cuốn sách "Thinking, Fast and Slow" của ông giải thích hai hệ thống tư duy của con người.',
 'Chúng ta có thể bị mù quáng trước những điều hiển nhiên, và chúng ta cũng mù quáng với sự mù quáng của mình.',
 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600'),

('Martin Seligman', 'Mỹ', 1942, NULL,
 'Martin Seligman là nhà tâm lý học người Mỹ, được coi là cha đẻ của tâm lý học tích cực. Ông đã chuyển hướng tâm lý học từ việc chữa bệnh sang việc xây dựng hạnh phúc và ý nghĩa cuộc sống.',
 'Hạnh phúc không phải là kết quả của gen tốt hay may mắn.',
 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=600'),

-- Generic for multiple authors books
('Nhiều tác giả', 'Quốc tế', NULL, NULL,
 'Đây là các tác phẩm được biên soạn bởi nhiều tác giả khác nhau, thường là các sách giáo khoa, sách tham khảo hoặc tuyển tập.',
 'Sự hợp tác tạo nên sức mạnh.',
 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600')

ON CONFLICT (name) DO NOTHING;

-- Now link all books to their authors
INSERT INTO book_authors (book_id, author_id, author_order)
SELECT 
    b.book_id,
    a.author_id,
    1 as author_order
FROM books b
INNER JOIN authors a ON TRIM(b.author) = TRIM(a.name)
WHERE NOT EXISTS (
    SELECT 1 FROM book_authors ba 
    WHERE ba.book_id = b.book_id AND ba.author_id = a.author_id
)
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
