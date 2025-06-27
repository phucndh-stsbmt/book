import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksService } from './books.service';
import { BooksResolver } from './books.resolver';
import { Book } from './entities/book.entity';
import { Category } from '../categories/entities/category.entity';
import { Publisher } from '../publishers/entities/publisher.entity';
import { BooksRedisService } from './services/books-redis.service';

@Module({
  imports: [TypeOrmModule.forFeature([Book, Category, Publisher])], 
  providers: [BooksResolver, BooksService, BooksRedisService],
  exports: [BooksService, BooksRedisService],
})
export class BooksModule {}
