export interface BlogCategory {
  category_id: number;
  slug: string;
  name: string;
  description?: string;
  display_order: number;
  created_at: Date;
  updated_at: Date;
}

export interface Blog {
  blog_id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featured_image?: string;
  category_id: number;
  category_name?: string;
  category_slug?: string;
  author?: string;
  is_featured: boolean;
  view_count: number;
  published_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface BlogListResponse {
  success: boolean;
  data: Blog[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BlogDetailResponse {
  success: boolean;
  data: Blog;
}

export interface BlogQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  featured?: boolean;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export type ApiResponse<T> = 
  | { success: true; data: T }
  | ErrorResponse;
