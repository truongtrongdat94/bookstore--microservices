import { Card } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { blogsApi, BlogPost } from '../api/blogs';
import DOMPurify from 'dompurify';

export function BlogDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogData = async () => {
      if (!id) {
        setError('ID bài viết không hợp lệ');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const blogId = parseInt(id, 10);
        if (isNaN(blogId)) {
          setError('ID bài viết không hợp lệ');
          setLoading(false);
          return;
        }

        // Fetch blog detail
        const blogData = await blogsApi.getBlogById(blogId);
        setBlog(blogData);

        // Fetch related blogs
        try {
          const related = await blogsApi.getRelatedBlogs(blogId, 4);
          setRelatedBlogs(related);
        } catch (err) {
          console.error('Failed to fetch related blogs:', err);
          // Don't fail the whole page if related blogs fail
        }
      } catch (err: any) {
        console.error('Failed to fetch blog:', err);
        if (err.response?.status === 404) {
          setError('Không tìm thấy bài viết này');
        } else {
          setError('Không thể tải bài viết. Vui lòng thử lại sau.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBlogData();
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const sanitizeHTML = (html: string) => {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'div', 'span'],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'style', 'target']
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <div className="border-b border-gray-200">
          <div className="max-w-[1200px] mx-auto px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
          </div>
        </div>
        <div className="max-w-[680px] mx-auto px-4 sm:px-6 py-8">
          <div className="h-10 bg-gray-200 rounded w-3/4 mb-4 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-8 animate-pulse" />
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // Error state (404 or other errors)
  if (error || !blog) {
    return (
      <div className="bg-white min-h-screen">
        <div className="border-b border-gray-200">
          <div className="max-w-[1200px] mx-auto px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <button onClick={() => navigate('/')} className="hover:text-[#1B5E20]">
                Trang chủ
              </button>
              <span>›</span>
              <button onClick={() => navigate('/blog')} className="hover:text-[#1B5E20]">
                Tin sách
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-[680px] mx-auto px-4 sm:px-6 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {error === 'Không tìm thấy bài viết này' ? '404 - Không tìm thấy' : 'Lỗi'}
            </h2>
            <p className="text-red-600 mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => navigate('/blog')}
                className="px-6 py-2 bg-[#1B5E20] text-white rounded hover:bg-[#145018] transition-colors"
              >
                Về trang tin sách
              </button>
              <button 
                onClick={() => navigate('/')}
                className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Về trang chủ
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb - full width with border */}
      <div className="border-b border-gray-200">
        <div className="max-w-[1200px] mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <button onClick={() => navigate('/')} className="hover:text-[#1B5E20]">
              Trang chủ
            </button>
            <span>›</span>
            <button onClick={() => navigate('/blog')} className="hover:text-[#1B5E20]">
              Tin sách
            </button>
            <span>›</span>
            <button 
              onClick={() => navigate(`/blog?category=${blog.category_slug}`)} 
              className="hover:text-[#1B5E20]"
            >
              {blog.category_name}
            </button>
            <span>›</span>
            <span className="text-[#1B5E20] line-clamp-1">{blog.title}</span>
          </div>
        </div>
      </div>

      {/* Article Content - narrow width like Nhã Nam */}
      <article className="max-w-[680px] mx-auto px-4 sm:px-6 py-8 md:py-10">
        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-black mb-4 leading-tight">{blog.title}</h1>
        
        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-6">
          <span>{formatDate(blog.published_at)}</span>
          {blog.author && (
            <>
              <span>•</span>
              <span>Tác giả: {blog.author}</span>
            </>
          )}
          <span>•</span>
          <span className="text-[#1B5E20]">{blog.category_name}</span>
        </div>

        {/* Excerpt - styled like Nhã Nam */}
        {blog.excerpt && (
          <div className="text-base text-gray-700 mb-6 leading-relaxed">
            {blog.excerpt}
          </div>
        )}

        {/* Featured Image */}
        {blog.featured_image && (
          <div className="mb-8">
            <ImageWithFallback 
              src={blog.featured_image}
              alt={blog.title}
              className="w-full"
            />
          </div>
        )}

        {/* Article Content */}
        <div 
          className="prose prose-base max-w-none prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4 prose-headings:text-black prose-a:text-[#1B5E20] prose-a:no-underline hover:prose-a:underline"
          dangerouslySetInnerHTML={{ __html: sanitizeHTML(blog.content) }}
        />
      </article>

      {/* Related Posts - wider section */}
      {relatedBlogs.length > 0 && (
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-8 md:py-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-[#1B5E20]">Tin liên quan</h2>
              <button 
                onClick={() => navigate(`/blog?category=${blog.category_slug}`)}
                className="text-sm text-[#1B5E20] hover:underline font-medium"
              >
                Xem thêm
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {relatedBlogs.map((post) => (
                <Card 
                  key={post.blog_id} 
                  className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow h-full flex flex-col bg-white"
                  onClick={() => navigate(`/blog/${post.blog_id}`)}
                >
                  <div className="aspect-[16/10] overflow-hidden flex-shrink-0">
                    <ImageWithFallback 
                      src={post.featured_image || ''}
                      alt={post.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <h5 className="line-clamp-2 mb-3 text-black leading-snug text-sm font-medium min-h-[2.5em]">
                      {post.title}
                    </h5>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-auto">
                      <span className="truncate">{post.category_name}</span>
                      <span>•</span>
                      <span className="whitespace-nowrap">{formatDate(post.published_at)}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
