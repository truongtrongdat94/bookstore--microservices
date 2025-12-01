import apiClient from './client';
import { ApiResponse, Book, Category, Review, BookFilters, PaginatedResponse } from '../types';

// Search-specific types
export interface SearchedBook extends Book {
  rank: number;                    // Relevance score 0-1
  highlightedTitle?: string;       // Title with highlighted terms
  highlightedDescription?: string; // Description snippet with highlights
}

export interface Suggestion {
  text: string;
  type: 'title' | 'author';
}

export interface SearchParams {
  query: string;
  page?: number;
  limit?: number;
  highlight?: boolean;
}

export interface SearchResult {
  books: SearchedBook[];
  suggestions: Suggestion[];
  total: number;
  page: number;
  limit: number;
  query: string;
}

export interface SearchApiResponse {
  success: boolean;
  data: {
    books: SearchedBook[];
    suggestions: Suggestion[];
  };
  meta: {
    total: number;
    page: number;
    limit: number;
    query: string;
  };
}

export const booksApi = {
  // Get all books with filters
  getBooks: async (filters: BookFilters = {}): Promise<PaginatedResponse<Book>> => {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.category) params.append('category', filters.category.toString());
    if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);

    const response = await apiClient.get<any>(
      `/books?${params.toString()}`
    );

    const books = response.data.data;
    const meta = response.data.meta;
    
    return {
      items: Array.isArray(books) ? books : [],
      total: meta?.total || 0,
      page: meta?.page || filters.page || 1,
      limit: meta?.limit || filters.limit || 12,
      totalPages: Math.ceil((meta?.total || 0) / (meta?.limit || filters.limit || 12)),
    };
  },

  // Get single book
  getBook: async (bookId: number): Promise<Book> => {
    const response = await apiClient.get<ApiResponse<Book>>(`/books/${bookId}`);
    return response.data.data!;
  },

  // Get bestsellers
  getBestsellers: async (limit: number = 10): Promise<Book[]> => {
    const response = await apiClient.get<ApiResponse<Book[]>>(
      `/books/bestsellers?limit=${limit}`
    );
    return response.data.data!;
  },

  // Get new releases
  getNewReleases: async (limit: number = 10): Promise<Book[]> => {
    const response = await apiClient.get<ApiResponse<Book[]>>(
      `/books?sortBy=created_at&order=desc&limit=${limit}`
    );
    return response.data.data!;
  },

  // Get categories
  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get<ApiResponse<Category[]>>('/categories');
    return response.data.data!;
  },

  // Get reviews for a book
  getReviews: async (bookId: number, page = 1, limit = 10): Promise<PaginatedResponse<Review>> => {
    const response = await apiClient.get<ApiResponse<{ reviews: Review[], total: number }>>(
      `/books/${bookId}/reviews?page=${page}&limit=${limit}`
    );
    
    const data = response.data.data!;
    return {
      items: data.reviews,
      total: data.total,
      page,
      limit,
      totalPages: Math.ceil(data.total / limit),
    };
  },

  // Add review
  addReview: async (bookId: number, rating: number, comment: string): Promise<Review> => {
    const response = await apiClient.post<ApiResponse<Review>>(
      `/books/${bookId}/reviews`,
      { rating, comment }
    );
    return response.data.data!;
  },

  // Advanced search with full-text search
  searchBooks: async (params: SearchParams): Promise<SearchResult> => {
    const urlParams = new URLSearchParams();
    urlParams.append('q', params.query);
    if (params.page) urlParams.append('page', params.page.toString());
    if (params.limit) urlParams.append('limit', params.limit.toString());
    if (params.highlight !== undefined) urlParams.append('highlight', params.highlight.toString());

    const response = await apiClient.get<SearchApiResponse>(
      `/books/search?${urlParams.toString()}`
    );

    return {
      books: response.data.data.books,
      suggestions: response.data.data.suggestions,
      total: response.data.meta.total,
      page: response.data.meta.page,
      limit: response.data.meta.limit,
      query: response.data.meta.query,
    };
  },

  // Get search suggestions for autocomplete
  getSearchSuggestions: async (query: string, limit: number = 10): Promise<Suggestion[]> => {
    if (query.length < 2) {
      return [];
    }

    const urlParams = new URLSearchParams();
    urlParams.append('q', query);
    urlParams.append('limit', limit.toString());

    const response = await apiClient.get<{ success: boolean; data: { suggestions: Suggestion[] } }>(
      `/books/search/suggestions?${urlParams.toString()}`
    );

    return response.data.data.suggestions || [];
  },
};
