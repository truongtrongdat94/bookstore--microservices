import { Button } from './ui/button';
import { Card } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useNavigate } from 'react-router-dom';
import { useNewReleases, useBestsellers } from '../hooks/useBooks';
import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { authorsApi } from '../api/authors';
import { Author } from '../types';

// Performance: Lazy load BlogSection - it's below the fold
const BlogSection = lazy(() => import('./BlogSection').then(m => ({ default: m.BlogSection })));

// Skeleton components for faster FCP
function AuthorSkeleton() {
  return (
    <div className="flex flex-col items-center">
      <div className="w-24 h-24 rounded-full bg-gray-200 mb-3" />
      <div className="h-4 w-16 bg-gray-200 rounded" />
    </div>
  );
}

function BookCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-[3/4] bg-gray-200" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
      </div>
    </Card>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const { data: newBooksData, isLoading: isLoadingNewBooks } = useNewReleases(5);
  const { data: bestsellersData, isLoading: isLoadingBestsellers } = useBestsellers(4);
  
  // Fetch top authors by sales
  const [topAuthors, setTopAuthors] = useState<Author[]>([]);
  const [isLoadingAuthors, setIsLoadingAuthors] = useState(true);
  
  useEffect(() => {
    const fetchTopAuthors = async () => {
      try {
        const authors = await authorsApi.getTopAuthorsBySales(6);
        setTopAuthors(authors);
      } catch (error) {
        console.error('Error fetching top authors:', error);
      } finally {
        setIsLoadingAuthors(false);
      }
    };
    
    fetchTopAuthors();
  }, []);

  // Real data from API
  const newBooks = newBooksData || [];
  const recommendations = bestsellersData || [];

  // Performance: Memoize formatPrice to avoid recreation
  const formatPrice = useMemo(() => {
    const formatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
    return (price: number) => formatter.format(price);
  }, []);

  // Handle navigation with scroll to top
  const handleNavigateToBook = (bookId: number) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate(`/books/${bookId}`);
  };


  return (
    <div>
      {/* Hero Banner */}
      <section className="relative h-[500px] bg-gradient-to-r from-[#1B5E20] to-[#2e7d32] text-white">
        {/* LCP Image - Optimized: smaller size, lower quality for 20% opacity overlay */}
        <img
          src="https://images.unsplash.com/photo-1699544006887-72b4f965e785?w=600&q=30&fm=webp&auto=format"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-20"
          fetchPriority="high"
          loading="eager"
          decoding="sync"
          width={600}
          height={250}
        />
        <div className="relative max-w-[1200px] mx-auto px-4 h-full flex flex-col justify-center">
          <h1 className="text-white mb-4">Nhà Xuất Bản UIT</h1>
          <p className="text-xl mb-8 text-white/90">Bởi vì sách là thế giới - Khám phá kho tàng văn học đặc sắc</p>
          <div>
            <Button 
              onClick={() => navigate('/books')}
              className="bg-white text-[#1B5E20] hover:bg-white/90"
            >
              Xem thêm
            </Button>
          </div>
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-4">
        {/* Authors Section */}
        <section className="py-16">
          <h2 className="mb-8 text-center">Các tác giả</h2>
          {isLoadingAuthors ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {[...Array(6)].map((_, i) => <AuthorSkeleton key={i} />)}
            </div>
          ) : topAuthors.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Chưa có tác giả nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {topAuthors.map((author) => (
                <div 
                  key={author.author_id} 
                  className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => navigate(`/authors/${author.author_id}`)}
                >
                  <div className="w-24 h-24 rounded-full overflow-hidden mb-3 border-2 border-[#1B5E20]">
                    <ImageWithFallback 
                      src={author.image_url} 
                      alt={author.name}
                      className="w-full h-full object-cover"
                      displayWidth={96}
                      aspectRatio="1/1"
                      placeholderType="author"
                    />
                  </div>
                  <p className="text-center text-sm">{author.name}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* New Books Section */}
        <section className="py-16">
          <h2 className="mb-8">Sách mới</h2>
          {isLoadingNewBooks ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {[...Array(5)].map((_, i) => <BookCardSkeleton key={i} />)}
            </div>
          ) : newBooks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Chưa có sách mới</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {newBooks.map((book) => (
                <Card 
                  key={book.book_id} 
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleNavigateToBook(book.book_id)}
                >
                  <div className="aspect-[3/4] overflow-hidden">
                    <ImageWithFallback 
                      src={book.cover_image_url} 
                      alt={book.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      displayWidth={200}
                      aspectRatio="3/4"
                      placeholderType="book"
                    />
                  </div>
                  <div className="p-4">
                    <h5 className="mb-1 line-clamp-2">{book.title}</h5>
                    <p className="text-sm text-gray-600 mb-2">{book.author}</p>
                    <p className="text-[#1B5E20]">{formatPrice(book.price)}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Recommendations - Simple Grid (No Carousel) */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-[1200px] mx-auto px-4">
          <h2 className="mb-8">Có thể bạn cũng thích</h2>
          {isLoadingBestsellers ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => <BookCardSkeleton key={i} />)}
            </div>
          ) : recommendations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Chưa có sách nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {recommendations.map((book) => (
                <Card key={book.book_id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  <div onClick={() => handleNavigateToBook(book.book_id)}>
                    <div className="aspect-[3/4] overflow-hidden">
                      <ImageWithFallback 
                        src={book.cover_image_url} 
                        alt={book.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        displayWidth={250}
                        aspectRatio="3/4"
                        placeholderType="book"
                      />
                    </div>
                    <div className="p-4">
                      <h5 className="mb-1 line-clamp-2">{book.title}</h5>
                      <p className="text-sm text-gray-600 mb-2">{book.author}</p>
                      <p className="text-[#1B5E20]">{formatPrice(book.price)}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Blog Section - Lazy loaded */}
      <section className="bg-white">
        <div className="max-w-[1200px] mx-auto px-4">
          <Suspense fallback={<div className="py-16 text-center text-gray-500">Đang tải...</div>}>
            <BlogSection />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
