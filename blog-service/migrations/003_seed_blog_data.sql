-- Migration: Seed blog categories and initial blog data
-- Description: Inserts Vietnamese blog categories and migrates existing mock blog posts
-- Date: 2025-11-19
-- Database: PostgreSQL

-- Insert Vietnamese blog categories
INSERT INTO blog_categories (slug, name, description, display_order) VALUES
('tin-uit', 'Tin UIT', 'Tin tức và sự kiện từ UIT', 1),
('review', 'Review sách của độc giả', 'Đánh giá và nhận xét về sách từ độc giả', 2),
('bao-chi', 'Tin sách trên báo chí', 'Tin tức về sách từ các báo chí', 3),
('bien-tap-vien', 'Biên tập viên giới thiệu', 'Giới thiệu sách từ biên tập viên', 4),
('doc-gia', 'Đọc giả', 'Chia sẻ từ cộng đồng độc giả', 5),
('tin-nha-nam', 'Tin Nhã Nam', 'Tin tức từ Nhã Nam', 6);

-- Insert blog posts migrated from mockBlogPosts.ts
INSERT INTO blogs (blog_id, title, slug, excerpt, content, featured_image, category_id, author, is_featured, published_at) VALUES
(1, 
 'Gặp gỡ Jean-Charles Sarrazin và những người kể chuyện về Hà Nội',
 'gap-go-jean-charles-sarrazin-va-nhung-nguoi-ke-chuyen-ve-ha-noi',
 'Một buổi gặp gỡ đặc biệt với các tác giả và những người yêu sách, cùng nhau chia sẻ về Hà Nội qua góc nhìn văn chương.',
 '<p>Hà Nội - thành phố ngàn năm văn hiến, luôn là nguồn cảm hứng bất tận cho các nhà văn, nhà thơ. Trong buổi gặp gỡ đặc biệt này, chúng ta có cơ hội lắng nghe những câu chuyện về Hà Nội từ góc nhìn của Jean-Charles Sarrazin và các tác giả Việt Nam.</p>
    <p>Jean-Charles Sarrazin, một nhà văn người Pháp đã gắn bó với Việt Nam hơn 20 năm, chia sẻ: "Hà Nội không chỉ là một thành phố, mà là một tác phẩm văn học sống động. Mỗi con phố, mỗi góc phố đều có câu chuyện riêng."</p>
    <p>Buổi gặp gỡ diễn ra trong không khí thân mật, với sự tham gia của đông đảo độc giả yêu sách. Đây là dịp để mọi người cùng nhau khám phá Hà Nội qua lăng kính văn chương, qua những trang sách đầy cảm xúc.</p>',
 'https://images.unsplash.com/photo-1660128357991-713518efae48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib29rc3RvcmUlMjBldmVudCUyMHZpZXRuYW18ZW58MXx8fHwxNzYzMDE4NTUyfDA&ixlib=rb-4.1.0&q=80&w=1080',
 4, -- bien-tap-vien
 'Biên tập viên',
 TRUE,
 '2025-11-09 00:00:00'),

(2,
 'Tôn Thất Khiết – Bản đồ tâm hồn của một người trở về',
 'ton-that-khiet-ban-do-tam-hon-cua-mot-nguoi-tro-ve',
 'Cuốn sách là hành trình tìm về cội nguồn, về những ký ức tuổi thơ và mảnh đất quê hương.',
 '<p>"Bản đồ tâm hồn" của Tôn Thất Khiết là một tác phẩm đầy cảm xúc về hành trình trở về của một con người. Qua những trang viết chân thành, tác giả đã khắc họa nên bức tranh sống động về quê hương, về những con người và ký ức tuổi thơ.</p>
    <p>Điểm đặc biệt của cuốn sách là cách tác giả kết hợp giữa ký ức cá nhân và bối cảnh lịch sử xã hội. Mỗi câu chuyện đều mang trong mình những chiều sâu khác nhau, khiến người đọc không chỉ được thưởng thức văn chương mà còn được suy ngẫm về nhiều vấn đề của cuộc sống.</p>
    <p>Đây là một cuốn sách đáng đọc cho những ai đang tìm kiếm sự kết nối với cội nguồn của mình.</p>',
 'https://images.unsplash.com/photo-1592693281721-67ad5dcfa91b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib29rJTIwcmVhZGluZyUyMHBlcnNvbnxlbnwxfHx8fDE3NjMwMTg1NTJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
 2, -- review
 'Nguyễn Văn A',
 TRUE,
 '2025-11-06 00:00:00'),

