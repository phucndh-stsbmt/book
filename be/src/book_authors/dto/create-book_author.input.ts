import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateBookAuthorInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
