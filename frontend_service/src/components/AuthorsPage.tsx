import { useNavigate } from 'react-router-dom';
import { Card } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useAuthors } from '../hooks/useAuthors';
import { Author } from '../types/author';

// CSS styles for international character support
const internationalTextStyle: React.CSSProperties = {
  fontFamily: '"Inter", "Noto Sans", "Noto Sans SC", "Noto Sans JP", "Noto Sans KR", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  textRendering: 'optimizeLegibility',
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
};

export function AuthorsPage() {
  const navigate = useNavigate();
  const { data: authors, isLoading, error } = useAuthors();

  const handleNavigateToAuthor = (authorId: number) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate(`/authors/${authorId}`);
  };

  if (isLoading) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="mb-2">Các tác giả</h2>
          <p className="text-gray-600">Khám phá các tác giả nổi tiếng và tác phẩm của họ</p>
        </div>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B5E20] mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải danh sách tác giả...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="mb-2">Các tác giả</h2>
          <p className="text-gray-600">Khám phá các tác giả nổi tiếng và tác phẩm của họ</p>
        </div>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-800 font-medium mb-2">Không thể tải danh sách tác giả</p>
            <p className="text-gray-600 text-sm">Vui lòng thử lại sau</p>
          </div>
        </div>
      </div>
    );
  }

  if (!authors || authors.length === 0) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="mb-2">Các tác giả</h2>
          <p className="text-gray-600">Khám phá các tác giả nổi tiếng và tác phẩm của họ</p>
        </div>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-gray-800 font-medium mb-2">Chưa có tác giả nào</p>
            <p className="text-gray-600 text-sm">Danh sách tác giả đang được cập nhật</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="mb-2">Các tác giả</h2>
        <p className="text-gray-600">Khám phá các tác giả nổi tiếng và tác phẩm của họ</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {authors.map((author: Author) => (
          <Card
            key={author.author_id}
            className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleNavigateToAuthor(author.author_id)}
          >
            <div className="aspect-square overflow-hidden">
              <ImageWithFallback
                src={author.image_url || ''}
                alt={author.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-4 text-center">
              <h5 className="mb-1" style={internationalTextStyle}>{author.name}</h5>
              <p className="text-sm text-gray-600 mb-2" style={internationalTextStyle}>{author.nationality || 'Không rõ'}</p>
              <p className="text-xs text-[#1B5E20]">{author.book_count || 0} tác phẩm</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
