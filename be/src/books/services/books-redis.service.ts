import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { Book } from '../entities/book.entity';

@Injectable()
export class BooksRedisService implements OnModuleInit {
    private client!: Redis;
    private readonly logger = new Logger(BooksRedisService.name);
    private readonly CACHE_TTL = 1800; // 30 minutes
    private readonly CACHE_PREFIX = 'books';

    onModuleInit() {
        this.client = new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            password: process.env.REDIS_PASSWORD,
        });

        this.client.on('connect', () => {
            this.logger.log('Books Redis connected successfully');
        });

        this.client.on('error', (error) => {
            this.logger.error('Books Redis connection error:', error);
        });
    }

    async cacheAllBooks(books: Book[]): Promise<void> {
        try {
            const cacheKey = `${this.CACHE_PREFIX}:list`;
            await this.client.setex(cacheKey, this.CACHE_TTL, JSON.stringify(books));
            this.logger.log('Books list cached successfully');
        } catch (error) {
            this.logger.warn('Failed to cache books list:', error);
        }
    }

    async getCachedBooks(): Promise<Book[] | null> {
        try {
            const cacheKey = `${this.CACHE_PREFIX}:list`;
            const cached = await this.client.get(cacheKey);
            if (cached) {
                this.logger.log('Books retrieved from cache');
                const books = JSON.parse(cached) as Book[];
                return books.map(book => ({
                    ...book,
                    publicationDate: new Date(book.publicationDate),
                    createdAt: new Date(book.createdAt),
                    updatedAt: new Date(book.updatedAt),
                }));
            }
            return null;
        } catch (error) {
            this.logger.warn('Failed to get books list from cache:', error);
            return null;
        }
    }

    async cacheBook(book: Book): Promise<void> {
        try {
            const cacheKey = `${this.CACHE_PREFIX}:${book.id}`;
            await this.client.setex(cacheKey, this.CACHE_TTL, JSON.stringify(book));
            this.logger.log('Book cached successfully');
        } catch (error) {
            this.logger.warn('Failed to cache book:', error);
        }
    }

    async clearBookCache(id: number): Promise<void> {
        try {
            const cacheKey = `${this.CACHE_PREFIX}:${id}`;
            await this.client.del(cacheKey);
            this.logger.log('Book cache cleared successfully');
        } catch (error) {
            this.logger.warn('Failed to clear book cache:', error);
        }
    }

    async getCachedBook(id: number): Promise<Book | null> {
        try {
            const cacheKey = `${this.CACHE_PREFIX}:${id}`;
            const cached = await this.client.get(cacheKey);
            if (cached) {
                this.logger.log('Book retrieved from cache');
                const book = JSON.parse(cached) as Book;
                return {
                    ...book,
                    publicationDate: new Date(book.publicationDate),
                    createdAt: new Date(book.createdAt),
                    updatedAt: new Date(book.updatedAt),
                };
            }
            return null;
        } catch (error) {
            this.logger.warn('Failed to get book from cache:', error);
            return null;
        }
    }

    async clearBooksListCache(): Promise<void> {
        try {
            const cacheKey = `${this.CACHE_PREFIX}:list`;
            await this.client.del(cacheKey);
            this.logger.log('Books list cache cleared successfully');
        } catch (error) {
            this.logger.warn('Failed to clear books list cache:', error);
        }
    }

    async clearAllBooksCache(): Promise<void> {
        try {
            await this.client.flushall();
            this.logger.log('All books cache cleared successfully');
        } catch (error) {
            this.logger.warn('Failed to clear all books cache:', error);
        }
    }
}