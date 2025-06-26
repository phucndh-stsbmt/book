import { Injectable, Logger } from '@nestjs/common';
import { CreatePublisherInput } from './dto/create-publisher.input';
import { UpdatePublisherInput } from './dto/update-publisher.input';
import { Publisher } from './entities/publisher.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PublishersRedisService } from './services/publishers-redis.service';

@Injectable()
export class PublishersService {

  private readonly logger = new Logger(PublishersService.name);

  constructor(
    @InjectRepository(Publisher)
    private publisherRepository: Repository<Publisher>,
    private publishersRedisService: PublishersRedisService,
  ) {}

  async create(createPublisherInput: CreatePublisherInput): Promise<Publisher> {
    const publisher = this.publisherRepository.create(createPublisherInput);
    const savedPublisher = await this.publisherRepository.save(publisher);
    await this.publishersRedisService.clearPublishersListCache();
    this.logger.log(`Created publisher with ID: ${savedPublisher.id}`);
    return savedPublisher;
  }

  async findAll(): Promise<Publisher[]> {
    const cachedPublishers = await this.publishersRedisService.getCachedPublishers();
    if (cachedPublishers) {
      return cachedPublishers;
    }
    const publishers = await this.publisherRepository.find();
    await this.publishersRedisService.cacheAllPublishers(publishers);
    return publishers;
  }

  async findOne(id: number): Promise<Publisher> {
    // Thử lấy từ cache trước
    const cachedPublisher = await this.publishersRedisService.getCachedPublisher(id);
    if (cachedPublisher) {
      return cachedPublisher;
    }
    // Nếu không có trong cache, query database
    const publisher = await this.publisherRepository.findOne({ where: { id } });
    if (!publisher) {
      throw new Error(`Publisher with ID ${id} not found`);
    }
    await this.publishersRedisService.cachePublisher(publisher);
    return publisher;
  }

  async update(
    id: number,
    updatePublisherInput: UpdatePublisherInput,
  ): Promise<Publisher> {
    const publisher = await this.publisherRepository.findOne({ where: { id } });
    if (!publisher) {
      throw new Error(`Publisher with ID ${id} not found`);
    }
    const updatedPublisher = await this.publisherRepository.save({
      ...publisher,
      ...updatePublisherInput,
    });
    await this.publishersRedisService.cachePublisher(updatedPublisher);
    await this.publishersRedisService.clearPublishersListCache();
    this.logger.log(`Updated publisher with ID: ${id}`);
    return updatedPublisher;
  }

  async remove(id: number): Promise<Publisher> {
    console.log(id);
    const publisher = await this.publisherRepository.findOne({ where: { id } });
    console.log(publisher);
    if (!publisher) {
      throw new Error(`Publisher with ID ${id} not found`);
    }
    // Lưu publisher trước khi xóa để trả về
    const publisherToReturn = { ...publisher };
    await this.publisherRepository.remove(publisher);

    // clear cache
    await this.publishersRedisService.clearPublisherCache(id);
    await this.publishersRedisService.clearPublishersListCache();
    
    this.logger.log(`Removed publisher with ID: ${id}`);
    return publisherToReturn;
  }

  
}
