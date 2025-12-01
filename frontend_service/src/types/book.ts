export interface Book {
  book_id: number;
  title: string;
  author: string;
  description?: string;
  price: number;
  discount_price?: number;
  stock_quantity: number;
  isbn?: string;
  publisher?: string;
  publication_date?: string;
  language?: string;
  page_count?: number;
  cover_image_url?: string;
  category_id?: number;
  category_name?: string;
  average_rating?: number;
  total_reviews?: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  category_id: number;
  name: string;
  description?: string;
  parent_id?: number;
  created_at: string;
}

export interface Review {
  review_id: number;
  book_id: number;
  user_id: number;
  username?: string;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at: string;
}

export interface BookFilters {
  category?: number;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'title' | 'rating' | 'newest';
  page?: number;
  limit?: number;
}
