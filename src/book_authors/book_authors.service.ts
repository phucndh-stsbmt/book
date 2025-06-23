import { Injectable } from '@nestjs/common';
import { CreateBookAuthorInput } from './dto/create-book_author.input';
import { UpdateBookAuthorInput } from './dto/update-book_author.input';

@Injectable()
export class BookAuthorsService {
  create(createBookAuthorInput: CreateBookAuthorInput) {
    return 'This action adds a new bookAuthor';
  }

  findAll() {
    return `This action returns all bookAuthors`;
  }

  findOne(id: number) {
    return `This action returns a #${id} bookAuthor`;
  }

  update(id: number, updateBookAuthorInput: UpdateBookAuthorInput) {
    return `This action updates a #${id} bookAuthor`;
  }

  remove(id: number) {
    return `This action removes a #${id} bookAuthor`;
  }
}
