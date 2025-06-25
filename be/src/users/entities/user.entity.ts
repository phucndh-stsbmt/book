import { ObjectType, Field, Int } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType()
@Entity('users')
export class User {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ unique: true })
  email: string;

  @Column()
  password?: string;

  @Field()
  @Column()
  first_name: string;

  @Field()
  @Column()
  last_name: string;

  @Field({ nullable: true })
  @Column({ nullable: true, default: null })
  phone?: string;

  @Field({ nullable: true })
  @Column({ nullable: true, default: null })
  address?: string;

  @Field()
  @Column({ default: 'user' })
  role: string;

  @Field(() => Boolean, { nullable: true })
  @Column({ default: false })
  is_banned: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true, default: null })
  note?: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
