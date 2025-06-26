import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { Category } from '../entities/category.entity';

@Injectable()
export class CategoriesRedisService implements OnModuleInit {
  private client!: Redis;
  private readonly logger = new Logger(CategoriesRedisService.name);
  private readonly CACHE_TTL = 1800; // 30 minutes
  private readonly CACHE_PREFIX = 'categories';

  onModuleInit() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      maxRetriesPerRequest: 3,
      retryStrategy: (times: number) => {
        return Math.min(times * 50, 1000);
      },
    });

    this.client.on('connect', () => {
      this.logger.log('Categories Redis connected successfully');
    });

    this.client.on('error', (error) => {
      this.logger.error('Categories Redis connection error:', error);
    });
  }

  // Cache danh sách tất cả categories
  async cacheAllCategories(categories: Category[]): Promise<void> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}:list`;
      await this.client.setex(
        cacheKey,
        this.CACHE_TTL,
        JSON.stringify(categories),
      );
      this.logger.log('Categories list cached successfully');
    } catch (error) {
      this.logger.warn('Failed to cache categories list:', error);
    }
  }

  // Lấy danh sách categories từ cache
  async getCachedCategories(): Promise<Category[] | null> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}:list`;
      const cached = await this.client.get(cacheKey);
      if (cached) {
        this.logger.log('Categories retrieved from cache');
        return JSON.parse(cached) as Category[];
      }
      return null;
    } catch (error) {
      this.logger.warn('Failed to get categories from cache:', error);
      return null;
    }
  }

  // Cache một category cụ thể
  async cacheCategory(category: Category): Promise<void> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}:${category.id}`;
      await this.client.setex(
        cacheKey,
        this.CACHE_TTL,
        JSON.stringify(category),
      );
      this.logger.log(`Category ${category.id} cached successfully`);
    } catch (error) {
      this.logger.warn(`Failed to cache category ${category.id}:`, error);
    }
  }

  // Lấy category từ cache theo ID
  async getCachedCategory(id: number): Promise<Category | null> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}:${id}`;
      const cached = await this.client.get(cacheKey);
      if (cached) {
        this.logger.log(`Category ${id} retrieved from cache`);
        return JSON.parse(cached) as Category;
      }
      return null;
    } catch (error) {
      this.logger.warn(`Failed to get category ${id} from cache:`, error);
      return null;
    }
  }

  // Xóa cache của một category cụ thể
  async clearCategoryCache(id: number): Promise<void> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}:${id}`;
      await this.client.del(cacheKey);
      this.logger.log(`Category ${id} cache cleared`);
    } catch (error) {
      this.logger.warn(`Failed to clear cache for category ${id}:`, error);
    }
  }

  // Xóa cache danh sách categories
  async clearCategoriesListCache(): Promise<void> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}:list`;
      await this.client.del(cacheKey);
      this.logger.log('Categories list cache cleared');
    } catch (error) {
      this.logger.warn('Failed to clear categories list cache:', error);
    }
  }

  // Xóa tất cả cache liên quan đến categories
  async clearAllCategoriesCache(): Promise<void> {
    try {
      const pattern = `${this.CACHE_PREFIX}:*`;
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
        this.logger.log(`Cleared ${keys.length} categories cache keys`);
      }
    } catch (error) {
      this.logger.warn('Failed to clear all categories cache:', error);
    }
  }

  // Cache search results (cho tương lai nếu implement search)
  async cacheSearchResults(query: string, results: Category[]): Promise<void> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}:search:${query}`;
      await this.client.setex(
        cacheKey,
        this.CACHE_TTL / 2, // Search cache TTL ngắn hơn
        JSON.stringify(results),
      );
      this.logger.log(`Search results for "${query}" cached successfully`);
    } catch (error) {
      this.logger.warn(`Failed to cache search results for "${query}":`, error);
    }
  }

  // Lấy search results từ cache
  async getCachedSearchResults(query: string): Promise<Category[] | null> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}:search:${query}`;
      const cached = await this.client.get(cacheKey);
      if (cached) {
        this.logger.log(`Search results for "${query}" retrieved from cache`);
        return JSON.parse(cached) as Category[];
      }
      return null;
    } catch (error) {
      this.logger.warn(`Failed to get search results for "${query}" from cache:`, error);
      return null;
    }
  }

  // Health check cho Redis connection
  async isConnected(): Promise<boolean> {
    try {
      await this.client.ping();
      return true;
    } catch (error) {
      this.logger.error('Redis health check failed:', error);
      return false;
    }
  }

  // Get cache statistics
  async getCacheStats(): Promise<{ totalKeys: number; memoryUsage: string }> {
    try {
      const pattern = `${this.CACHE_PREFIX}:*`;
      const keys = await this.client.keys(pattern);
      
      return {
        totalKeys: keys.length,
        memoryUsage: 'Available via Redis CLI',
      };
    } catch (error) {
      this.logger.warn('Failed to get cache stats:', error);
      return { totalKeys: 0, memoryUsage: '0 KB' };
    }
  }
} 