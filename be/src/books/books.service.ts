import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBookInput } from './dto/create-book.input';
import { UpdateBookInput } from './dto/update-book.input';
import { Book } from './entities/book.entity';
import { Category } from '../categories/entities/category.entity';
import { Publisher } from '../publishers/entities/publisher.entity';
import { BooksRedisService } from './services/books-redis.service';
@Injectable()
export class BooksService {
  private readonly logger = new Logger(BooksService.name);
  constructor(
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Publisher)
    private publisherRepository: Repository<Publisher>,
    private booksRedisService: BooksRedisService,
  ) {}

  async create(createBookInput: CreateBookInput): Promise<Book> {
    const { categoryId, publisherId, ...bookData } = createBookInput;
    // Find the category and publisher
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });
    if (!category) {
      throw new Error(`Category with ID ${categoryId} not found`);
    }
    const publisher = await this.publisherRepository.findOne({
      where: { id: publisherId },
    });
    if (!publisher) {
      throw new Error(`Publisher with ID ${publisherId} not found`);
    }
    // Create book with the loaded entities
    const book = this.bookRepository.create({
      ...bookData,
      category,
      publisher,
    });
    const savedBook = await this.bookRepository.save(book);
    await this.booksRedisService.cacheBook(savedBook);
    await this.booksRedisService.clearBooksListCache();
    return savedBook;
  }

  async findAll(): Promise<Book[] | null> {
   try{
    const cachedBooks = await this.booksRedisService.getCachedBooks();

    if (cachedBooks) {
      this.logger.log('Books retrieved from cache');
      return cachedBooks;
    }
    const books = await this.bookRepository.find({ relations: ['category', 'publisher'] });
    await this.booksRedisService.cacheAllBooks(books);

    return books || null;
   }
   catch(error){
    this.logger.error('Error retrieving books:', error);
    return null;
   }
  }

  async findOne(id: number): Promise<Book | null> {
   try{
    const cachedBook = await this.booksRedisService.getCachedBook(id);
    if (cachedBook) {
      this.logger.log('Book retrieved from cache');
      return cachedBook;
    }
    const book = await this.bookRepository.findOne({ where: { id }, relations: ['category', 'publisher'] });
    if (!book) {
      throw new Error(`Book with ID ${id} not found`);
    }
    await this.booksRedisService.cacheBook(book);
    return book;
   }catch(error){
    this.logger.error('Error retrieving books:', error);
    return null;
   }
  }

  async update(id: number, updateBookInput: UpdateBookInput): Promise<Book> {
    const book = await this.bookRepository.findOne({ where: { id } });
    if (!book) {
      throw new Error(`Book with ID ${id} not found`);
    }
    const updatedBook = await this.bookRepository.save({
      ...book,
      ...updateBookInput,
    });
    await this.booksRedisService.cacheBook(updatedBook);
    await this.booksRedisService.clearBooksListCache();
    return updatedBook;
  }

  async remove(id: number): Promise<Book> {
    const book = await this.bookRepository.findOne({ where: { id } });
    if (!book) {
      throw new Error(`Book with ID ${id} not found`);
    }
    await this.booksRedisService.clearBookCache(id);
    await this.booksRedisService.clearBooksListCache();
    return book;
  }
}
