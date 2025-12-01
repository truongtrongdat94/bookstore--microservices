import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Minus, Plus } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './ui/breadcrumb';
import { useBookDetail, useCart } from '../hooks';

export function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { book, relatedBooks, loading, error, refetch } = useBookDetail(id);
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  // Format price to Vietnamese currency
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  // Extract year from publication date
  const getPublicationYear = (date?: string): string | null => {
    if (!date) return null;
    try {
      return new Date(date).getFullYear().toString();
    } catch {
      return null;
    }
  };

  const handleQuantityChange = (delta: number) => {
    if (!book) return;
    setQuantity(prev => Math.max(1, Math.min(prev + delta, book.stock_quantity)));
  };

  const handleAddToCart = () => {
    if (!book) return;
    // addToCart handles both authenticated and non-authenticated users
    // For authenticated: uses { bookId, quantity }
    // For non-authenticated: uses CartItem with book_id
    addToCart({ 
      bookId: book.book_id, 
      quantity,
      book_id: book.book_id,
      book_title: book.title,
      book_author: book.author,
      book_price: book.price,
      book_image: book.cover_image_url,
    } as any);
  };

  const handleBuyNow = () => {
    if (!book) return;
    addToCart({ 
      bookId: book.book_id, 
      quantity,
      book_id: book.book_id,
      book_title: book.title,
      book_author: book.author,
      book_price: book.price,
      book_image: book.cover_image_url,
    } as any);
    navigate('/cart');
  };

  // Redirect to /books for invalid book ID
  if (error === 'ID sách không hợp lệ') {
    navigate('/books');
    return null;
  }

  // Loading state
  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Left - Image Skeleton */}
          <div className="flex justify-center">
            <div className="max-w-md w-full">
              <Card className="overflow-hidden">
                <div className="w-full aspect-[3/4] bg-gray-200 animate-pulse" />
              </Card>
            </div>
          </div>

          {/* Right - Details Skeleton */}
          <div>
            <div className="h-8 bg-gray-200 animate-pulse rounded mb-3 w-3/4" />
            <div className="h-6 bg-gray-200 animate-pulse rounded mb-4 w-1/2" />
            
            <div className="border-t border-b border-gray-200 py-4 mb-6">
              <div className="h-6 bg-gray-200 animate-pulse rounded mb-2 w-1/4" />
              <div className="h-4 bg-gray-200 animate-pulse rounded w-1/3" />
            </div>

            <div className="mb-6">
              <div className="h-4 bg-gray-200 animate-pulse rounded mb-2 w-20" />
              <div className="h-10 bg-gray-200 animate-pulse rounded w-32" />
            </div>

            <div className="flex gap-4 mb-8">
              <div className="flex-1 h-10 bg-gray-200 animate-pulse rounded" />
              <div className="flex-1 h-10 bg-gray-200 animate-pulse rounded" />
            </div>
          </div>
        </div>

        {/* Description Skeleton */}
        <section className="mb-16">
          <div className="h-6 bg-gray-200 animate-pulse rounded mb-4 w-40" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 animate-pulse rounded" />
            <div className="h-4 bg-gray-200 animate-pulse rounded" />
            <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4" />
          </div>
        </section>
      </div>
    );
  }

  // Error state
  if (error) {
    const is404 = error === 'Không tìm thấy sách';
    
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <h2 className="mb-4 text-2xl">{error}</h2>
            <p className="text-gray-600 mb-6">
              {is404 
                ? 'Sách bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.'
                : 'Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.'}
            </p>
            <div className="flex gap-4 justify-center">
              {!is404 && (
                <Button 
                  onClick={refetch}
                  className="bg-[#1B5E20] hover:bg-[#0d3d13]"
                >
                  Thử lại
                </Button>
              )}
              <Button 
                onClick={() => navigate(is404 ? '/' : '/books')}
                variant="outline"
                className="border-[#1B5E20] text-[#1B5E20] hover:bg-[#1B5E20] hover:text-white"
              >
                {is404 ? 'Quay lại trang chủ' : 'Xem danh sách sách'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // No book data
  if (!book) {
    return null;
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate('/')} className="cursor-pointer">
              Trang chủ
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {book.category_name && (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink 
                  onClick={() => navigate(`/books?category=${book.category_id}`)} 
                  className="cursor-pointer"
                >
                  {book.category_name}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          )}
          <BreadcrumbItem>
            <BreadcrumbPage>{book.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Left - Image */}
        <div className="flex justify-center">
          <div className="max-w-md w-full">
            <Card className="overflow-hidden">
              <ImageWithFallback 
                src={book.cover_image_url || ''} 
                alt={book.title}
                className="w-full h-auto"
              />
            </Card>
          </div>
        </div>

        {/* Right - Details */}
        <div>
          <h2 className="mb-3">{book.title}</h2>
          <p className="text-gray-600 mb-4">Tác giả: <span className="text-[#1B5E20]">{book.author}</span></p>
          
          <div className="border-t border-b border-gray-200 py-4 mb-6">
            <p className="text-[#1B5E20] mb-2 text-xl font-semibold">{formatPrice(book.price)}</p>
            <p className="text-sm text-gray-600">Tồn kho: {book.stock_quantity} cuốn</p>
          </div>

          {/* Quantity Selector */}
          <div className="mb-6">
            <p className="mb-2">Số lượng:</p>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
              >
                <Minus size={16} />
              </Button>
              <span className="w-12 text-center">{quantity}</span>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= book.stock_quantity}
              >
                <Plus size={16} />
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mb-8">
            <Button 
              onClick={handleAddToCart}
              className="flex-1 bg-[#1B5E20] hover:bg-[#0d3d13]"
              disabled={book.stock_quantity === 0}
            >
              {book.stock_quantity === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
            </Button>
            <Button 
              onClick={handleBuyNow}
              variant="outline"
              className="flex-1 border-[#1B5E20] text-[#1B5E20] hover:bg-[#1B5E20] hover:text-white"
              disabled={book.stock_quantity === 0}
            >
              Mua ngay
            </Button>
          </div>
        </div>
      </div>

      {/* Description */}
      {book.description && (
        <section className="mb-16">
          <h3 className="mb-4">Giới thiệu sách</h3>
          <div className="prose max-w-none">
            {book.description.split('\n\n').map((paragraph, index) => (
              <p key={index} className="mb-4 text-gray-700">
                {paragraph}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* Details */}
      <section className="mb-16">
        <h3 className="mb-4">Thông tin chi tiết</h3>
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex border-b border-gray-100 pb-3">
              <span className="w-32 text-gray-600">Tác giả:</span>
              <span>{book.author}</span>
            </div>
            {book.page_count && (
              <div className="flex border-b border-gray-100 pb-3">
                <span className="w-32 text-gray-600">Số trang:</span>
                <span>{book.page_count}</span>
              </div>
            )}
            {getPublicationYear(book.publication_date) && (
              <div className="flex border-b border-gray-100 pb-3">
                <span className="w-32 text-gray-600">Năm XB:</span>
                <span>{getPublicationYear(book.publication_date)}</span>
              </div>
            )}
            {book.publisher && (
              <div className="flex border-b border-gray-100 pb-3">
                <span className="w-32 text-gray-600">Nhà XB:</span>
                <span>{book.publisher}</span>
              </div>
            )}
            {book.language && (
              <div className="flex border-b border-gray-100 pb-3">
                <span className="w-32 text-gray-600">Ngôn ngữ:</span>
                <span>{book.language}</span>
              </div>
            )}
            {book.isbn && (
              <div className="flex border-b border-gray-100 pb-3">
                <span className="w-32 text-gray-600">ISBN:</span>
                <span>{book.isbn}</span>
              </div>
            )}
          </div>
        </Card>
      </section>

      {/* Related Books */}
      {relatedBooks.length > 0 && (
        <section>
          <h3 className="mb-6">Có thể bạn cũng thích</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedBooks.map((relatedBook) => (
              <Card 
                key={relatedBook.book_id} 
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/books/${relatedBook.book_id}`)}
              >
                <div className="aspect-[3/4] overflow-hidden">
                  <ImageWithFallback 
                    src={relatedBook.cover_image_url || ''} 
                    alt={relatedBook.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h5 className="mb-1 line-clamp-2">{relatedBook.title}</h5>
                  <p className="text-sm text-gray-600 mb-2">{relatedBook.author}</p>
                  <p className="text-[#1B5E20] font-semibold">{formatPrice(relatedBook.price)}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
