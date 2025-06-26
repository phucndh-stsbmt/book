import { Resolver, Mutation, Args, Context, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import {
  LoginInput,
  RegisterInput,
  RegisterResponse,
  RefreshResponse,
  LoginResponse,
  LogoutResponse,
} from '../dto';
import { User } from '../../users/entities/user.entity';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => RegisterResponse)
  @Public()
  async register(
    @Args('input') registerInput: RegisterInput,
  ): Promise<RegisterResponse> {
    const user = await this.authService.register(registerInput);
    return {
      user: user as User,
    };
  }

  @Mutation(() => LoginResponse)
  @Public()
  async login(@Args('input') loginInput: LoginInput) {
    return this.authService.login(loginInput);
  }

  @Mutation(() => RefreshResponse)
  @Public()
  async refreshTokens(@Args('refreshToken') refreshToken: string) {
    return this.authService.refreshTokens(refreshToken);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => LogoutResponse)
  async logout(@Context() context): Promise<LogoutResponse> {
    const user = context.req.user;
    return this.authService.logout(user.userId, user.tokenId);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => LogoutResponse)
  async logoutAll(@Context() context): Promise<LogoutResponse> {
    const user = context.req.user;
    return this.authService.logoutAll(user.userId);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => User)
  async me(@Context() context): Promise<User> {
    return context.req.user;
  }
}
