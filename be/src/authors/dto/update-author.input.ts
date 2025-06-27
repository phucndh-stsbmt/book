import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { IsBoolean, IsDate, IsOptional, IsString } from 'class-validator';

@InputType()
export class UpdateAuthorInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  biography?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @Field(() => String, { nullable: true })
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

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
