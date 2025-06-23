import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBookInput } from './dto/create-book.input';
import { UpdateBookInput } from './dto/update-book.input';
import { Book } from './entities/book.entity';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
  ) {}

  async create(createBookInput: CreateBookInput): Promise<Book> {
    const book = this.bookRepository.create(createBookInput);
    return this.bookRepository.save(book);
  }

  async findAll(): Promise<Book[]> {
    return this.bookRepository.find({ relations: ['category'] });
  }

  async findOne(id: number): Promise<Book> {
    const book = await this.bookRepository.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!book) {
      throw new Error(`Book with ID ${id} not found`);
    }
    return book;
  }

  async update(id: number, updateBookInput: UpdateBookInput): Promise<Book> {
    const book = await this.bookRepository.findOne({ where: { id } });
    if (!book) {
      throw new Error(`Book with ID ${id} not found`);
    }
    return this.bookRepository.save({
      ...book,
      ...updateBookInput,
    });
  }

  async remove(id: number): Promise<Book> {
    const book = await this.bookRepository.findOne({ where: { id } });
    if (!book) {
      throw new Error(`Book with ID ${id} not found`);
    }
    return this.bookRepository.remove(book);
  }
}
