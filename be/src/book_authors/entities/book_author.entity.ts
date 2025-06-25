import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Book } from 'src/books/entities/book.entity';
import { Author } from 'src/authors/entities/author.entity';

@ObjectType()
@Entity('book_authors')
export class BookAuthor {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Book)
  @ManyToOne(() => Book)
  @JoinColumn({ name: 'bookId' })
  book: Book;

  @Field(() => Author)
  @ManyToOne(() => Author)
  @JoinColumn({ name: 'authorId' })
  author: Author;
}
