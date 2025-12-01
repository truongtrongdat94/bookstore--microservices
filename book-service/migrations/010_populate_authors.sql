-- Authors Feature Migration - Populate Sample Data
-- This migration inserts 15 diverse authors with complete biographical information

INSERT INTO authors (name, nationality, birth_year, death_year, bio, quote, image_url, website) VALUES

-- Vietnamese Authors
('Nguyễn Nhật Ánh', 'Việt Nam', 1955, NULL,
 'Nguyễn Nhật Ánh là một trong những nhà văn được yêu thích nhất Việt Nam, đặc biệt với độc giả trẻ. Sinh năm 1955 tại Quảng Nam, ông bắt đầu sự nghiệp văn chương từ những năm 1980.

Tác phẩm của Nguyễn Nhật Ánh thường xoay quanh đề tài tuổi thơ, tình bạn và tình yêu trong sáng. Phong cách viết giản dị, gần gũi nhưng đầy cảm xúc đã chạm đến trái tim hàng triệu độc giả.

Một số tác phẩm nổi tiếng: "Mắt Biếc", "Tôi Thấy Hoa Vàng Trên Cỏ Xanh", "Cho Tôi Xin Một Vé Đi Tuổi Thơ". Nhiều tác phẩm của ông đã được chuyển thể thành phim điện ảnh thành công.',
 'Tuổi thơ là khoảng trời rộng lớn trong mỗi tâm hồn, nơi ta có thể trở về bất cứ lúc nào.',
 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600',
 NULL),

('Tô Hoài', 'Việt Nam', 1920, 2014,
 'Tô Hoài (1920-2014) là nhà văn lớn của văn học Việt Nam, đặc biệt nổi tiếng với văn học thiếu nhi. Sinh ra tại Hưng Yên, ông đã cống hiến cả cuộc đời cho sự nghiệp văn chương.

Tác phẩm nổi tiếng nhất của ông là "Dế Mèn Phiêu Lưu Ký" (1941), một kiệt tác văn học thiếu nhi Việt Nam, đã được dịch ra nhiều thứ tiếng và được đưa vào chương trình giáo dục.

Phong cách viết của Tô Hoài mang tính nhân văn sâu sắc, gần gũi với thiên nhiên và con người. Ông đã nhận nhiều giải thưởng văn học cao quý trong suốt sự nghiệp.',
 'Văn chương là để yêu thương con người, để con người tốt đẹp hơn.',
 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=600',
 NULL),

('Nguyễn Du', 'Việt Nam', 1766, 1820,
 'Nguyễn Du (1766-1820) là đại thi hào của dân tộc Việt Nam, tác giả của kiệt tác "Truyện Kiều" - tác phẩm văn học vĩ đại nhất trong lịch sử văn học Việt Nam.

Sinh ra trong một gia đình quan lại, Nguyễn Du đã trải qua nhiều biến cố lịch sử. Ông đã đổ đỗ khoa cử nhưng cuộc đời gặp nhiều thăng trầm, điều này đã ảnh hưởng sâu sắc đến sáng tác của ông.

"Truyện Kiều" với 3.254 câu thơ lục bát đã trở thành biểu tượng văn hóa Việt Nam, thể hiện tài năng xuất chúng của Nguyễn Du trong việc sử dụng ngôn ngữ và khắc họa tâm hồn con người.',
 'Trăm năm trong cõi người ta, chữ tài chữ mệnh khéo là ghét nhau.',
 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600',
 NULL),

-- Japanese Authors
('Haruki Murakami', 'Nhật Bản', 1949, NULL,
 'Haruki Murakami là một trong những nhà văn Nhật Bản được yêu thích nhất trên thế giới. Sinh năm 1949 tại Kyoto, ông bắt đầu sự nghiệp văn chương của mình với tiểu thuyết "Hear the Wind Sing" vào năm 1979.

Tác phẩm của Murakami thường kết hợp giữa hiện thực và siêu thực, tạo nên một phong cách độc đáo và dễ nhận biết. Các nhân vật trong truyện của ông thường là những người trẻ cô đơn, tìm kiếm ý nghĩa trong cuộc sống qua những hành trình kỳ lạ.

Một số tác phẩm nổi tiếng của ông bao gồm "Norwegian Wood", "Kafka on the Shore", "1Q84" và "Killing Commendatore". Sách của Murakami đã được dịch ra hơn 50 ngôn ngữ và bán được hàng triệu bản trên toàn thế giới.',
 'Nếu bạn chỉ đọc những cuốn sách mà mọi người đang đọc, bạn chỉ có thể nghĩ những gì mọi người đang nghĩ.',
 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600',
 'https://www.harukimurakami.com'),

