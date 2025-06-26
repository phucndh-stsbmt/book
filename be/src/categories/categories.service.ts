import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoryInput } from './dto/create-category.input';
import { Category } from './entities/category.entity';
import { CategoriesRedisService } from './services/categories-redis.service';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    private categoriesRedisService: CategoriesRedisService,
  ) {}

  async create(createCategoryInput: CreateCategoryInput): Promise<Category> {
    const category = this.categoryRepository.create(createCategoryInput);
    const savedCategory = await this.categoryRepository.save(category);
    
    // Cache category mới và clear list cache
    await this.categoriesRedisService.cacheCategory(savedCategory);
    await this.categoriesRedisService.clearCategoriesListCache();
    
    this.logger.log(`Created category with ID: ${savedCategory.id}`);
    return savedCategory;
  }

  async findAll(): Promise<Category[]> {
    // Thử lấy từ cache trước
    const cachedCategories = await this.categoriesRedisService.getCachedCategories();
    if (cachedCategories) {
      return cachedCategories;
    }

    // Nếu không có trong cache, query database
    const categories = await this.categoryRepository.find({
      order: { createdAt: 'DESC' },
    });
    
    // Cache kết quả
    await this.categoriesRedisService.cacheAllCategories(categories);
    
    return categories;
  }

  async findOne(id: number): Promise<Category> {
    // Thử lấy từ cache trước
    const cachedCategory = await this.categoriesRedisService.getCachedCategory(id);
    if (cachedCategory) {
      return cachedCategory;
    }

    // Nếu không có trong cache, query database
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    
    // Cache kết quả
    await this.categoriesRedisService.cacheCategory(category);
    
    return category;
  }

  async update(
    id: number,
    updateCategoryInput: Partial<CreateCategoryInput>,
  ): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    
    const updatedCategory = await this.categoryRepository.save({
      ...category,
      ...updateCategoryInput,
    });
    
    // Update cache và clear list cache
    await this.categoriesRedisService.cacheCategory(updatedCategory);
    await this.categoriesRedisService.clearCategoriesListCache();
    
    this.logger.log(`Updated category with ID: ${id}`);
    return updatedCategory;
  }

  async remove(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    
    // Lưu category trước khi xóa để trả về
    const categoryToReturn = { ...category };
    await this.categoryRepository.remove(category);
    
    // Clear cache
    await this.categoriesRedisService.clearCategoryCache(id);
    await this.categoriesRedisService.clearCategoriesListCache();
    
    this.logger.log(`Removed category with ID: ${id}`);
    return categoryToReturn;
  }

  // Additional methods for cache management
  async clearAllCache(): Promise<void> {
    await this.categoriesRedisService.clearAllCategoriesCache();
    this.logger.log('All categories cache cleared');
  }

  async getCacheStats(): Promise<{ totalKeys: number; memoryUsage: string }> {
    return this.categoriesRedisService.getCacheStats();
  }

  async isRedisConnected(): Promise<boolean> {
    return this.categoriesRedisService.isConnected();
  }
}
