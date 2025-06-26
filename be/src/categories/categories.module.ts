import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesService } from './categories.service';
import { CategoriesResolver } from './categories.resolver';
import { Category } from './entities/category.entity';
import { CategoriesRedisService } from './services/categories-redis.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category]),
  ],
  providers: [
    CategoriesResolver, 
    CategoriesService, 
    CategoriesRedisService
  ],
  exports: [CategoriesService, CategoriesRedisService],
})
export class CategoriesModule {}
