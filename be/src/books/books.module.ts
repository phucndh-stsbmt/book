import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksService } from './books.service';
import { BooksResolver } from './books.resolver';
import { Book } from './entities/book.entity';
import { Category } from '../categories/entities/category.entity';
import { Publisher } from '../publishers/entities/publisher.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Book, Category, Publisher])],
  providers: [BooksResolver, BooksService],
  exports: [BooksService],
})
export class BooksModule {}
