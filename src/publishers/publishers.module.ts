import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublishersService } from './publishers.service';
import { PublishersResolver } from './publishers.resolver';
import { Publisher } from './entities/publisher.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Publisher])],
  providers: [PublishersResolver, PublishersService],
  exports: [PublishersService],
})
export class PublishersModule {}
