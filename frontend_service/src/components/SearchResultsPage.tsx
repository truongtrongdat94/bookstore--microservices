import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { booksApi, SearchedBook } from '../api/books';
import { useQuery } from '@tanstack/react-query';

export function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 12;

  // Fetch search results
  const { data, isLoading, error } = useQuery({
    queryKey: ['search', query, page, limit],
    queryFn: () => booksApi.searchBooks({ query, page, limit, highlight: true }),
    enabled: query.length >= 2,
    staleTime: 2 * 60 * 1000,
  });

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setSearchParams({ q: query, page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle book click
  const handleBookClick = (bookId: number) => {
    navigate(`/books/${bookId}`);
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };


  // Render relevance indicator
  const renderRelevanceIndicator = (rank: number) => {
    const percentage = Math.round(rank * 100);
    let color = 'bg-gray-200';
    if (percentage >= 70) color = 'bg-green-500';
    else if (percentage >= 40) color = 'bg-yellow-500';
    else if (percentage > 0) color = 'bg-orange-500';
    
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${color} rounded-full`} 
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span>{percentage}% phù hợp</span>
      </div>
    );
  };

  // Render highlighted text safely
  const renderHighlightedText = (html: string | undefined, fallback: string) => {
    if (!html) return fallback;
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  };

  if (!query || query.length < 2) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-12">
        <div className="text-center">
          <Search size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Nhập từ khóa để tìm kiếm</h2>
          <p className="text-gray-500">Vui lòng nhập ít nhất 2 ký tự để bắt đầu tìm kiếm</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B5E20] mx-auto mb-4"></div>
          <p className="text-gray-500">Đang tìm kiếm "{query}"...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-12">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <Search size={64} className="mx-auto opacity-50" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Có lỗi xảy ra</h2>
          <p className="text-gray-500">Không thể thực hiện tìm kiếm. Vui lòng thử lại sau.</p>
        </div>
      </div>
    );
  }


  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          Kết quả tìm kiếm cho "{query}"
        </h1>
        <p className="text-gray-500">
          {data?.total || 0} kết quả được tìm thấy
        </p>
      </div>

      {/* Empty State */}
      {(!data?.books || data.books.length === 0) && (
        <div className="text-center py-12">
          <Search size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Không tìm thấy kết quả</h2>
          <p className="text-gray-500 mb-4">
            Không có sách nào phù hợp với từ khóa "{query}"
          </p>
          <p className="text-sm text-gray-400">
            Gợi ý: Thử tìm kiếm với từ khóa khác hoặc kiểm tra lại chính tả
          </p>
        </div>
      )}

      {/* Search Results Grid */}
      {data?.books && data.books.length > 0 && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {data.books.map((book: SearchedBook) => (
              <Card 
                key={book.book_id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleBookClick(book.book_id)}
              >
                <CardContent className="p-4">
                  {/* Book Cover */}
                  <div className="aspect-[3/4] bg-gray-100 rounded-lg mb-3 overflow-hidden">
                    {book.cover_image_url ? (
                      <img 
                        src={book.cover_image_url} 
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Search size={32} />
                      </div>
                    )}
                  </div>

                  {/* Book Info */}
                  <div className="space-y-2">
                    {/* Title with highlight */}
                    <h3 className="font-medium text-sm line-clamp-2 min-h-[2.5rem] [&_mark]:bg-yellow-200 [&_mark]:px-0.5">
                      {renderHighlightedText(book.highlightedTitle, book.title)}
                    </h3>

                    {/* Author */}
                    <p className="text-xs text-gray-500 truncate">{book.author}</p>

                    {/* Rating */}
                    {book.average_rating !== undefined && book.average_rating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star size={12} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-gray-600">
                          {book.average_rating.toFixed(1)}
                        </span>
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#1B5E20]">
                        {formatPrice(book.discount_price || book.price)}
                      </span>
                      {book.discount_price && book.discount_price < book.price && (
                        <span className="text-xs text-gray-400 line-through">
                          {formatPrice(book.price)}
                        </span>
                      )}
                    </div>

                    {/* Relevance Indicator */}
                    {renderRelevanceIndicator(book.rank)}

                    {/* Description snippet with highlight */}
                    {book.highlightedDescription && (
                      <p className="text-xs text-gray-500 line-clamp-2 [&_mark]:bg-yellow-200 [&_mark]:px-0.5">
                        {renderHighlightedText(book.highlightedDescription, '')}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>


          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
              >
                <ChevronLeft size={16} />
                Trước
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className={page === pageNum ? 'bg-[#1B5E20] hover:bg-[#2E7D32]' : ''}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
              >
                Sau
                <ChevronRight size={16} />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
