// Updated to match backend API response structure
export interface BlogPost {
  blog_id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featured_image?: string;
  category_slug: string;
  category_name: string;
  author?: string;
  is_featured: boolean;
  view_count: number;
  published_at: string;
  created_at: string;
  updated_at: string;
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

// Legacy category mapping (kept for reference, but API now returns category_name)
export const BLOG_CATEGORIES = {
  'tin-uit': 'Tin UIT',
  'review': 'Review sách của độc giả',
  'bao-chi': 'Tin sách trên báo chí',
  'bien-tap-vien': 'Biên tập viên giới thiệu',
  'doc-gia': 'Đọc giả'
} as const;

export type BlogCategorySlug = keyof typeof BLOG_CATEGORIES;
