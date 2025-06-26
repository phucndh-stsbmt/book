import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { Publisher } from '../entities/publisher.entity';

@Injectable()
export class PublishersRedisService implements OnModuleInit {
  private client!: Redis;
  private readonly logger = new Logger(PublishersRedisService.name);
  private readonly CACHE_TTL = 1800; // 30 minutes
  private readonly CACHE_PREFIX = 'publishers';

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
      this.logger.log('Publishers Redis connected successfully');
    });

    this.client.on('error', (error) => {
      this.logger.error('Publishers Redis connection error:', error);
    });
  }

  // Cache danh sách tất cả publishers
  async cacheAllPublishers(publishers: Publisher[]): Promise<void> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}:list`;
      await this.client.setex(cacheKey, this.CACHE_TTL, JSON.stringify(publishers));
      this.logger.log('Publishers list cached successfully');
    } catch (error) {
      this.logger.warn('Failed to cache publishers list:', error);
    }
  }
  async getCachedPublishers(): Promise<Publisher[] | null> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}:list`;
      const cached = await this.client.get(cacheKey);
      if (cached) {
        this.logger.log('Publishers retrieved from cache');
        return JSON.parse(cached) as Publisher[];
      }
      return null;
    } catch (error) {
      this.logger.warn('Failed to get publishers list from cache:', error);
      return null;
    }
  }
  // cache cụ thể theo id
  async cachePublisher(publisher: Publisher): Promise<void> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}:${publisher.id}`;
      await this.client.setex(cacheKey, this.CACHE_TTL, JSON.stringify(publisher));
      this.logger.log(`Publisher ${publisher.id} cached successfully`);
    } catch (error) {
      this.logger.warn(`Failed to cache publisher ${publisher.id}:`, error);
    }
  }
  // lấy cache cụ thể theo id
  async getCachedPublisher(id: number): Promise<Publisher | null> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}:${id}`;
      const cached = await this.client.get(cacheKey);
      if (cached) {
        this.logger.log(`Publisher ${id} retrieved from cache`);
        return JSON.parse(cached) as Publisher;
      }
      return null;
    } catch (error) {
      this.logger.warn(`Failed to get publisher ${id} from cache:`, error);
      return null;
    }
  }
  // xóa cache cụ thể
  async clearPublisherCache(id: number): Promise<void> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}:${id}`;
      await this.client.del(cacheKey);
      this.logger.log(`Publisher ${id} cache cleared`);
    } catch (error) {
      this.logger.warn(`Failed to clear cache for publisher ${id}:`, error);
    }
  }
  // xóa cache danh sách publishers
  async clearPublishersListCache(): Promise<void> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}:list`;
      await this.client.del(cacheKey);
      this.logger.log('Publishers list cache cleared');
    } catch (error) {
      this.logger.warn('Failed to clear publishers list cache:', error);
    }
  }
  // xóa cache tất cả publishers
  async clearAllPublishersCache(): Promise<void> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}:*`;
      const keys = await this.client.keys(cacheKey);
      if (keys.length > 0) {
        await this.client.del(...keys);
        this.logger.log(`Cleared ${keys.length} publishers cache keys`);
      } else {
        this.logger.log('No publishers cache keys found');
      }
    } catch (error) {
      this.logger.warn('Failed to clear all publishers cache:', error);
    }
  }
  // Cache search results (cho tương lai nếu implement search)
  async cacheSearchResults(query: string, results: Publisher[]): Promise<void> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}:search:${query}`;
      await this.client.setex(cacheKey, this.CACHE_TTL / 2, JSON.stringify(results));
      this.logger.log(`Search results for "${query}" cached successfully`);
    } catch (error) {
      this.logger.warn(`Failed to cache search results for "${query}":`, error);
    }
  }
  async getCachedSearchResults(query: string): Promise<Publisher[] | null> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}:search:${query}`;
      const cached = await this.client.get(cacheKey);
      if (cached) {
        this.logger.log(`Search results for "${query}" retrieved from cache`);
        return JSON.parse(cached) as Publisher[];
      }
      return null;
    } catch (error) {
      this.logger.warn(`Failed to get search results for "${query}" from cache:`, error);
      return null;
    }
  }
}