(3,
 'W. Somerset Maugham và cách nhìn về thế giới văn chương',
 'w-somerset-maugham-va-cach-nhin-ve-the-gioi-van-chuong',
 'Khám phá tư duy văn chương độc đáo của một trong những nhà văn vĩ đại nhất thế kỷ 20.',
 '<p>W. Somerset Maugham (1874-1965) là một trong những nhà văn được đọc nhiều nhất trong thế kỷ 20. Tác phẩm của ông không chỉ nổi tiếng về mặt nghệ thuật mà còn mang tính giải trí cao.</p>
    <p>Phong cách viết của Maugham được đánh giá là rõ ràng, súc tích và đầy sức hút. Ông có khả năng kể chuyện tuyệt vời, biết cách tạo ra những tình huống kịch tính và những nhân vật sống động.</p>
    <p>Các tác phẩm nổi tiếng của ông như "Mặt trăng và đồng xu", "Xiềng xích nhân sinh" đã trở thành kinh điển của văn học thế giới, được dịch ra nhiều thứ tiếng và đọc rộng rãi khắp nơi.</p>',
 'https://images.unsplash.com/photo-1734082134691-c9adaa8d6e2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaXRlcmF0dXJlJTIwYXV0aG9yJTIwd3JpdGluZyVlbnwxfHx8fDE3NjMwMTg1NTJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
 3, -- bao-chi
 'Báo Văn Hóa',
 TRUE,
 '2025-11-05 00:00:00'),

(4,
 'Peter Su và Summers: Sadie là tiếng nói của những cô gái',
 'peter-su-va-summers-sadie-la-tieng-noi-cua-nhung-co-gai',
 'Cuốn sách mới nhất của Peter Su và Summers mang đến góc nhìn tươi mới về thế giới nội tâm của phụ nữ trẻ.',
 '<p>"Sadie" là tác phẩm hợp tác đầy ấn tượng giữa Peter Su và Summers. Cuốn sách kể về hành trình trưởng thành của một cô gái trẻ trong xã hội hiện đại, với những vấn đề về tình yêu, sự nghiệp và tìm kiếm bản thân.</p>
    <p>Điểm nổi bật của cuốn sách là cách hai tác giả khéo léo kết hợp giữa văn xuôi và hình ảnh minh họa. Mỗi trang sách đều là một tác phẩm nghệ thuật, vừa đẹp mắt vừa sâu sắc về nội dung.</p>
    <p>Sadie đại diện cho thế hệ trẻ ngày nay - những người dám mơ, dám làm và không ngừng tìm kiếm ý nghĩa cuộc sống.</p>',
 'https://images.unsplash.com/photo-1725711028497-baa7469ac4a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib29rJTIwaWxsdXN0cmF0aW9uJTIwYXJ0fGVufDF8fHx8MTc2MzAxNzQ2Mnww&ixlib=rb-4.1.0&q=80&w=1080',
 6, -- tin-nha-nam
 'Nhã Nam',
 FALSE,
 '2025-11-04 00:00:00'),

(5,
 'Văn chương chạm đến giới hạn cuối cùng của con người',
 'van-chuong-cham-den-gioi-han-cuoi-cung-cua-con-nguoi',
 'Suy ngẫm về vai trò của văn chương trong việc khám phá bản chất con người.',
 '<p>Văn chương luôn là công cụ mạnh mẽ để con người khám phá chính mình. Qua những trang sách, chúng ta được đối diện với những câu hỏi lớn về ý nghĩa cuộc sống, về tình yêu, về cái chết.</p>
    <p>Những tác phẩm văn học vĩ đại không chỉ giải trí mà còn thách thức người đọc, đưa họ đến những giới hạn của tư duy và cảm xúc. Đó là lúc văn chương thực sự phát huy sức mạnh của nó.</p>
    <p>Như Dostoevsky đã viết, văn chương là nơi con người có thể tìm thấy sự cứu rỗi, nơi họ có thể đối diện với những mặt tối nhất của bản thân và vẫn tìm được hy vọng.</p>',
 'https://images.unsplash.com/photo-1622132403461-5b32cf1115b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0eXBld3JpdGVyJTIwdmludGFnZSUyMHdyaXRpbmd8ZW58MXx8fHwxNzYyOTUxOTg5fDA&ixlib=rb-4.1.0&q=80&w=1080',
 5, -- doc-gia
 'Trần Thị B',
 FALSE,
 '2025-11-03 00:00:00'),

