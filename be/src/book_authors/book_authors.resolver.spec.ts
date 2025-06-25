import { Test, TestingModule } from '@nestjs/testing';
import { BookAuthorsResolver } from './book_authors.resolver';
import { BookAuthorsService } from './book_authors.service';

describe('BookAuthorsResolver', () => {
  let resolver: BookAuthorsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BookAuthorsResolver, BookAuthorsService],
    }).compile();

    resolver = module.get<BookAuthorsResolver>(BookAuthorsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
