/* eslint-disable @typescript-eslint/no-unsafe-call */
import { CreatePublisherInput } from './create-publisher.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { IsNotEmpty, IsInt } from 'class-validator';

@InputType()
export class UpdatePublisherInput extends PartialType(CreatePublisherInput) {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  id: number;
}
