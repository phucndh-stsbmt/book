import { ObjectType, Field, Int } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType()
@Entity('authors')
export class Author {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column({ unique: true })
  name: string;

  @Field(() => String)
  @Column()
  biography: string;

  @Field(() => String)
  @Column()
  nationality: string;

  @Field(() => Date)
  @Column()
  dateOfBirth: Date;

  @Field(() => Date, { nullable: true })
  @Column({ nullable: true })
  dateOfDeath: Date;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  imageUrl: string;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => Boolean, { defaultValue: true })
  @Column({ default: true })
  isActive: boolean;
}
