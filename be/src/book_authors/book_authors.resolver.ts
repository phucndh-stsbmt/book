import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { BookAuthorsService } from './book_authors.service';
import { BookAuthor } from './entities/book_author.entity';
import { CreateBookAuthorInput } from './dto/create-book_author.input';
import { UpdateBookAuthorInput } from './dto/update-book_author.input';
@Resolver(() => BookAuthor)
export class BookAuthorsResolver {
  constructor(private readonly bookAuthorsService: BookAuthorsService) {}

  @Mutation(() => BookAuthor)
  createBookAuthor(
    @Args('createBookAuthorInput') createBookAuthorInput: CreateBookAuthorInput,
  ) {
    return this.bookAuthorsService.create(createBookAuthorInput);
  }

  @Query(() => [BookAuthor], { name: 'bookAuthors' })
  findAll() {
    return this.bookAuthorsService.findAll();
  }

  @Query(() => BookAuthor, { name: 'bookAuthor' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.bookAuthorsService.findOne(id);
  }

  @Mutation(() => BookAuthor)
  updateBookAuthor(
    @Args('updateBookAuthorInput') updateBookAuthorInput: UpdateBookAuthorInput,
  ) {
    return this.bookAuthorsService.update(
      updateBookAuthorInput.id,
      updateBookAuthorInput,
    );
  }

  @Mutation(() => BookAuthor)
  removeBookAuthor(@Args('id', { type: () => Int }) id: number) {
    return this.bookAuthorsService.remove(id);
  }
}
