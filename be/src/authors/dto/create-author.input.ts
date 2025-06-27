import { InputType, Field } from '@nestjs/graphql';
import { IsBoolean, IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateAuthorInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  biography: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  imageUrl: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  nationality: string;

  @Field(() => Date)
  @IsNotEmpty()
  @IsDate()
  dateOfBirth: Date;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate()
  dateOfDeath: Date;

  @Field(() => Boolean, { defaultValue: true })
  @IsOptional()
  @IsBoolean()
  isActive: boolean;
}
