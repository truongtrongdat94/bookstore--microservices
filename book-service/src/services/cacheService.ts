import { cache } from '../config/redis';
import config from '../config';

class CacheService {
  private readonly defaultTTL = 300; // 5 minutes

  // Generate cache key
  private generateKey(prefix: string, identifier: string | number): string {
    return `${prefix}:${identifier}`;
  }

  // Books caching
  async getBooks(queryParams: string): Promise<any> {
    const key = this.generateKey('books', queryParams);
    return await cache.get(key);
  }

  async setBooks(queryParams: string, data: any, ttl?: number): Promise<void> {
    const key = this.generateKey('books', queryParams);
    await cache.set(key, data, ttl || this.defaultTTL);
  }

  async getBook(bookId: number): Promise<any> {
    const key = this.generateKey('book', bookId);
    return await cache.get(key);
  }

  async setBook(bookId: number, data: any, ttl?: number): Promise<void> {
    const key = this.generateKey('book', bookId);
    await cache.set(key, data, ttl || this.defaultTTL);
  }

  async invalidateBook(bookId: number): Promise<void> {
    const key = this.generateKey('book', bookId);
    await cache.del(key);
  }

  // Categories caching
  async getCategories(): Promise<any> {
    const key = 'categories:all';
    return await cache.get(key);
  }

  async setCategories(data: any, ttl?: number): Promise<void> {
    const key = 'categories:all';
    await cache.set(key, data, ttl || this.defaultTTL);
  }

  async getCategoryTree(): Promise<any> {
    const key = 'categories:tree';
    return await cache.get(key);
  }

  async setCategoryTree(data: any, ttl?: number): Promise<void> {
    const key = 'categories:tree';
    await cache.set(key, data, ttl || this.defaultTTL);
  }

  async invalidateCategories(): Promise<void> {
    await cache.del('categories:all');
    await cache.del('categories:tree');
  }

  // Reviews caching
  async getReviews(bookId: number, queryParams: string): Promise<any> {
    const key = this.generateKey('reviews', `${bookId}:${queryParams}`);
    return await cache.get(key);
  }

  async setReviews(bookId: number, queryParams: string, data: any, ttl?: number): Promise<void> {
    const key = this.generateKey('reviews', `${bookId}:${queryParams}`);
    await cache.set(key, data, ttl || this.defaultTTL);
  }

  async getReviewStats(bookId: number): Promise<any> {
    const key = this.generateKey('review-stats', bookId);
    return await cache.get(key);
  }

  async setReviewStats(bookId: number, data: any, ttl?: number): Promise<void> {
    const key = this.generateKey('review-stats', bookId);
    await cache.set(key, data, ttl || this.defaultTTL);
  }

  async invalidateReviews(bookId: number): Promise<void> {
    // Note: This is a simple implementation. In production, you might want to use Redis SCAN
    // to find and delete all keys matching the pattern
    await cache.del(this.generateKey('review-stats', bookId));
  }

  // Bestsellers caching
  async getBestsellers(): Promise<any> {
    const key = 'books:bestsellers';
    return await cache.get(key);
  }

  async setBestsellers(data: any, ttl?: number): Promise<void> {
    const key = 'books:bestsellers';
    await cache.set(key, data, ttl || this.defaultTTL);
  }

  // Flush all cache
  async flushAll(): Promise<void> {
    await cache.flush();
  }

  // Invalidate all book-related caches
  async invalidateAllBooks(): Promise<void> {
    // In production, use Redis SCAN to find all book-related keys
    await cache.flush();
  }
}

export const cacheService = new CacheService();
export default cacheService;
