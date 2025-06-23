/* eslint-disable @typescript-eslint/no-unsafe-call */
import { InputType, Field } from '@nestjs/graphql';
import { IsBoolean, IsNotEmpty, IsString, IsOptional } from 'class-validator';

@InputType()
export class CreateCategoryInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  slug: string;

  @Field()
  @IsOptional()
  @IsString()
  description?: string;

  @Field()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
