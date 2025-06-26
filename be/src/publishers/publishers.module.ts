import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublishersService } from './publishers.service';
import { PublishersResolver } from './publishers.resolver';
import { Publisher } from './entities/publisher.entity';
import { PublishersRedisService } from './services/publishers-redis.service'; 
@Module({
  imports: [TypeOrmModule.forFeature([Publisher])],
  providers: [PublishersResolver, PublishersService, PublishersRedisService],
  exports: [PublishersService, PublishersRedisService],
})
export class PublishersModule {}
