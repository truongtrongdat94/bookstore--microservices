/**
 * SearchService - Advanced Book Search using PostgreSQL Full-Text Search
 * 
 * Implements full-text search with:
 * - Relevance ranking using ts_rank_cd()
 * - Vietnamese diacritic-insensitive search using unaccent()
 * - Weighted multi-field search (title, author, publisher, description)
 * - Prefix matching for partial word search
 * - Autocomplete suggestions
 * - Result highlighting
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 3.1, 3.2, 4.1, 4.2, 4.3
 */

import { query } from '../config/database';
import { cache } from '../config/redis';
import redis from '../config/redis';
import { Book } from '../types';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'book-service-search' },
  transports: [new winston.transports.Console()]
});

// Search-specific interfaces
export interface SearchParams {
  query: string;
  page?: number;
  limit?: number;
  highlight?: boolean;
  highlightTags?: HighlightTags;
}

export interface HighlightTags {
  startTag: string;
  endTag: string;
}

export interface SearchedBook extends Book {
  rank: number;
  highlightedTitle?: string;
  highlightedDescription?: string;
  category_name?: string;
  average_rating?: number;
  review_count?: number;
}

export interface Suggestion {
  text: string;
  type: 'title' | 'author';
}

export interface SearchResult {
  books: SearchedBook[];
  suggestions: Suggestion[];
  total: number;
}

const DEFAULT_HIGHLIGHT_TAGS: HighlightTags = {
  startTag: '<mark>',
  endTag: '</mark>'
};

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const SEARCH_CACHE_TTL = 300; // 5 minutes (Requirement 5.4)
const SEARCH_CACHE_PREFIX = 'search:';
const MAX_SUGGESTIONS = 10;
const MIN_QUERY_LENGTH = 2;


class SearchService {
  /**
   * Generate cache key for search results
   * Property 12: Cache key consistency
   * 
   * Cache key format: search:q:<normalized_query>:p:<page>:l:<limit>:h:<highlight>
   * This ensures identical parameters produce identical keys.
   * 
   * Requirements: 5.4
   */
  generateCacheKey(params: SearchParams): string {
    const { query: q, page = DEFAULT_PAGE, limit = DEFAULT_LIMIT, highlight = false } = params;
    // Normalize query: lowercase, trim, and replace multiple spaces with single space
    const normalizedQuery = q.toLowerCase().trim().replace(/\s+/g, ' ');
    return `${SEARCH_CACHE_PREFIX}q:${normalizedQuery}:p:${page}:l:${limit}:h:${highlight}`;
  }

  /**
   * Invalidate all search cache entries
   * Called when books are created, updated, or deleted
   * 
   * Property 13: Cache invalidation on book changes
   * Requirements: 5.4
   */
  async invalidateSearchCache(): Promise<void> {
    try {
      // Use Redis SCAN to find and delete all search cache keys
      // This is more efficient than KEYS command for large datasets
      const pattern = `${SEARCH_CACHE_PREFIX}*`;
      let cursor = '0';
      let deletedCount = 0;

      do {
        const result = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
        cursor = result[0];
        const keys = result[1];

        if (keys.length > 0) {
          await redis.del(...keys);
          deletedCount += keys.length;
        }
      } while (cursor !== '0');

      logger.info('Search cache invalidated', { deletedCount });
    } catch (error) {
      logger.error('Search cache invalidation error:', error);
    }
  }

  /**
   * Build tsquery from search string with prefix matching support
   * Handles Vietnamese text by removing diacritics
   * Requirements: 1.2, 1.3
   */
  private buildTsQuery(searchQuery: string, prefixMatch: boolean = true): string {
    // Split query into words and filter empty strings
    const words = searchQuery.trim().split(/\s+/).filter(w => w.length > 0);
    
    if (words.length === 0) {
      return '';
    }

    // Build tsquery with prefix matching (:*) for each word
    // Apply unaccent-like normalization for Vietnamese support
    const queryParts = words.map(word => {
      // Escape special characters in the word
      const escaped = word.replace(/[&|!():*]/g, '');
      if (escaped.length === 0) return null;
      // Normalize the word (remove diacritics) for Vietnamese support
      const normalized = this.removeDiacritics(escaped);
      return prefixMatch ? `${normalized}:*` : normalized;
    }).filter(Boolean);

    return queryParts.join(' & ');
  }