(6,
 'Haruki Murakami và thế giới siêu thực trong văn chương Nhật Bản',
 'haruki-murakami-va-the-gioi-sieu-thuc-trong-van-chuong-nhat-ban',
 'Khám phá phong cách độc đáo của Murakami và ảnh hưởng của ông đến văn học đương đại.',
 '<p>Haruki Murakami là một trong những nhà văn Nhật Bản được yêu thích nhất trên thế giới. Phong cách viết của ông kết hợp giữa hiện thực và siêu thực, tạo nên một thế giới văn chương độc đáo.</p>
    <p>Các tác phẩm của Murakami thường xoay quanh những nhân vật cô đơn, lạc lõng trong xã hội hiện đại. Họ tìm kiếm ý nghĩa cuộc sống qua những hành trình kỳ lạ, đầy màu sắc siêu thực.</p>
    <p>Điểm đặc biệt trong văn phong Murakami là sự kết hợp giữa văn hóa phương Đông và phương Tây, tạo nên một phong cách hoàn toàn mới mẻ và hấp dẫn.</p>',
 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
 4, -- bien-tap-vien
 'Biên tập viên',
 FALSE,
 '2025-11-02 00:00:00'),

(7,
 'Những cuốn sách hay nhất về tâm lý học năm 2025',
 'nhung-cuon-sach-hay-nhat-ve-tam-ly-hoc-nam-2025',
 'Tổng hợp những cuốn sách tâm lý học đáng đọc nhất trong năm qua.',
 '<p>Năm 2025 chứng kiến sự ra đời của nhiều cuốn sách tâm lý học chất lượng. Dưới đây là những cuốn sách được độc giả đánh giá cao nhất:</p>
    <p>1. "Tâm lý học của hạnh phúc" - Khám phá những yếu tố tạo nên hạnh phúc thực sự.<br/>
    2. "Nghệ thuật tư duy tích cực" - Hướng dẫn cách thay đổi tư duy để cải thiện cuộc sống.<br/>
    3. "Hiểu về bản thân" - Công cụ để khám phá và phát triển bản thân.</p>
    <p>Mỗi cuốn sách đều mang đến những góc nhìn mới mẻ và hữu ích cho người đọc.</p>',
 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
 2, -- review
 'Lê Văn C',
 FALSE,
 '2025-11-01 00:00:00'),

(8,
 'Gabriel García Márquez và chủ nghĩa hiện thực thần kỳ',
 'gabriel-garcia-marquez-va-chu-nghia-hien-thuc-than-ky',
 'Tìm hiểu về phong cách văn chương độc đáo của tác giả "Trăm năm cô đơn".',
 '<p>Gabriel García Márquez, tác giả người Colombia, là người tiên phong của trường phái hiện thực thần kỳ trong văn học. Tác phẩm nổi tiếng nhất của ông, "Trăm năm cô đơn", đã trở thành kinh điển của văn học thế giới.</p>
    <p>Hiện thực thần kỳ là phong cách kết hợp giữa yếu tố thực tế và yếu tố kỳ ảo một cách tự nhiên. Trong thế giới của Márquez, những điều kỳ diệu xảy ra như một phần của cuộc sống hàng ngày.</p>
    <p>Ảnh hưởng của Márquez đến văn học thế giới là không thể phủ nhận. Ông đã mở ra một cách nhìn mới về văn chương, ảnh hưởng đến hàng loạt nhà văn sau này.</p>',
 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
 3, -- bao-chi
 'Báo Tuổi Trẻ',
 FALSE,
 '2025-10-31 00:00:00'),