-- British Authors
('J.K. Rowling', 'Anh', 1965, NULL,
 'J.K. Rowling là tác giả của series Harry Potter - một trong những series sách bán chạy nhất mọi thời đại. Sinh năm 1965 tại Yate, Anh, bà đã trải qua nhiều khó khăn trước khi thành công.

Ý tưởng về Harry Potter đến với bà trong một chuyến tàu từ Manchester đến London năm 1990. Sau nhiều năm viết lách trong hoàn cảnh khó khăn, cuốn sách đầu tiên "Harry Potter and the Philosopher''s Stone" được xuất bản năm 1997.

Series Harry Potter gồm 7 cuốn đã bán được hơn 500 triệu bản trên toàn thế giới, được dịch ra 80 ngôn ngữ. Các tác phẩm của bà đã truyền cảm hứng cho hàng triệu độc giả và tạo ra một hiện tượng văn hóa toàn cầu.',
 'Điều quan trọng không phải là khả năng của chúng ta, mà là những lựa chọn của chúng ta.',
 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600',
 'https://www.jkrowling.com'),

('Jane Austen', 'Anh', 1775, 1817,
 'Jane Austen (1775-1817) là một trong những tiểu thuyết gia vĩ đại nhất của văn học Anh. Sinh ra trong một gia đình mục sư ở Hampshire, bà đã viết những tác phẩm bất hủ về xã hội Anh thế kỷ 18-19.

Tác phẩm của Austen nổi tiếng với sự châm biếm tinh tế, khắc họa sắc sảo về xã hội và tâm lý nhân vật. Bà thường viết về cuộc sống của tầng lớp trung lưu, đặc biệt là phụ nữ trong xã hội đương thời.

Các tiểu thuyết nổi tiếng nhất của bà bao gồm "Pride and Prejudice", "Sense and Sensibility", "Emma" và "Persuasion". Tác phẩm của bà vẫn được yêu thích và nghiên cứu rộng rãi cho đến ngày nay.',
 'Không có gì tôi sợ hơn là bị hiểu lầm.',
 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600',
 NULL),

-- American Authors
('Dale Carnegie', 'Mỹ', 1888, 1955,
 'Dale Carnegie (1888-1955) là tác giả, diễn giả và nhà phát triển các khóa học về kỹ năng giao tiếp, bán hàng và quan hệ con người. Sinh ra tại Missouri, ông đã trở thành một trong những người có ảnh hưởng nhất trong lĩnh vực phát triển bản thân.

Tác phẩm nổi tiếng nhất của ông "How to Win Friends and Influence People" (Đắc Nhân Tâm) xuất bản năm 1936 đã bán được hơn 30 triệu bản trên toàn thế giới và vẫn là một trong những cuốn sách về kỹ năng mềm được đọc nhiều nhất.

Triết lý của Carnegie tập trung vào việc xây dựng mối quan hệ tích cực, lắng nghe và thấu hiểu người khác. Các nguyên tắc của ông vẫn có giá trị và được áp dụng rộng rãi trong kinh doanh và cuộc sống.',
 'Hãy quan tâm chân thành đến người khác.',
 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600',
 'https://www.dalecarnegie.com'),

('Eric Ries', 'Mỹ', 1978, NULL,
 'Eric Ries là doanh nhân, blogger và tác giả người Mỹ, nổi tiếng với phương pháp Lean Startup. Sinh năm 1978, ông đã có nhiều kinh nghiệm trong việc xây dựng và phát triển các công ty khởi nghiệp.

Cuốn sách "The Lean Startup" (Khởi Nghiệp Tinh Gọn) của ông xuất bản năm 2011 đã trở thành "kinh thánh" cho các nhà khởi nghiệp trên toàn thế giới. Phương pháp của ông tập trung vào việc xây dựng sản phẩm tối thiểu khả thi (MVP), thử nghiệm và học hỏi nhanh chóng.

Ries đã tư vấn cho nhiều công ty và tổ chức lớn, giúp họ áp dụng tư duy khởi nghiệp tinh gọn. Ông tiếp tục là một diễn giả và cố vấn được săn đón trong cộng đồng khởi nghiệp.',
 'Thành công của startup không phải là thực hiện một kế hoạch hoàn hảo, mà là học hỏi nhanh chóng từ thất bại.',
 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=600',
 'http://theleanstartup.com'),

