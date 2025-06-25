# GraphQL Configuration

## 1. Cài đặt Dependencies

```bash
npm install @nestjs/graphql @nestjs/apollo @apollo/server graphql
npm install class-validator class-transformer
```

## 2. Cấu hình GraphQL Module

Cập nhật `src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      introspection: true,
      context: ({ req }) => ({ req }),
    }),
    // ... other imports
  ],
  // ...
})
export class AppModule {}
```

## 3. Tạo GraphQL Types

Tạo file `src/users/dto/user.type.ts`:

```typescript
import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field(() => Int)
  id: number;

  @Field()
  email: string;

  @Field()
  name: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
```

## 4. Tạo Input Types

Tạo file `src/users/dto/create-user.input.ts`:

```typescript
import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

@InputType()
export class CreateUserInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsNotEmpty()
  name: string;

  @Field()
  @MinLength(6)
  password: string;
}
```

Tạo file `src/users/dto/update-user.input.ts`:

```typescript
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {
  @Field(() => Int)
  id: number;
}
```

## 5. Tạo GraphQL Resolver

Tạo file `src/users/users.resolver.ts`:

```typescript
import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './dto/user.type';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(() => User)
  async createUser(@Args('createUserInput') createUserInput: CreateUserInput): Promise<User> {
    return this.usersService.create(createUserInput);
  }

  @Query(() => [User], { name: 'users' })
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Query(() => User, { name: 'user' })
  async findOne(@Args('id', { type: () => Int }) id: number): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Mutation(() => User)
  async updateUser(@Args('updateUserInput') updateUserInput: UpdateUserInput): Promise<User> {
    return this.usersService.update(updateUserInput.id, updateUserInput);
  }

  @Mutation(() => Boolean)
  async removeUser(@Args('id', { type: () => Int }) id: number): Promise<boolean> {
    await this.usersService.remove(id);
    return true;
  }
}
```

## 6. Cập nhật Users Module

Tạo file `src/users/users.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { User } from '../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersResolver, UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

Và import vào `src/app.module.ts`:

```typescript
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    // ... other imports
    UsersModule,
  ],
  // ...
})
export class AppModule {}
```

## 7. Validation Pipe

Cập nhật `src/main.ts` để thêm validation:

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

## 8. Example Queries & Mutations

### Queries:

```graphql
# Lấy tất cả users
query GetUsers {
  users {
    id
    email
    name
    createdAt
  }
}

# Lấy user theo ID
query GetUser($id: Int!) {
  user(id: $id) {
    id
    email
    name
    createdAt
  }
}
```

### Mutations:

```graphql
# Tạo user mới
mutation CreateUser($createUserInput: CreateUserInput!) {
  createUser(createUserInput: $createUserInput) {
    id
    email
    name
    createdAt
  }
}

# Variables:
{
  "createUserInput": {
    "email": "user@example.com",
    "name": "John Doe",
    "password": "password123"
  }
}

# Cập nhật user
mutation UpdateUser($updateUserInput: UpdateUserInput!) {
  updateUser(updateUserInput: $updateUserInput) {
    id
    email
    name
    updatedAt
  }
}

# Variables:
{
  "updateUserInput": {
    "id": 1,
    "name": "Jane Doe"
  }
}

# Xóa user
mutation RemoveUser($id: Int!) {
  removeUser(id: $id)
}
```

## 9. GraphQL với Authentication (Optional)

Tạo Guard `src/auth/gql-auth.guard.ts`:

```typescript
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
}
```

Sử dụng trong resolver:

```typescript
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql-auth.guard';

@Resolver(() => User)
export class UsersResolver {
  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  async createUser(@Args('createUserInput') createUserInput: CreateUserInput): Promise<User> {
    return this.usersService.create(createUserInput);
  }
}
```

## 10. GraphQL Subscriptions (Advanced)

Cấu hình subscription trong `app.module.ts`:

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
  sortSchema: true,
  playground: true,
  introspection: true,
  subscriptions: {
    'graphql-ws': true,
    'subscriptions-transport-ws': true,
  },
  context: ({ req }) => ({ req }),
}),
```

Example subscription trong resolver:

```typescript
import { Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';

const pubSub = new PubSub();

@Resolver(() => User)
export class UsersResolver {
  @Subscription(() => User, {
    name: 'userAdded',
  })
  userAdded() {
    return pubSub.asyncIterator('userAdded');
  }

  @Mutation(() => User)
  async createUser(@Args('createUserInput') createUserInput: CreateUserInput): Promise<User> {
    const user = await this.usersService.create(createUserInput);
    pubSub.publish('userAdded', { userAdded: user });
    return user;
  }
}
``` 