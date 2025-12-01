import { useQuery } from '@tanstack/react-query';
import { blogsApi, BlogQueryParams } from '../api/blogs';

/**
 * Hook for fetching paginated blog lists with optional filtering
 * Implements client-side caching with 5-minute TTL
 */
export const useBlogs = (params?: BlogQueryParams) => {
  return useQuery({
    queryKey: ['blogs', params],
    queryFn: () => blogsApi.getBlogs(params),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    keepPreviousData: true, // Keep previous data while fetching new page
  });
};

/**
 * Hook for fetching a single blog post by ID
 * Implements client-side caching with 5-minute TTL
 */
export const useBlogDetail = (blogId: number | undefined) => {
  return useQuery({
    queryKey: ['blog', blogId],
    queryFn: () => blogsApi.getBlogById(blogId!),
    enabled: !!blogId,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
};

/**
 * Hook for fetching a single blog post by slug
 * Implements client-side caching with 5-minute TTL
 */
export const useBlogBySlug = (slug: string | undefined) => {
  return useQuery({
    queryKey: ['blog', 'slug', slug],
    queryFn: () => blogsApi.getBlogBySlug(slug!),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
};

/**
 * Hook for fetching related blog posts
 * Implements client-side caching with 5-minute TTL
 */
export const useRelatedBlogs = (blogId: number | undefined, limit: number = 4) => {
  return useQuery({
    queryKey: ['blogs', 'related', blogId, limit],
    queryFn: () => blogsApi.getRelatedBlogs(blogId!, limit),
    enabled: !!blogId,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
};

/**
 * Hook for fetching featured blogs (typically for homepage)
 * Implements client-side caching with 5-minute TTL
 */
export const useFeaturedBlogs = (limit: number = 5) => {
  return useQuery({
    queryKey: ['blogs', 'featured', limit],
    queryFn: () => blogsApi.getFeaturedBlogs(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
};

/**
 * Hook for fetching blog categories
 * Implements client-side caching with longer TTL since categories change rarely
 */
export const useBlogCategories = () => {
  return useQuery({
    queryKey: ['blogs', 'categories'],
    queryFn: () => blogsApi.getCategories(),
    staleTime: 30 * 60 * 1000, // 30 minutes cache (categories rarely change)
  });
};