  /**
   * Remove diacritics from text for Vietnamese support
   * This mirrors what PostgreSQL's unaccent() does
   */
  private removeDiacritics(text: string): string {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'D');
  }

  /**
   * Search books using PostgreSQL Full-Text Search
   * 
   * Requirements:
   * - 1.1: Return books ranked by relevance
   * - 1.2: Vietnamese diacritic-insensitive search
   * - 1.3: Prefix matching for partial word search
   * - 1.4: Include relevance score (0-1)
   * - 2.1: Search across title, author, description, publisher
   * - 2.2, 2.3: Weighted scoring (A=title, B=author, C=publisher, D=description)
   */
  async searchBooks(params: SearchParams): Promise<SearchResult> {
    const { 
      query: searchQuery, 
      page = DEFAULT_PAGE, 
      limit = DEFAULT_LIMIT,
      highlight = false,
      highlightTags = DEFAULT_HIGHLIGHT_TAGS
    } = params;

    // Validate query - must not be empty
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) {
      return { books: [], suggestions: [], total: 0 };
    }

    // Validate minimum query length for prefix matching (Requirement 1.3)
    // Each word must be at least 1 character after removing special chars
    const words = trimmedQuery.split(/\s+/).filter(w => {
      const cleaned = w.replace(/[&|!():*]/g, '');
      return cleaned.length > 0;
    });
    
    if (words.length === 0) {
      return { books: [], suggestions: [], total: 0 };
    }

    // Check cache first
    const cacheKey = this.generateCacheKey(params);
    const cached = await cache.get(cacheKey);
    if (cached) {
      return cached as SearchResult;
    }

    const offset = (page - 1) * limit;
    const tsQuery = this.buildTsQuery(trimmedQuery, true);

    if (!tsQuery) {
      return { books: [], suggestions: [], total: 0 };
    }

    // Build the search query with ranking
    // Using ts_rank_cd for relevance scoring with weights
    // Weights: A=1.0 (title), B=0.8 (author), C=0.6 (publisher), D=0.4 (description)
    // Note: We use plainto_tsquery for the unaccented query, then convert to prefix matching
    const searchSql = `
      WITH search_results AS (
        SELECT 
          b.*,
          c.name as category_name,
          COALESCE(AVG(r.rating), 0) as average_rating,
          COUNT(DISTINCT r.review_id) as review_count,
          ts_rank_cd(
            b.search_vector, 
            to_tsquery('simple', $1),
            32 -- normalization: divide by document length
          ) as raw_rank
        FROM books b
        LEFT JOIN categories c ON b.category_id = c.category_id
        LEFT JOIN reviews r ON b.book_id = r.book_id
        WHERE b.search_vector @@ to_tsquery('simple', $1)
        GROUP BY b.book_id, c.category_id
      ),
      max_rank AS (
        SELECT COALESCE(MAX(raw_rank), 1) as max_val FROM search_results
      )
      SELECT 
        sr.*,
        CASE 
          WHEN mr.max_val > 0 THEN LEAST(sr.raw_rank / mr.max_val, 1.0)
          ELSE 0
        END as rank
      FROM search_results sr, max_rank mr
      ORDER BY sr.raw_rank DESC
      LIMIT $2 OFFSET $3
    `;

    // Count query for total results
    const countSql = `
      SELECT COUNT(*) as total
      FROM books b
      WHERE b.search_vector @@ to_tsquery('simple', $1)
    `;

    try {
      const [searchResult, countResult] = await Promise.all([
        query(searchSql, [tsQuery, limit, offset]),
        query(countSql, [tsQuery])
      ]);

      let books: SearchedBook[] = searchResult.rows.map(row => ({
        ...row,
        rank: parseFloat(row.rank) || 0,
        average_rating: parseFloat(row.average_rating) || 0,
        review_count: parseInt(row.review_count) || 0
      }));

      // Add highlighting if requested
      if (highlight && books.length > 0) {
        books = await this.addHighlighting(books, trimmedQuery, highlightTags);
      }

      const total = parseInt(countResult.rows[0].total) || 0;

      const result: SearchResult = {
        books,
        suggestions: [],
        total
      };

      // Cache the result
      await cache.set(cacheKey, result, SEARCH_CACHE_TTL);

      return result;
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }


  /**
   * Add highlighting to search results using ts_headline
   * Requirements: 4.1, 4.2, 4.3
   */
  private async addHighlighting(
    books: SearchedBook[], 
    searchQuery: string,
    tags: HighlightTags
  ): Promise<SearchedBook[]> {
    const tsQuery = this.buildTsQuery(searchQuery, false);
    if (!tsQuery) return books;

    const bookIds = books.map(b => b.book_id);
    
    // Use ts_headline for highlighting
    const highlightSql = `
      SELECT 
        book_id,
        ts_headline(
          'simple',
          unaccent(COALESCE(title, '')),
          to_tsquery('simple', unaccent($1)),
          'StartSel=${tags.startTag}, StopSel=${tags.endTag}, MaxWords=50, MinWords=5'
        ) as highlighted_title,
        ts_headline(
          'simple',
          unaccent(COALESCE(description, '')),
          to_tsquery('simple', unaccent($1)),
          'StartSel=${tags.startTag}, StopSel=${tags.endTag}, MaxWords=35, MinWords=15, MaxFragments=1'
        ) as highlighted_description
      FROM books
      WHERE book_id = ANY($2)
    `;

    try {
      const result = await query(highlightSql, [tsQuery, bookIds]);
      
      const highlightMap = new Map<number, { title: string; description: string }>();
      for (const row of result.rows) {
        highlightMap.set(row.book_id, {
          title: row.highlighted_title,
          description: this.truncateSnippet(row.highlighted_description, 200, tags)
        });
      }

      return books.map(book => {
        const highlights = highlightMap.get(book.book_id);
        if (highlights) {
          return {
            ...book,
            highlightedTitle: highlights.title,
            highlightedDescription: highlights.description
          };
        }
        return book;
      });
    } catch (error) {
      console.error('Highlighting error:', error);
      return books;
    }
  }

  /**
   * Truncate description snippet to max length (excluding highlight tags)
   * Requirement: 4.3
   */
  private truncateSnippet(text: string, maxLength: number, tags: HighlightTags): string {
    if (!text) return '';
    
    // Remove highlight tags to calculate actual text length
    const plainText = text
      .replace(new RegExp(this.escapeRegex(tags.startTag), 'g'), '')
      .replace(new RegExp(this.escapeRegex(tags.endTag), 'g'), '');
    
    if (plainText.length <= maxLength) {
      return text;
    }

    // Find a good truncation point
    let truncateAt = maxLength;
    const lastSpace = plainText.lastIndexOf(' ', maxLength);
    if (lastSpace > maxLength * 0.7) {
      truncateAt = lastSpace;
    }

    // Rebuild with tags - this is approximate but maintains tag integrity
    let result = '';
    let plainIndex = 0;
    let i = 0;
    let inTag = false;
    let tagBuffer = '';

    while (i < text.length && plainIndex < truncateAt) {
      const char = text[i];
      
      // Check for start tag
      if (text.substring(i, i + tags.startTag.length) === tags.startTag) {
        result += tags.startTag;
        i += tags.startTag.length;
        inTag = true;
        continue;
      }
      
      // Check for end tag
      if (text.substring(i, i + tags.endTag.length) === tags.endTag) {
        result += tags.endTag;
        i += tags.endTag.length;
        inTag = false;
        continue;
      }

      result += char;
      plainIndex++;
      i++;
    }

    // Close any open tag
    if (inTag) {
      result += tags.endTag;
    }

    return result + '...';
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Get autocomplete suggestions
   * Requirements: 3.1, 3.2
   */
  async getSuggestions(searchQuery: string, limit: number = MAX_SUGGESTIONS): Promise<Suggestion[]> {
    const trimmedQuery = searchQuery.trim();
    
    if (trimmedQuery.length < MIN_QUERY_LENGTH) {
      return [];
    }

    // Use trigram similarity for fuzzy matching
    const suggestionSql = `
      (
        SELECT DISTINCT title as text, 'title' as type, 
               similarity(unaccent(title), unaccent($1)) as sim
        FROM books
        WHERE unaccent(title) ILIKE unaccent($2)
           OR similarity(unaccent(title), unaccent($1)) > 0.3
        ORDER BY sim DESC
        LIMIT $3
      )
      UNION ALL
      (
        SELECT DISTINCT author as text, 'author' as type,
               similarity(unaccent(author), unaccent($1)) as sim
        FROM books
        WHERE unaccent(author) ILIKE unaccent($2)
           OR similarity(unaccent(author), unaccent($1)) > 0.3
        ORDER BY sim DESC
        LIMIT $3
      )
      ORDER BY sim DESC
      LIMIT $3
    `;

    try {
      const result = await query(suggestionSql, [
        trimmedQuery,
        `%${trimmedQuery}%`,
        limit
      ]);

      return result.rows.map(row => ({
        text: row.text,
        type: row.type as 'title' | 'author'
      }));
    } catch (error) {
      console.error('Suggestions error:', error);
      return [];
    }
  }

  /**
   * Highlight terms in text (standalone method for external use)
   * Requirements: 4.1, 4.2
   */
  highlightTerms(
    text: string, 
    searchQuery: string, 
    tags: HighlightTags = DEFAULT_HIGHLIGHT_TAGS
  ): string {
    if (!text || !searchQuery) return text;

    const words = searchQuery.trim().split(/\s+/).filter(w => w.length > 0);
    if (words.length === 0) return text;

    let result = text;
    for (const word of words) {
      // Create case-insensitive regex for the word
      const regex = new RegExp(`(${this.escapeRegex(word)})`, 'gi');
      result = result.replace(regex, `${tags.startTag}$1${tags.endTag}`);
    }

    return result;
  }

  /**
   * Invalidate search cache for a specific book or all search caches
   * Requirement: 5.4
   * 
   * @deprecated Use invalidateSearchCache() instead for better performance
   */
  async invalidateCache(bookId?: number): Promise<void> {
    await this.invalidateSearchCache();
  }
}

// Export cache key generation for testing
export const generateSearchCacheKey = (params: SearchParams): string => {
  const service = new SearchService();
  return service.generateCacheKey(params);
};

export const searchService = new SearchService();
export default searchService;
