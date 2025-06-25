import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateBookAuthorInput {
  @Field(() => Int)
  bookId: number;

  @Field(() => Int)
  authorId: number;
}
