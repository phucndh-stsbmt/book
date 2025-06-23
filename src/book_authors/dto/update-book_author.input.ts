import { CreateBookAuthorInput } from './create-book_author.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateBookAuthorInput extends PartialType(CreateBookAuthorInput) {
  @Field(() => Int)
  id: number;
}
