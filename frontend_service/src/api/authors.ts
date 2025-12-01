import apiClient from './client';
import { ApiResponse, Author, Book } from '../types';

export const authorsApi = {
  // Get all authors
  getAuthors: async (): Promise<Author[]> => {
    const response = await apiClient.get<ApiResponse<Author[]>>('/authors');
    return response.data.data!;
  },

  // Get single author
  getAuthor: async (authorId: number): Promise<Author> => {
    const response = await apiClient.get<ApiResponse<Author>>(`/authors/${authorId}`);
    return response.data.data!;
  },

  // Get books by author
  getAuthorBooks: async (authorId: number): Promise<Book[]> => {
    const response = await apiClient.get<ApiResponse<Book[]>>(`/authors/${authorId}/books`);
    return response.data.data!;
  },
  
  // Get top authors by sales
  getTopAuthorsBySales: async (limit: number = 6): Promise<Author[]> => {
    const response = await apiClient.get<ApiResponse<Author[]>>(`/authors/top/sales?limit=${limit}`);
    return response.data.data!;
  },
};
