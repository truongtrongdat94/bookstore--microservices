import { Card } from './ui/card';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useNavigate, useParams } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuthor, useAuthorBooks } from '../hooks/useAuthors';

// CSS styles for international character support - consistent with AuthorsPage
const internationalTextStyle: React.CSSProperties = {
  fontFamily: '"Inter", "Noto Sans", "Noto Sans SC", "Noto Sans JP", "Noto Sans KR", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  textRendering: 'optimizeLegibility',
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
};

export function AuthorDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  
  const authorId = id ? parseInt(id, 10) : undefined;
  
  const { data: author, isLoading: isLoadingAuthor, error: authorError } = useAuthor(authorId);
  const { data: books = [], isLoading: isLoadingBooks, error: booksError } = useAuthorBooks(authorId);

  // Loading state
  if (isLoadingAuthor || isLoadingBooks) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B5E20] mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải thông tin tác giả...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state - Author not found
  if (authorError || !author) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <h3 className="mb-4 text-red-600">Không tìm thấy tác giả</h3>
          <p className="text-gray-600 mb-6">
            Tác giả bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
          </p>
          <Button onClick={() => navigate('/authors')} className="bg-[#1B5E20] hover:bg-[#0d3d13]">
            Quay lại danh sách tác giả
          </Button>
        </Card>
      </div>
    );
  }

  // Error state - Books fetch failed
  if (booksError) {
    console.error('Error loading author books:', booksError);
  }

  // Format birth/death year display
  const yearDisplay = author.death_year 
    ? `${author.birth_year} - ${author.death_year}`
    : author.birth_year 
    ? `Sinh năm ${author.birth_year}`
    : '';

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      {/* Author Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
        {/* Left - Image */}
        <div className="lg:col-span-1">
          <Card className="overflow-hidden sticky top-24">
            <div className="aspect-square overflow-hidden">
              <ImageWithFallback
                src={author.image_url || ''}
                alt={author.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6 text-center">
              <h3 className="mb-2" style={internationalTextStyle}>{author.name}</h3>
              {author.nationality && (
                <p className="text-gray-600 mb-1" style={internationalTextStyle}>{author.nationality}</p>
              )}
              {yearDisplay && (
                <p className="text-sm text-gray-500">{yearDisplay}</p>
              )}
            </div>
          </Card>
        </div>

        {/* Right - Bio */}
        <div className="lg:col-span-2">
          <h2 className="mb-6">Tiểu sử</h2>
          
          {/* Quote */}
          {author.quote && (
            <Card className="p-6 bg-gradient-to-br from-[#1B5E20]/5 to-[#2e7d32]/5 border-l-4 border-[#1B5E20] mb-6">
              <p className="italic text-gray-700" style={internationalTextStyle}>{author.quote}</p>
            </Card>
          )}

          {/* Biography */}
          {author.bio ? (
            <div className="prose max-w-none" style={internationalTextStyle}>
              {author.bio.split('\n\n').map((paragraph, index) => (
                <p key={index} className="mb-4 text-gray-700">
                  {paragraph}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">Chưa có thông tin tiểu sử cho tác giả này.</p>
          )}
        </div>
      </div>

      {/* Books by Author */}
      <section>
        <h3 className="mb-6">Tác phẩm của {author.name}</h3>
        
        {booksError && (
          <Card className="p-6 mb-6 bg-red-50 border-red-200">
            <p className="text-red-600">Không thể tải danh sách sách. Vui lòng thử lại sau.</p>
          </Card>
        )}
        
        {!booksError && books.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-600">Chưa có tác phẩm nào của tác giả này trong hệ thống.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {books.map((book) => (
              <Card key={book.book_id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div
                  className="aspect-[3/4] overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/books/${book.book_id}`)}
                >
                  <ImageWithFallback
                    src={book.cover_image_url || ''}
                    alt={book.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h5
                    className="mb-1 line-clamp-2 cursor-pointer hover:text-[#1B5E20]"
                    onClick={() => navigate(`/books/${book.book_id}`)}
                  >
                    {book.title}
                  </h5>
                  {book.publication_date && (
                    <p className="text-xs text-gray-500 mb-2">
                      {new Date(book.publication_date).getFullYear()}
                    </p>
                  )}
                  <p className="text-[#1B5E20] mb-3">
                    {book.price?.toLocaleString('vi-VN')}đ
                  </p>
                  <Button
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      if (typeof addToCart === 'function') {
                        addToCart({ bookId: book.book_id, quantity: 1 } as any);
                      }
                    }}
                    size="sm"
                    className="w-full bg-[#1B5E20] hover:bg-[#0d3d13]"
                  >
                    Thêm giỏ
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
