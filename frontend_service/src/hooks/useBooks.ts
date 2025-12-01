import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { booksApi } from '../api';
import { BookFilters } from '../types';
import { toast } from 'sonner';

export const useBooks = (filters?: BookFilters) => {
  return useQuery({
    queryKey: ['books', filters],
    queryFn: () => booksApi.getBooks(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useBook = (bookId: number | undefined) => {
  return useQuery({
    queryKey: ['book', bookId],
    queryFn: () => booksApi.getBook(bookId!),
    enabled: !!bookId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useBestsellers = (limit = 10) => {
  return useQuery({
    queryKey: ['bestsellers', limit],
    queryFn: () => booksApi.getBestsellers(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useNewReleases = (limit = 10) => {
  return useQuery({
    queryKey: ['newReleases', limit],
    queryFn: () => booksApi.getNewReleases(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: booksApi.getCategories,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useReviews = (bookId: number | undefined, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['reviews', bookId, page, limit],
    queryFn: () => booksApi.getReviews(bookId!, page, limit),
    enabled: !!bookId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useAddReview = (bookId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rating, comment }: { rating: number; comment: string }) =>
      booksApi.addReview(bookId, rating, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', bookId] });
      queryClient.invalidateQueries({ queryKey: ['book', bookId] });
      toast.success('Đánh giá của bạn đã được gửi!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Không thể gửi đánh giá');
    },
  });
};
