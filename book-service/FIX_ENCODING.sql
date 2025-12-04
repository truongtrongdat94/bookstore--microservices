-- Fix Vietnamese encoding for all books
\c books_db;

-- Update books 11-20 (Vietnamese books)
UPDATE books SET 
  title = 'Tôi Thấy Hoa Vàng Trên Cỏ Xanh',
  author = 'Nguyễn Nhật Ánh',
  description = 'Truyện kể về tuổi thơ dữ dội và tươi đẹp của hai anh em Thiều và Tường ở một vùng quê Việt Nam.',
  publisher = 'Nhã Nam',
  language = 'Tiếng Việt'
WHERE book_id = 11;

UPDATE books SET 
  title = 'Mắt Biếc',
  author = 'Nguyễn Nhật Ánh',
  description = 'Câu chuyện tình đầu trong sáng và đẹp đẽ của Ngạn dành cho Hà Lan.',
  publisher = 'Nhã Nam',
  language = 'Tiếng Việt'
WHERE book_id = 12;

UPDATE books SET 
  title = 'Kafka Bên Bờ Biển',
  description = 'Kiệt tác văn học Nhật Bản về hành trình tìm kiếm chính mình của một cậu thiếu niên.',
  publisher = 'Nhã Nam',
  language = 'Tiếng Việt'
WHERE book_id = 13;

UPDATE books SET 
  title = 'Nhà Giả Kim',
  description = 'Câu chuyện ngụ ngôn về hành trình theo đuổi ước mơ và tìm kiếm kho báu của mình.',
  publisher = 'Nhã Nam',
  language = 'Tiếng Việt'
WHERE book_id = 14;

UPDATE books SET 
  title = 'Sapiens: Lược Sử Loài Người',
  description = 'Cuốn sách về lịch sử tiến hóa của loài người từ thời tiền sử đến hiện đại.',
  publisher = 'Nhã Nam',
  language = 'Tiếng Việt'
WHERE book_id = 15;

UPDATE books SET 
  title = 'Homo Deus: Lược Sử Tương Lai',
  description = 'Tác phẩm về tương lai của nhân loại trong thời đại công nghệ và trí tuệ nhân tạo.',
  publisher = 'Nhã Nam',
  language = 'Tiếng Việt'
WHERE book_id = 16;

UPDATE books SET 
  title = 'Đắc Nhân Tâm',
  description = 'Cuốn sách kinh điển về nghệ thuật giao tiếp và ứng xử để thành công trong cuộc sống.',
  publisher = 'Nhã Nam',
  language = 'Tiếng Việt'
WHERE book_id = 17;

UPDATE books SET 
  title = 'Tư Duy Nhanh Và Chậm',
  description = 'Khám phá hai hệ thống tư duy của con người và cách chúng ảnh hưởng đến quyết định.',
  publisher = 'Nhã Nam',
  language = 'Tiếng Việt'
WHERE book_id = 18;

UPDATE books SET 
  title = '1Q84 - Tập 1',
  description = 'Tiểu thuyết kỳ ảo về hai nhân vật sống trong hai thế giới song song năm 1984.',
  publisher = 'Nhã Nam',
  language = 'Tiếng Việt'
WHERE book_id = 19;

UPDATE books SET 
  title = 'Nghệ Thuật Sống Đẹp',
  description = 'Những triết lý sống giúp con người tìm thấy hạnh phúc trong cuộc sống.',
  publisher = 'Nhã Nam',
  language = 'Tiếng Việt'
WHERE book_id = 20;

-- Update categories
UPDATE categories SET 
  name = 'Văn học',
  description = 'Sách văn học trong và ngoài nước'
WHERE category_id = 14;

UPDATE categories SET 
  name = 'Văn học Việt Nam',
  description = 'Tác phẩm văn học Việt Nam'
WHERE name LIKE '%Van hoc%' AND name LIKE '%Viet Nam%';

UPDATE categories SET 
  name = 'Văn học nước ngoài',
  description = 'Tác phẩm văn học dịch'
WHERE name LIKE '%Van hoc%' AND name LIKE '%nuoc ngoai%';

UPDATE categories SET 
  name = 'Kinh tế',
  description = 'Sách về kinh tế, tài chính, đầu tư'
WHERE name LIKE '%Kinh te%';

UPDATE categories SET 
  name = 'Kỹ năng sống',
  description = 'Sách phát triển bản thân'
WHERE name LIKE '%Ky nang%';

UPDATE categories SET 
  name = 'Khoa học',
  description = 'Sách khoa học phổ thông'
WHERE name LIKE '%Khoa hoc%';

UPDATE categories SET 
  name = 'Tâm lý',
  description = 'Sách tâm lý học'
WHERE name LIKE '%Tam ly%';

UPDATE categories SET 
  name = 'Triết học',
  description = 'Sách triết học'
WHERE name LIKE '%Triet hoc%';

-- Verification
SELECT 'Books updated successfully' as status;
SELECT book_id, title, author, language FROM books WHERE book_id >= 11 ORDER BY book_id;
