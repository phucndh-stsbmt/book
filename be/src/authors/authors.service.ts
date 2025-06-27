import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateAuthorInput } from './dto/create-author.input';
import { UpdateAuthorInput } from './dto/update-author.input';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Author } from './entities/author.entity';
import { AuthorsRedisService } from './services/authors-redis.service';

@Injectable()
export class AuthorsService {
  private readonly logger = new Logger(AuthorsService.name);
  constructor(
    @InjectRepository(Author)
    private authorRepository: Repository<Author>,
    private authorsRedisService: AuthorsRedisService,
  ) {}
  async create(createAuthorInput: CreateAuthorInput): Promise<Author> {
    const author = this.authorRepository.create(createAuthorInput);
    const savedAuthor = await this.authorRepository.save(author);
    await this.authorsRedisService.cacheAuthor(savedAuthor);
    await this.authorsRedisService.clearAuthorsListCache();
    return savedAuthor;
  }

  async findAll(): Promise<Author[]> {
    const cachedAuthors = await this.authorsRedisService.getCachedAuthors();
    if (cachedAuthors) {
      this.logger.log('Authors retrieved from cache');
      return cachedAuthors;
    }
    const authors = await this.authorRepository.find();
    await this.authorsRedisService.cacheAllAuthors(authors);
    return authors;
  }

  async findOne(id: number): Promise<Author> {
    const cachedAuthor = await this.authorsRedisService.getCachedAuthor(id);
    if (cachedAuthor) {
      this.logger.log('Author retrieved from cache');
      return cachedAuthor;
    }
    const author = await this.authorRepository.findOne({ where: { id } });
    if (!author) {
      throw new NotFoundException('Author not found');
    }
    await this.authorsRedisService.cacheAuthor(author);
    return author;
  }

  async update(
    id: number,
    updateAuthorInput: UpdateAuthorInput,
  ): Promise<Author> {
    const author = await this.authorRepository.findOne({ where: { id } });
    
    if (!author) {
      throw new NotFoundException('Author not found');
    }

    const updatedAuthor = await this.authorRepository.save({ ...author, ...updateAuthorInput });
    await this.authorsRedisService.cacheAuthor(updatedAuthor);
    await this.authorsRedisService.clearAuthorsListCache();
    return updatedAuthor;
  }

  async remove(id: number): Promise<Author> {
    const author = await this.authorRepository.findOne({ where: { id } });
    if (!author) {
      throw new NotFoundException('Author not found');
    }
    await this.authorRepository.remove(author);
    return author;
  }
}
