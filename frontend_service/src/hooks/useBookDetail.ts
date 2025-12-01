import { useState, useEffect } from 'react';
import { booksApi } from '../api';
import { Book } from '../types';

export interface UseBookDetailReturn {
  book: Book | null;
  relatedBooks: Book[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useBookDetail = (bookId: string | undefined): UseBookDetailReturn => {
  const [book, setBook] = useState<Book | null>(null);
  const [relatedBooks, setRelatedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState<number>(0);

  const refetch = () => {
    setRefetchTrigger(prev => prev + 1);
  };

  useEffect(() => {
    let isMounted = true;

    const fetchBookData = async () => {
      // Reset states
      setLoading(true);
      setError(null);
      setBook(null);
      setRelatedBooks([]);

      // Validate bookId
      if (!bookId) {
        if (isMounted) {
          setError('ID sách không hợp lệ');
          setLoading(false);
        }
        return;
      }

      const numericBookId = parseInt(bookId, 10);
      if (isNaN(numericBookId) || numericBookId <= 0) {
        if (isMounted) {
          setError('ID sách không hợp lệ');
          setLoading(false);
        }
        return;
      }

      try {
        // Fetch book data
        const bookData = await booksApi.getBook(numericBookId);
        
        if (!isMounted) return;
        
        setBook(bookData);

        // Fetch related books based on category_id
        if (bookData.category_id) {
          try {
            const relatedBooksData = await booksApi.getBooks({
              category: bookData.category_id,
              limit: 5, // Fetch 5 to exclude current book and show 4
            });

            if (!isMounted) return;

            // Filter out the current book and limit to 4
            const filteredRelatedBooks = relatedBooksData.items
              .filter(b => b.book_id !== numericBookId)
              .slice(0, 4);

            setRelatedBooks(filteredRelatedBooks);
          } catch (relatedError) {
            // Don't set error for related books failure
            // Just log it and continue with empty related books
            console.error('Failed to fetch related books:', relatedError);
            if (isMounted) {
              setRelatedBooks([]);
            }
          }
        }

        if (isMounted) {
          setLoading(false);
        }
      } catch (err: any) {
        if (!isMounted) return;

        // Handle different error types
        if (err.response?.status === 404) {
          setError('Không tìm thấy sách');
        } else if (err.message?.includes('Network Error') || !navigator.onLine) {
          setError('Không thể tải dữ liệu. Vui lòng kiểm tra kết nối mạng.');
        } else {
          setError(err.response?.data?.message || 'Không thể tải dữ liệu. Vui lòng thử lại.');
        }
        
        setLoading(false);
      }
    };

    fetchBookData();

    // Cleanup function to prevent memory leaks
    return () => {
      isMounted = false;
    };
  }, [bookId, refetchTrigger]);

  return {
    book,
    relatedBooks,
    loading,
    error,
    refetch,
  };
};
