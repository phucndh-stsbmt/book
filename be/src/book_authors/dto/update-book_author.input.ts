import { IsNumber, IsOptional } from 'class-validator';
import { CreateBookAuthorInput } from './create-book_author.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateBookAuthorInput extends PartialType(CreateBookAuthorInput) {
  @Field(() => Int)
  @IsNumber()
  id: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  bookId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  authorId?: number;
}
