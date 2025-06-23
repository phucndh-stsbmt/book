/* eslint-disable @typescript-eslint/no-unsafe-call */
import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
} from 'class-validator';

@InputType()
export class CreateBookInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  title: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  author: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field()
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @Field()
  @IsNotEmpty()
  @IsString()
  isbn: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  categoryId: number;
}
