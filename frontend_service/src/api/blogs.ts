import apiClient from './client';
import { ApiResponse } from '../types';

// Blog API Response Types
export interface BlogPost {
  blog_id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featured_image?: string;
  category_id: number;
  category_name: string;
  category_slug: string;
  author?: string;
  is_featured: boolean;
  view_count: number;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export interface BlogCategory {
  category_id: number;
  slug: string;
  name: string;
  description?: string;
  display_order: number;
}

export interface BlogListResponse {
  success: boolean;
  data: BlogPost[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BlogDetailResponse {
  success: boolean;
  data: BlogPost;
}

export interface BlogCategoriesResponse {
  success: boolean;
  data: BlogCategory[];
}

export interface BlogQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  featured?: boolean;
}

export const blogsApi = {
  // Get paginated blog list
  getBlogs: async (params?: BlogQueryParams): Promise<BlogListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.featured !== undefined) queryParams.append('featured', params.featured.toString());

    const response = await apiClient.get<BlogListResponse>(
      `/blogs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    return response.data;
  },

  // Get single blog by ID
  getBlogById: async (id: number): Promise<BlogPost> => {
    const response = await apiClient.get<BlogDetailResponse>(`/blogs/${id}`);
    return response.data.data;
  },

  // Get blog by slug
  getBlogBySlug: async (slug: string): Promise<BlogPost> => {
    const response = await apiClient.get<BlogDetailResponse>(`/blogs/slug/${slug}`);
    return response.data.data;
  },

  // Get related blogs
  getRelatedBlogs: async (id: number, limit: number = 4): Promise<BlogPost[]> => {
    const response = await apiClient.get<BlogListResponse>(
      `/blogs/related/${id}?limit=${limit}`
    );
    return response.data.data;
  },

  // Get featured blogs for homepage
  getFeaturedBlogs: async (limit: number = 5): Promise<BlogPost[]> => {
    const response = await apiClient.get<BlogListResponse>(
      `/blogs?featured=true&limit=${limit}`
    );
    return response.data.data;
  },

  // Get all blog categories
  getCategories: async (): Promise<BlogCategory[]> => {
    const response = await apiClient.get<BlogCategoriesResponse>('/blogs/categories');
    return response.data.data;
  },
};
