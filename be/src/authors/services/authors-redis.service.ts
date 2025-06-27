import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Redis } from 'ioredis';
import { Author } from '../entities/author.entity';

@Injectable()
export class AuthorsRedisService implements OnModuleInit {
  private client!: Redis;
  private readonly logger = new Logger(AuthorsRedisService.name);
  private readonly CACHE_TTL = 1800; // 30 minutes
  private readonly CACHE_PREFIX = 'authors';

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
      this.logger.log('Authors Redis connected successfully');
    });

    this.client.on('error', (error) => {
      this.logger.error('Authors Redis connection error:', error);
    });
  }

  async cacheAllAuthors(authors: Author[]): Promise<void> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}:list`;
      await this.client.setex(cacheKey, this.CACHE_TTL, JSON.stringify(authors));
      this.logger.log('Authors list cached successfully');

    } catch (error) {
      this.logger.warn('Failed to cache authors list:', error);
    }
  }

  async getCachedAuthors(): Promise<Author[] | null> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}:list`;
      const cached = await this.client.get(cacheKey);
      
      if (cached) {
        this.logger.log('Authors retrieved from cache');
        const authors = JSON.parse(cached) as Author[];
        return authors.map(author => ({
          ...author,
          dateOfBirth: new Date(author.dateOfBirth),
          dateOfDeath: new Date(author.dateOfDeath),
          createdAt: new Date(author.createdAt),
          updatedAt: new Date(author.updatedAt),
        }));
      }
      return null;
    } catch (error) {
      this.logger.warn('Failed to get authors list from cache:', error);
      return null;
    }
  }

  async cacheAuthor(author: Author): Promise<void> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}:${author.id}`;
      await this.client.setex(cacheKey, this.CACHE_TTL, JSON.stringify(author));
      this.logger.log('Author cached successfully');
    } catch (error) {
      this.logger.warn('Failed to cache author:', error);
    }
  }

  async getCachedAuthor(id: number): Promise<Author | null> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}:${id}`;
      const cached = await this.client.get(cacheKey);
      if (cached) {
        this.logger.log('Author retrieved from cache');
        const author = JSON.parse(cached) as Author;
        return {
          ...author,
          dateOfBirth: new Date(author.dateOfBirth),
          dateOfDeath: new Date(author.dateOfDeath),
          createdAt: new Date(author.createdAt),
          updatedAt: new Date(author.updatedAt),
        };
      }
      return null;
    } catch (error) {
      this.logger.warn('Failed to get author from cache:', error);
      return null;
    }
  }

  async clearAuthorCache(id: number): Promise<void> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}:${id}`;
      await this.client.del(cacheKey);
      this.logger.log('Author cache cleared successfully');
    } catch (error) {
      this.logger.warn('Failed to clear author cache:', error);
    }
  }

  async clearAllAuthorsCache(): Promise<void> {
    try {
      await this.client.flushall();
      this.logger.log('All authors cache cleared successfully');
    } catch (error) {
      this.logger.warn('Failed to clear all authors cache:', error);
    }
  }

  async clearAuthorsListCache(): Promise<void> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}:list`;
      await this.client.del(cacheKey);
      this.logger.log('Authors list cache cleared successfully');
    } catch (error) {
      this.logger.warn('Failed to clear authors list cache:', error);
    }
  }

  async clearAllCache(): Promise<void> {
    try {
      await this.client.flushall();
      this.logger.log('All cache cleared successfully');
    } catch (error) {
      this.logger.warn('Failed to clear all cache:', error);
    }
  }

}
