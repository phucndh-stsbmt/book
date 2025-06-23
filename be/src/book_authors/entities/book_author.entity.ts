import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class BookAuthor {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
