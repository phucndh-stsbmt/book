import { InputType, PickType } from '@nestjs/graphql';
import { CreateUserInput } from 'src/users/dto/create-user.input';

@InputType()
export class RegisterInput extends PickType(CreateUserInput, [
  'email',
  'password',
  'first_name',
  'last_name',
] as const) {}
