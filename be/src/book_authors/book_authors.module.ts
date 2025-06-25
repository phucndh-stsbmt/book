import { Module } from '@nestjs/common';
import { BookAuthorsService } from './book_authors.service';
import { BookAuthorsResolver } from './book_authors.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookAuthor } from './entities/book_author.entity';
import { Book } from '../books/entities/book.entity';
import { Author } from '../authors/entities/author.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BookAuthor, Book, Author])],
  providers: [BookAuthorsResolver, BookAuthorsService],
})
export class BookAuthorsModule {}
