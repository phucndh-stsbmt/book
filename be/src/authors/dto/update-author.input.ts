import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsDate,
  IsString,
  IsOptional,
  IsNotEmpty,
  IsInt,
} from 'class-validator';

@InputType()
export class UpdateAuthorInput {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  id: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  biography?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  nationality?: string;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate()
  dateOfBirth?: Date;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate()
  dateOfDeath?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}
