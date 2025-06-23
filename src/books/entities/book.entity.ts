import { ObjectType, Field, Int } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { Publisher } from '../../publishers/entities/publisher.entity';

@ObjectType()
@Entity('books')
export class Book {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  isbn: string;

  @Field()
  @Column()
  title: string;

  @Field(() => String)
  @Column()
  description: string;

  @Field(() => Number)
  @Column()
  price: number;

  @Field(() => Number)
  @Column()
  stockQuantity: number;

  @Field(() => Number)
  @Column()
  page: number;

  @Field(() => String)
  @Column()
  language: string;

  @Field(() => Date)
  @Column()
  publicationDate: Date;

  @Field(() => String)
  @Column()
  coverImageUrl: string;

  @Field(() => Boolean)
  @Column()
  isActive: boolean;

  @Field(() => Category)
  @ManyToOne(() => Category)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Field(() => Publisher)
  @ManyToOne(() => Publisher)
  @JoinColumn({ name: 'publisherId' })
  publisher: Publisher;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt: Date;
}