-- Brazilian Author
('Paulo Coelho', 'Brazil', 1947, NULL,
 'Paulo Coelho là nhà văn Brazil nổi tiếng thế giới, được biết đến nhiều nhất với tiểu thuyết "The Alchemist" (Nhà Giả Kim). Sinh năm 1947 tại Rio de Janeiro, ông đã trải qua một cuộc đời đầy biến động trước khi trở thành nhà văn.

Tác phẩm của Coelho thường mang tính triết lý sâu sắc, kết hợp giữa tâm linh phương Đông và phương Tây. Ông viết về hành trình tìm kiếm ý nghĩa cuộc sống, giấc mơ và số phận.

"The Alchemist" đã được dịch ra 80 ngôn ngữ và bán được hơn 65 triệu bản. Coelho là một trong những tác giả được đọc nhiều nhất thế giới, với hơn 225 triệu sách được bán ra.',
 'Khi bạn muốn một điều gì đó, cả vũ trụ sẽ hợp lực giúp bạn đạt được điều đó.',
 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=600',
 'https://paulocoelhoblog.com'),

-- Israeli Author
('Yuval Noah Harari', 'Israel', 1976, NULL,
 'Yuval Noah Harari là sử gia, triết gia và tác giả người Israel. Sinh năm 1976, ông là giáo sư tại Đại học Hebrew ở Jerusalem, chuyên về lịch sử thế giới và các quá trình vĩ mô.

Cuốn sách "Sapiens: A Brief History of Humankind" (Sapiens: Lược Sử Loài Người) xuất bản năm 2011 đã trở thành hiện tượng toàn cầu, bán được hơn 12 triệu bản. Tiếp theo là "Homo Deus" và "21 Lessons for the 21st Century".

Harari có khả năng đặc biệt trong việc kết nối các sự kiện lịch sử với những vấn đề đương đại, từ công nghệ đến chính trị. Tác phẩm của ông đã được dịch ra hơn 50 ngôn ngữ và được nhiều nhà lãnh đạo thế giới đọc.',
 'Lịch sử bắt đầu khi con người phát minh ra các vị thần, và sẽ kết thúc khi con người trở thành thần.',
 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600',
 'https://www.ynharari.com'),

-- Russian Author
('Leo Tolstoy', 'Nga', 1828, 1910,
 'Leo Tolstoy (1828-1910) là một trong những tiểu thuyết gia vĩ đại nhất mọi thời đại. Sinh ra trong một gia đình quý tộc Nga, ông đã viết những tác phẩm bất hủ về xã hội Nga thế kỷ 19.

"War and Peace" (Chiến Tranh Và Hòa Bình) và "Anna Karenina" được coi là hai trong số những tiểu thuyết vĩ đại nhất trong lịch sử văn học thế giới. Tác phẩm của ông khắc họa sâu sắc tâm lý nhân vật và bức tranh xã hội rộng lớn.

Ngoài văn chương, Tolstoy còn là một nhà tư tưởng đạo đức và xã hội. Ông ủng hộ chủ nghĩa bất bạo động và có ảnh hưởng lớn đến Mahatma Gandhi và nhiều nhà hoạt động xã hội khác.',
 'Tất cả những gia đình hạnh phúc đều giống nhau, mỗi gia đình bất hạnh đều bất hạnh theo cách riêng của nó.',
 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600',
 NULL),