(9,
 'Ra mắt bộ sách "Văn học Việt Nam đương đại"',
 'ra-mat-bo-sach-van-hoc-viet-nam-duong-dai',
 'Nhã Nam giới thiệu bộ sách tổng hợp những tác phẩm văn học Việt Nam xuất sắc nhất.',
 '<p>Nhà xuất bản Nhã Nam vừa ra mắt bộ sách "Văn học Việt Nam đương đại", tổng hợp những tác phẩm xuất sắc của các nhà văn Việt Nam trong 20 năm qua.</p>
    <p>Bộ sách gồm 10 tập, mỗi tập tập trung vào một chủ đề hoặc một nhóm tác giả. Đây là công trình biên soạn công phu, với sự tham gia của nhiều nhà nghiên cứu văn học hàng đầu.</p>
    <p>Mục đích của bộ sách là giới thiệu đến độc giả một bức tranh toàn cảnh về văn học Việt Nam đương đại, từ đó giúp người đọc hiểu rõ hơn về sự phát triển của nền văn học nước nhà.</p>',
 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400',
 6, -- tin-nha-nam
 'Nhã Nam',
 FALSE,
 '2025-10-30 00:00:00'),

(10,
 'Đọc sách - Hành trình tìm về chính mình',
 'doc-sach-hanh-trinh-tim-ve-chinh-minh',
 'Chia sẻ về trải nghiệm đọc sách và những thay đổi tích cực trong cuộc sống.',
 '<p>Đọc sách đã thay đổi cuộc đời tôi theo nhiều cách. Từ một người ít đọc sách, tôi dần trở thành người không thể sống thiếu sách.</p>
    <p>Mỗi cuốn sách là một hành trình mới, một cơ hội để khám phá thế giới và chính bản thân mình. Qua sách, tôi học được cách nhìn nhận cuộc sống từ nhiều góc độ khác nhau.</p>
    <p>Đọc sách không chỉ mở rộng kiến thức mà còn giúp tôi trở nên bình tĩnh hơn, suy nghĩ sâu sắc hơn. Đó là món quà quý giá nhất mà tôi tự tặng cho mình.</p>',
 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400',
 5, -- doc-gia
 'Phạm Thị D',
 FALSE,
 '2025-10-29 00:00:00'),

(11,
 'Nguyễn Nhật Ánh và thế giới tuổi thơ trong văn chương',
 'nguyen-nhat-anh-va-the-gioi-tuoi-tho-trong-van-chuong',
 'Khám phá sức hút của những câu chuyện tuổi thơ trong tác phẩm của Nguyễn Nhật Ánh.',
 '<p>Nguyễn Nhật Ánh là cái tên không còn xa lạ với độc giả Việt Nam. Các tác phẩm của ông như "Tôi thấy hoa vàng trên cỏ xanh", "Mắt biếc" đã trở thành hiện tượng văn học.</p>
    <p>Điểm đặc biệt trong văn phong của Nguyễn Nhật Ánh là khả năng tái hiện thế giới tuổi thơ một cách chân thực và đầy cảm xúc. Những câu chuyện của ông luôn chạm đến trái tim người đọc.</p>
    <p>Qua những trang sách, ông đã giúp nhiều người tìm lại những ký ức tuổi thơ đẹp đẽ, những cảm xúc trong sáng mà có lẽ họ đã quên lãng.</p>',
 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=400',
 4, -- bien-tap-vien
 'Biên tập viên',
 FALSE,
 '2025-10-28 00:00:00'),

(12,
 'Top 10 cuốn tiểu thuyết trinh thám hay nhất mọi thời đại',
 'top-10-cuon-tieu-thuyet-trinh-tham-hay-nhat-moi-thoi-dai',
 'Danh sách những cuốn tiểu thuyết trinh thám kinh điển không thể bỏ qua.',
 '<p>Tiểu thuyết trinh thám luôn là thể loại được yêu thích với những tình tiết hấp dẫn và bất ngờ. Dưới đây là 10 cuốn sách trinh thám hay nhất:</p>
    <p>1. "Án mạng trên sông Nile" - Agatha Christie<br/>
    2. "Sherlock Holmes" - Arthur Conan Doyle<br/>
    3. "Cô gái tàu điện ngầm" - Stieg Larsson<br/>
    4. "Mật mã Da Vinci" - Dan Brown<br/>
    5. "Và rồi chẳng còn ai" - Agatha Christie</p>
    <p>Mỗi cuốn sách đều là một kiệt tác, mang đến những giờ phút giải trí tuyệt vời cho người đọc.</p>',
 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400',
 2, -- review
 'Hoàng Văn E',
 FALSE,
 '2025-10-27 00:00:00');
