import { Injectable } from '@nestjs/common';
import { CreateBookAuthorInput } from './dto/create-book_author.input';
import { UpdateBookAuthorInput } from './dto/update-book_author.input';
import { BookAuthor } from './entities/book_author.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from 'src/books/entities/book.entity';
import { Author } from 'src/authors/entities/author.entity';

@Injectable()
export class BookAuthorsService {
  constructor(
    @InjectRepository(BookAuthor)
    private bookAuthorRepository: Repository<BookAuthor>,
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
    @InjectRepository(Author)
    private authorRepository: Repository<Author>,
  ) {}

  async create(createBookAuthorInput: CreateBookAuthorInput) {
    const { bookId, authorId } = createBookAuthorInput;
    const book = await this.bookRepository.findOne({ where: { id: bookId } });
    const author = await this.authorRepository.findOne({
      where: { id: authorId },
    });
    if (!book) {
      throw new Error('Book not found');
    }
    if (!author) {
      throw new Error('Author not found');
    }
    const bookAuthor = new BookAuthor();
    bookAuthor.book = book;
    bookAuthor.author = author;
    return this.bookAuthorRepository.save(bookAuthor);
  }

  findAll() {
    return this.bookAuthorRepository.find({
      relations: ['book', 'author'],
    });
  }

  findOne(id: number) {
    return this.bookAuthorRepository.findOne({
      where: { id },
      relations: ['book', 'author'],
    });
  }

  async update(id: number, updateBookAuthorInput: UpdateBookAuthorInput) {
    const { bookId, authorId } = updateBookAuthorInput;
    // Kiểm tra BookAuthor có tồn tại không
    const existingBookAuthor = await this.bookAuthorRepository.findOne({
      where: { id },
      relations: ['book', 'author'],
    });
    if (!existingBookAuthor) {
      throw new Error('BookAuthor not found');
    }
    // Chuẩn bị dữ liệu update
    const updateData: { book?: { id: number }; author?: { id: number } } = {};

    // Nếu có bookId mới, kiểm tra và cập nhật
    if (bookId !== undefined) {
      const book = await this.bookRepository.findOne({ where: { id: bookId } });
      if (!book) {
        throw new Error('Book not found');
      }
      updateData.book = { id: bookId };
    }
    // Nếu có authorId mới, kiểm tra và cập nhật
    if (authorId !== undefined) {
      const author = await this.authorRepository.findOne({
        where: { id: authorId },
      });
      if (!author) {
        throw new Error('Author not found');
      }
      updateData.author = { id: authorId };
    }

    // Nếu không có gì để update
    if (Object.keys(updateData).length === 0) {
      throw new Error('No fields to update');
    }

    // Thực hiện update
    await this.bookAuthorRepository.update(id, updateData);

    // Trả về record đã update với relations
    return this.bookAuthorRepository.findOne({
      where: { id },
      relations: ['book', 'author'],
    });
  }

  async remove(id: number) {
    return this.bookAuthorRepository.delete(id);
  }
}
