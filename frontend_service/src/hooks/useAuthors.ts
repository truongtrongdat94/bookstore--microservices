import { useQuery } from '@tanstack/react-query';
import { authorsApi } from '../api';

export const useAuthors = () => {
  return useQuery({
    queryKey: ['authors'],
    queryFn: () => authorsApi.getAuthors(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useAuthor = (authorId: number | undefined) => {
  return useQuery({
    queryKey: ['author', authorId],
    queryFn: () => authorsApi.getAuthor(authorId!),
    enabled: !!authorId,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

export const useAuthorBooks = (authorId: number | undefined) => {
  return useQuery({
    queryKey: ['author', authorId, 'books'],
    queryFn: () => authorsApi.getAuthorBooks(authorId!),
    enabled: !!authorId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
