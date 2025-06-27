import { Module } from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { AuthorsResolver } from './authors.resolver';
import { Author } from './entities/author.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorsRedisService } from './services/authors-redis.service';

@Module({
  imports: [TypeOrmModule.forFeature([Author])], 
  providers: [AuthorsResolver, AuthorsService, AuthorsRedisService],
  exports: [AuthorsService, AuthorsRedisService],
})
export class AuthorsModule {}
