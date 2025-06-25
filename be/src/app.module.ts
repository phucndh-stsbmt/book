import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { BooksModule } from './books/books.module';
import { databaseModule } from './config/database.module';
import { redisModule } from './config/redis.module';
import { graphqlModule } from './config/graphql.module';
import { AuthorsModule } from './authors/authors.module';
import { BookAuthorsModule } from './book_authors/book_authors.module';
import { PublishersModule } from './publishers/publishers.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    databaseModule,
    redisModule,
    graphqlModule,
    UsersModule,
    CategoriesModule,
    BooksModule,
    AuthorsModule,
    BookAuthorsModule,
    PublishersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
