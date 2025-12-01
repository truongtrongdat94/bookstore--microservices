import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState, useEffect } from 'react';
import { blogsApi, BlogPost } from '../api/blogs';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function BlogListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category') || undefined;
  const pageParam = searchParams.get('page');
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;

  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await blogsApi.getBlogs({
          page: currentPage,
          limit: 12,
          category: categoryFilter
        });
        setBlogs(response.data);
        setMeta(response.meta);
      } catch (err: any) {
        console.error('Failed to fetch blogs:', err);
        setError('Không thể tải danh sách tin sách. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [currentPage, categoryFilter]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Get category display name from first blog or default
  const categoryName = blogs.length > 0 && categoryFilter
    ? blogs[0].category_name
    : categoryFilter
    ? 'Tin sách'
    : 'Tất cả tin sách';

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-[1200px] mx-auto px-4 py-16">
          <div className="mb-12">
            <div className="h-10 bg-gray-200 rounded w-1/3 mb-4 animate-pulse" />
            <div className="h-6 bg-gray-200 rounded w-1/6 animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-[16/10] bg-gray-200 animate-pulse" />
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-3 animate-pulse" />
                  <div className="h-6 bg-gray-200 rounded w-full mb-2 animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-[1200px] mx-auto px-4 py-16">
          <Card className="p-8 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#1B5E20] text-white rounded hover:bg-[#145018] transition-colors"
            >
              Thử lại
            </button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1200px] mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-black mb-4">{categoryName}</h1>
          <p className="text-gray-600">
            {meta.total} bài viết {meta.totalPages > 1 && `• Trang ${meta.page} / ${meta.totalPages}`}
          </p>
        </div>

        {/* Blog Grid */}
        {blogs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Chưa có bài viết nào trong danh mục này</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((post) => (
                <Card
                  key={post.blog_id}
                  onClick={() => navigate(`/blog/${post.blog_id}`)}
                  className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                >
                  {/* Thumbnail */}
                  <div className="aspect-[16/10] overflow-hidden">
                    <ImageWithFallback
                      src={post.featured_image || ''}
                      alt={post.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Category and Date */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm text-[#1B5E20] uppercase tracking-wide">
                        {post.category_name}
                      </span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">{formatDate(post.published_at)}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-semibold text-black mb-3 line-clamp-2 leading-snug">
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    {post.excerpt && (
                      <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {meta.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12">
                <button
                  onClick={() => handlePageChange(meta.page - 1)}
                  disabled={meta.page === 1}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={20} />
                  Trang trước
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
                    let pageNum;
                    if (meta.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (meta.page <= 3) {
                      pageNum = i + 1;
                    } else if (meta.page >= meta.totalPages - 2) {
                      pageNum = meta.totalPages - 4 + i;
                    } else {
                      pageNum = meta.page - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded ${
                          meta.page === pageNum
                            ? 'bg-[#1B5E20] text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        } transition-colors`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(meta.page + 1)}
                  disabled={meta.page === meta.totalPages}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Trang sau
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
