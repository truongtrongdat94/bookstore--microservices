import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ImageWithFallback } from './figma/ImageWithFallback';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './ui/breadcrumb';
import { useBooks, useCategories } from '../hooks';
import { useCart } from '../hooks/useCart';

interface BookListingPageProps {
  onNavigate: (page: string, id?: number) => void;
  onAddToCart?: () => void;
}

export function BookListingPage({ onNavigate }: BookListingPageProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('default');
  const [page, setPage] = useState(1);
  
  const { addToCart } = useCart();
  const { data: categoriesData } = useCategories();
  
  // Get params from URL
  const categoryParam = searchParams.get('category');
  const sortParam = searchParams.get('sort');
  const categoryId = categoryParam ? parseInt(categoryParam) : undefined;

  // Set initial sort from URL
  useEffect(() => {
    if (sortParam === 'newest') {
      setSortBy('newest');
    } else if (sortParam === 'bestseller') {
      setSortBy('bestseller');
    }
  }, [sortParam]);

  // Build filters for books query
  const filters = useMemo(() => ({
    page,
    limit: 12,
    ...(categoryId && categoryId > 0 && { category: categoryId }),
    ...(sortBy === 'newest' && { sortBy: 'created_at' as any, order: 'desc' }),
    ...(sortBy === 'bestseller' && { sortBy: 'sales_count' as any, order: 'desc' }),
    ...(sortBy === 'price_asc' && { sortBy: 'price' as any, order: 'asc' }),
    ...(sortBy === 'price_desc' && { sortBy: 'price' as any, order: 'desc' }),
  }), [page, categoryId, sortBy]);

  const { data: booksData, isLoading: booksLoading } = useBooks(filters);

  const handleCountryToggle = (country: string) => {
    setSelectedCountries(prev => 
      prev.includes(country) 
        ? prev.filter(c => c !== country)
        : [...prev, country]
    );
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setPage(1);
  };

  const handleAddToCart = (bookId: number) => {
    (addToCart as any)({ bookId, quantity: 1 });
  };

  // Get current category name for breadcrumb
  const currentCategory = categoriesData?.find(c => c.category_id === categoryId);
  
  // Get unique countries from books
  const countries = useMemo(() => {
    if (!booksData?.items) return [];
    const uniqueCountries = new Set(booksData.items.map(book => book.language || 'Khác'));
    return Array.from(uniqueCountries).sort();
  }, [booksData]);

  // Filter books by country (client-side)
  const filteredBooks = useMemo(() => {
    if (!booksData?.items) return [];
    if (selectedCountries.length === 0) return booksData.items;
    return booksData.items.filter(book => 
      selectedCountries.includes(book.language || 'Khác')
    );
  }, [booksData, selectedCountries]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <div>
      {/* Banner */}
      <div 
        className="h-[300px] bg-cover bg-center relative"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1637962638310-e6787f7eb324?w=800&q=60&fm=webp)',
        }}
      >
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative max-w-[1200px] mx-auto px-4 h-full flex items-center">
          <h1 className="text-white">Sách UIT</h1>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => onNavigate('home')} className="cursor-pointer">
                Trang chủ
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => onNavigate('books')} className="cursor-pointer">
                Sách UIT
              </BreadcrumbLink>
            </BreadcrumbItem>
            {currentCategory && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{currentCategory.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filter */}
          <aside className="lg:w-64 flex-shrink-0">
            <Card className="p-6">
              <h4 className="mb-4">Bộ lọc</h4>
              
              <div className="space-y-4">
                <div>
                  <h5 className="mb-3">Quốc gia</h5>
                  <div className="space-y-2">
                    {countries.map((country) => (
                      <div key={country} className="flex items-center space-x-2">
                        <Checkbox 
                          id={country}
                          checked={selectedCountries.includes(country)}
                          onCheckedChange={() => handleCountryToggle(country)}
                        />
                        <label
                          htmlFor={country}
                          className="text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {country}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort Bar */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                {booksLoading ? 'Đang tải...' : `${filteredBooks.length} sản phẩm`}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm">Sắp xếp:</span>
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Mặc định" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Mặc định</SelectItem>
                    <SelectItem value="newest">Sách mới</SelectItem>
                    <SelectItem value="bestseller">Sách bán chạy</SelectItem>
                    <SelectItem value="price_asc">Giá thấp - cao</SelectItem>
                    <SelectItem value="price_desc">Giá cao - thấp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Books Grid */}
            {booksLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Đang tải sách...</p>
              </div>
            ) : filteredBooks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Không tìm thấy sách nào</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredBooks.map((book) => (
                  <Card key={book.book_id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div 
                      className="aspect-[3/4] overflow-hidden cursor-pointer bg-gray-100"
                      onClick={() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        navigate(`/books/${book.book_id}`);
                      }}
                    >
                      <ImageWithFallback 
                        src={book.cover_image_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=250'} 
                        alt={book.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        displayWidth={250}
                      />
                    </div>
                    <div className="p-4">
                      <h5 
                        className="mb-1 line-clamp-2 cursor-pointer hover:text-[#1B5E20]"
                        onClick={() => {
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                          navigate(`/books/${book.book_id}`);
                        }}
                      >
                        {book.title}
                      </h5>
                      <p className="text-sm text-gray-600 mb-2">{book.author}</p>
                      <p className="text-[#1B5E20] mb-3">{formatPrice(book.price)}</p>
                      <Button 
                        onClick={() => handleAddToCart(book.book_id)}
                        className="w-full bg-[#1B5E20] hover:bg-[#0d3d13]"
                        disabled={book.stock_quantity === 0}
                      >
                        {book.stock_quantity === 0 ? 'Hết hàng' : 'Thêm giỏ hàng'}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
