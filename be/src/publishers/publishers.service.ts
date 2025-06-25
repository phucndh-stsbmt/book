import { Injectable } from '@nestjs/common';
import { CreatePublisherInput } from './dto/create-publisher.input';
import { UpdatePublisherInput } from './dto/update-publisher.input';
import { Publisher } from './entities/publisher.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PublishersService {
  constructor(
    @InjectRepository(Publisher)
    private publisherRepository: Repository<Publisher>,
  ) {}

  async create(createPublisherInput: CreatePublisherInput): Promise<Publisher> {
    const publisher = this.publisherRepository.create(createPublisherInput);
    return this.publisherRepository.save(publisher);
  }

  async findAll(): Promise<Publisher[]> {
    return this.publisherRepository.find();
  }

  async findOne(id: number): Promise<Publisher> {
    const publisher = await this.publisherRepository.findOne({ where: { id } });
    if (!publisher) {
      throw new Error(`Publisher with ID ${id} not found`);
    }
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
    return this.publisherRepository.save({
      ...publisher,
      ...updatePublisherInput,
    });
  }

  async remove(id: number): Promise<Publisher> {
    const publisher = await this.publisherRepository.findOne({ where: { id } });
    if (!publisher) {
      throw new Error(`Publisher with ID ${id} not found`);
    }
    // Lưu publisher trước khi xóa để trả về
    const publisherToReturn = { ...publisher };
    await this.publisherRepository.remove(publisher);
    return publisherToReturn;
  }
}