-- Colombian Author
('Gabriel García Márquez', 'Colombia', 1927, 2014,
 'Gabriel García Márquez (1927-2014), thường được gọi là Gabo, là nhà văn Colombia, người đoạt giải Nobel Văn học năm 1982. Ông là một trong những nhà văn quan trọng nhất của văn học Mỹ Latin.

Tác phẩm nổi tiếng nhất của ông "One Hundred Years of Solitude" (Trăm Năm Cô Đơn) được coi là kiệt tác của chủ nghĩa hiện thực huyền ảo. Tiểu thuyết kể về bảy thế hệ của gia đình Buendía ở thị trấn hư cấu Macondo.

Phong cách viết của García Márquez kết hợp giữa hiện thực và yếu tố huyền ảo một cách tự nhiên, tạo nên một thế giới độc đáo. Tác phẩm của ông đã ảnh hưởng sâu rộng đến văn học thế giới.',
 'Cuộc đời không phải là những gì chúng ta đã sống, mà là những gì chúng ta nhớ và cách chúng ta nhớ nó.',
 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600',
 NULL),

-- Afghan-American Author
('Khaled Hosseini', 'Afghanistan', 1965, NULL,
 'Khaled Hosseini là bác sĩ và tiểu thuyết gia người Mỹ gốc Afghanistan. Sinh năm 1965 tại Kabul, ông di cư sang Mỹ năm 1980 sau khi Liên Xô xâm lược Afghanistan.

Tiểu thuyết đầu tay "The Kite Runner" (Người Đua Diều) xuất bản năm 2003 đã trở thành hiện tượng văn học, bán được hơn 31 triệu bản trên toàn thế giới. Tác phẩm kể về tình bạn, sự phản bội và chuộc lỗi trong bối cảnh Afghanistan.

Các tiểu thuyết tiếp theo "A Thousand Splendid Suns" và "And the Mountains Echoed" cũng đều thành công lớn. Hosseini đã quyên góp hàng triệu đô la cho các tổ chức nhân đạo hỗ trợ người dân Afghanistan.',
 'Có thể có nhiều cách để phá hủy một người, nhưng cách chắc chắn nhất là khiến họ cảm thấy vô giá trị.',
 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=600',
 'https://khaledhosseini.com'),

-- American Science Fiction Author
('Frank Herbert', 'Mỹ', 1920, 1986,
 'Frank Herbert (1920-1986) là nhà văn khoa học viễn tưởng người Mỹ, nổi tiếng nhất với series "Dune" - một trong những tác phẩm khoa học viễn tưởng vĩ đại nhất mọi thời đại.

"Dune" xuất bản năm 1965 đã giành được cả giải Hugo và Nebula. Tiểu thuyết xây dựng một vũ trụ phức tạp với chính trị, tôn giáo, sinh thái và triết học đan xen. Hành tinh sa mạc Arrakis và gia vị melange đã trở thành biểu tượng của thể loại.

Herbert đã viết 5 phần tiếp theo cho Dune, tạo nên một series sử thi. Tác phẩm của ông đã ảnh hưởng sâu rộng đến văn học khoa học viễn tưởng và văn hóa đại chúng, được chuyển thể thành phim nhiều lần.',
 'Tôi không được sợ hãi. Sợ hãi là kẻ giết chết tâm trí.',
 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600',
 NULL),

-- British Mystery Author
('Arthur Conan Doyle', 'Anh', 1859, 1930,
 'Sir Arthur Conan Doyle (1859-1930) là bác sĩ và nhà văn người Scotland, nổi tiếng với việc sáng tạo ra thám tử Sherlock Holmes - một trong những nhân vật hư cấu nổi tiếng nhất trong văn học thế giới.

Sherlock Holmes lần đầu xuất hiện trong "A Study in Scarlet" năm 1887. Doyle đã viết 4 tiểu thuyết và 56 truyện ngắn về Holmes và người bạn đồng hành Dr. Watson. Phương pháp suy luận logic của Holmes đã trở thành biểu tượng.

Mặc dù Doyle cũng viết nhiều thể loại khác, nhưng Sherlock Holmes vẫn là di sản lớn nhất của ông. Nhân vật này đã được chuyển thể vô số lần trong phim, truyền hình và sân khấu, vẫn phổ biến cho đến ngày nay.',
 'Khi bạn loại bỏ những điều không thể, dù còn lại điều gì, dù không thể tin được, đó phải là sự thật.',
 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600',
 NULL)

ON CONFLICT (name) DO NOTHING;
