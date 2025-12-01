import { Request } from 'express';

// Book related types
export interface Book {
  book_id: number;
  title: string;
  author: string;
  isbn?: string;
  price: number;
  original_price?: number;
  stock_quantity: number;
  category_id: number;
  description?: string;
  cover_image?: string;
  published_date?: Date;
  publisher?: string;
  pages?: number;
  dimensions?: string;
  language?: string;
  created_at: Date;
  updated_at?: Date;
}

export interface Category {
  category_id: number;
  name: string;
  parent_id?: number;
  description?: string;
  created_at: Date;
}

export interface Author {
  author_id: number;
  name: string;
  nationality?: string;
  birth_year?: number;
  death_year?: number;
  bio?: string;
  quote?: string;
  image_url?: string;
  website?: string;
  created_at: Date;
  updated_at?: Date;
}

export interface AuthorWithBookCount extends Author {
  book_count: number;
}

export interface Review {
  review_id: number;
  book_id: number;
  user_id: number;
  rating: number; // 1-5
  comment?: string;
  created_at: Date;
  updated_at?: Date;
}

// DTOs
export interface CreateBookDto {
  title: string;
  author: string;
  isbn?: string;
  price: number;
  original_price?: number;
  stock_quantity: number;
  category_id: number;
  description?: string;
  cover_image?: string;
  published_date?: Date;
  publisher?: string;
  pages?: number;
  dimensions?: string;
  language?: string;
}

export interface UpdateBookDto extends Partial<CreateBookDto> {}

export interface CreateReviewDto {
  rating: number;
  comment?: string;
}

export interface BookQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: number;
  minPrice?: number;
  maxPrice?: number;
  author?: string;
  publisher?: string;
  language?: string;
  year?: number;
  sortBy?: 'title' | 'price' | 'created_at';
  order?: 'asc' | 'desc';
}

// Extended Request with user info from API Gateway
export interface AuthRequest extends Request {
  user?: {
    user_id: number;
    email: string;
    role: string;
  };
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    query?: string;
    count?: number;
  };
}

// Error types
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code: string = 'INTERNAL_ERROR',
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
    Error.captureStackTrace(this, ApiError);
  }
}
