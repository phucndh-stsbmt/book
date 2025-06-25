import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsBoolean,
  IsDate,
  IsOptional,
} from 'class-validator';

@InputType()
export class CreateBookInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  isbn: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  title: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  description: string;

  @Field(() => Number)
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @Field(() => Number)
  @IsNotEmpty()
  @IsNumber()
  stockQuantity: number;

  @Field(() => Number)
  @IsNotEmpty()
  @IsNumber()
  page: number;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  language: string;

  @Field(() => Date)
  @IsNotEmpty()
  @IsDate()
  publicationDate: Date;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  @Field(() => Boolean)
  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;

  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  categoryId: number;

  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  publisherId: number;
}
