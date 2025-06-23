import { Module } from '@nestjs/common';
import { BookAuthorsService } from './book_authors.service';
import { BookAuthorsResolver } from './book_authors.resolver';

@Module({
  providers: [BookAuthorsResolver, BookAuthorsService],
})
export class BookAuthorsModule {}
