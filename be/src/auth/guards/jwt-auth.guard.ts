/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Resolver, Mutation, Args, Context, Query } from '@nestjs/graphql';
import { UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import {
  LoginInput,
  RegisterInput,
  RefreshResponse,
  LogoutResponse,
  RegisterResponse,
  LoginResponse,
} from '../dto';
import { User } from '../../users/entities/user.entity';
import { AuthUser } from '../interfaces/jwt-payload.interface';

@Resolver(() => User)
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => RegisterResponse)
  async register(
    @Args('input', new ValidationPipe()) registerInput: RegisterInput,
  ): Promise<RegisterResponse> {
    const result = await this.authService.register(registerInput);
    if (!result) {
      throw new Error('Registration failed');
    }
    return { user: result };
  }

  @Mutation(() => LoginResponse)
  async login(
    @Args('input', new ValidationPipe()) loginInput: LoginInput,
  ): Promise<LoginResponse> {
    return this.authService.login(loginInput);
  }

  @Mutation(() => RefreshResponse)
  async refreshTokens(
    @Args('refreshToken') refreshToken: string,
  ): Promise<RefreshResponse> {
    return this.authService.refreshTokens(refreshToken);
  }

  @Mutation(() => LogoutResponse)
  @UseGuards(GqlAuthGuard)
  async logout(@Context() context): Promise<LogoutResponse> {
    const user: AuthUser = context.req.user;
    return this.authService.logout(user.userId, user.tokenId);
  }

  @Mutation(() => LogoutResponse)
  @UseGuards(GqlAuthGuard)
  async logoutAll(@Context() context): Promise<LogoutResponse> {
    const user: AuthUser = context.req.user;
    return this.authService.logoutAll(user.userId);
  }

  @Query(() => User)
  @UseGuards(GqlAuthGuard)
  async me(@Context() context): Promise<User> {
    const user: AuthUser = context.req.user;
    return this.authService.getCurrentUser(user.userId);
  }

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  async updateProfile(
    @Context() context,
    @Args('name', { nullable: true }) name?: string,
    @Args('first_name', { nullable: true }) first_name?: string,
    @Args('last_name', { nullable: true }) last_name?: string,
    @Args('phone', { nullable: true }) phone?: string,
    @Args('address', { nullable: true }) address?: string,
  ): Promise<User> {
    const user: AuthUser = context.req.user;
    const updateData = { name, first_name, last_name, phone, address };
    // Remove undefined values
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key],
    );

    return this.authService.updateProfile(user.userId, updateData);
  }

  @Mutation(() => LogoutResponse)
  @UseGuards(GqlAuthGuard)
  async changePassword(
    @Context() context,
    @Args('currentPassword') currentPassword: string,
    @Args('newPassword') newPassword: string,
  ): Promise<LogoutResponse> {
    const user: AuthUser = context.req.user;
    return this.authService.changePassword(
      user.userId,
      currentPassword,
      newPassword,
    );
  }
}
