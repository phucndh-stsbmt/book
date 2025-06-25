import { ObjectType, Field } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';

@ObjectType()
export class RegisterResponse {
  @Field(() => User)
  user: User;
}
