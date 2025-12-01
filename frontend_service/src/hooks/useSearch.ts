import { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { booksApi, SearchedBook, Suggestion, SearchResult } from '../api/books';

interface UseSearchOptions {
  debounceMs?: number;
  minQueryLength?: number;
}

interface UseSearchReturn {
  // Search results
  results: SearchedBook[];
  suggestions: Suggestion[];
  total: number;
  page: number;
  limit: number;
  
  // State
  query: string;
  isLoading: boolean;
  isSuggestionsLoading: boolean;
  error: Error | null;
  
  // Actions
  setQuery: (query: string) => void;
  search: (query: string, page?: number, limit?: number) => Promise<void>;
  clearResults: () => void;
  clearSuggestions: () => void;
}

export const useSearch = (options: UseSearchOptions = {}): UseSearchReturn => {
  const { debounceMs = 300, minQueryLength = 2 } = options;
  
  const [query, setQueryState] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchParams, setSearchParams] = useState<{ query: string; page: number; limit: number } | null>(null);
  const [manualSuggestions, setManualSuggestions] = useState<Suggestion[]>([]);
  
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce query for suggestions
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, debounceMs]);


  // Fetch suggestions with debounced query
  const suggestionsQuery = useQuery({
    queryKey: ['searchSuggestions', debouncedQuery],
    queryFn: () => booksApi.getSearchSuggestions(debouncedQuery),
    enabled: debouncedQuery.length >= minQueryLength,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Fetch search results
  const searchQuery = useQuery({
    queryKey: ['search', searchParams?.query, searchParams?.page, searchParams?.limit],
    queryFn: () => booksApi.searchBooks({
      query: searchParams!.query,
      page: searchParams!.page,
      limit: searchParams!.limit,
      highlight: true,
    }),
    enabled: !!searchParams && searchParams.query.length >= minQueryLength,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Set query with debouncing for suggestions
  const setQuery = useCallback((newQuery: string) => {
    setQueryState(newQuery);
  }, []);

  // Execute search
  const search = useCallback(async (searchQuery: string, page = 1, limit = 12) => {
    if (searchQuery.trim().length < minQueryLength) {
      return;
    }
    setSearchParams({ query: searchQuery.trim(), page, limit });
  }, [minQueryLength]);

  // Clear results
  const clearResults = useCallback(() => {
    setSearchParams(null);
  }, []);

  // Clear suggestions
  const clearSuggestions = useCallback(() => {
    setQueryState('');
    setDebouncedQuery('');
    setManualSuggestions([]);
  }, []);

  return {
    results: searchQuery.data?.books ?? [],
    suggestions: suggestionsQuery.data ?? manualSuggestions,
    total: searchQuery.data?.total ?? 0,
    page: searchQuery.data?.page ?? 1,
    limit: searchQuery.data?.limit ?? 12,
    query,
    isLoading: searchQuery.isLoading,
    isSuggestionsLoading: suggestionsQuery.isLoading,
    error: searchQuery.error as Error | null,
    setQuery,
    search,
    clearResults,
    clearSuggestions,
  };
};

export default useSearch;
