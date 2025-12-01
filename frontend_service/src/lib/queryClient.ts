import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      // Performance: Increase stale time to reduce refetches
      staleTime: 10 * 60 * 1000, // 10 minutes
      // Performance: Cache data longer
      gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
    },
    mutations: {
      retry: 0,
    },
  },
});
