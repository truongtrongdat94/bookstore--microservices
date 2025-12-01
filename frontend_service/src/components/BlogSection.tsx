import { Card } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { blogsApi, BlogPost } from '../api/blogs';

export function BlogSection() {
  const navigate = useNavigate();
  const [featuredPost, setFeaturedPost] = useState<BlogPost | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        setError(null);
        const blogs = await blogsApi.getFeaturedBlogs(5);
        if (blogs.length > 0) {
          setFeaturedPost(blogs[0]);
          setPosts(blogs.slice(1, 5));
        }
      } catch (err: any) {
        console.error('Failed to fetch featured blogs:', err);
        setError('Không thể tải tin sách. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Loading skeleton
  if (loading) {
    return (
      <section className="py-16">
        <div className="flex justify-between items-center mb-8">
          <h2>Tin sách</h2>
          <button 
            onClick={() => navigate('/blog')}
            className="flex items-center text-[#1B5E20] hover:underline transition-colors"
          >
            Xem thêm
            <ChevronRight size={20} className="ml-1" />
          </button>
        </div>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-[70%]">
            <Card className="overflow-hidden">
              <div className="h-[300px] lg:h-[350px] bg-gray-200 animate-pulse" />
              <div className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-3 animate-pulse" />
                <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
              </div>
            </Card>
          </div>
          <div className="lg:w-[30%] flex flex-col gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-4">
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-gray-200 rounded animate-pulse" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="py-16">
        <div className="flex justify-between items-center mb-8">
          <h2>Tin sách</h2>
          <button 
            onClick={() => navigate('/blog')}
            className="flex items-center text-[#1B5E20] hover:underline transition-colors"
          >
            Xem thêm
            <ChevronRight size={20} className="ml-1" />
          </button>
        </div>
        <Card className="p-8 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#1B5E20] text-white rounded hover:bg-[#145018] transition-colors"
          >
            Thử lại
          </button>
        </Card>
      </section>
    );
  }

  // Empty state
  if (!featuredPost) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <section className="py-16">
      <div className="flex justify-between items-center mb-8">
        <h2>Tin sách</h2>
        <button 
          onClick={() => navigate('/blog')}
          className="flex items-center text-[#1B5E20] hover:underline transition-colors"
        >
          Xem thêm
          <ChevronRight size={20} className="ml-1" />
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Featured Post - Left Side (70%) */}
        <div className="lg:w-[70%]">
          <Card 
            onClick={() => navigate(`/blog/${featuredPost.blog_id}`)}
            className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="relative h-[300px] lg:h-[350px] overflow-hidden">
              <ImageWithFallback 
                src={featuredPost.featured_image || ''}
                alt={featuredPost.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-[#1B5E20] uppercase tracking-wide">
                  {featuredPost.category_name}
                </span>
                <span className="text-sm text-gray-500">{formatDate(featuredPost.published_at)}</span>
              </div>
              <h3 className="text-black leading-relaxed">{featuredPost.title}</h3>
            </div>
          </Card>
        </div>

        {/* Posts List - Right Side (30%) */}
        <div className="lg:w-[30%] flex flex-col gap-4">
          {posts.map((post) => (
            <Card 
              key={post.blog_id}
              onClick={() => navigate(`/blog/${post.blog_id}`)}
              className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex gap-4 p-4">
                <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded">
                  <ImageWithFallback 
                    src={post.featured_image || ''}
                    alt={post.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <h5 className="line-clamp-2 mb-2 text-black leading-snug">{post.title}</h5>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{post.category_name}</span>
                    <span>•</span>
                    <span>{formatDate(post.published_at)}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
