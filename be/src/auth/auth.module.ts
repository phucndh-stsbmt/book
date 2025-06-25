/* eslint-disable @typescript-eslint/require-await */
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Services
import { AuthService } from './services/auth.service';
import { TokenService } from './services/token.service';
import { RedisService } from './services/redis.service';

// Resolvers
import { AuthResolver } from './resolvers/auth.resolver';

// Strategies
import { JwtStrategy } from './strategies/jwt.strategy';

// Entity - Đảm bảo đường dẫn chính xác
import { User } from '../users/entities/user.entity'; // Hoặc đường dẫn chính xác đến User entity

@Module({
  imports: [
    // Import ConfigModule để sử dụng environment variables
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_ACCESS_EXPIRES'),
        },
      }),
      inject: [ConfigService],
    }),

    // Import TypeOrmModule với User entity
    TypeOrmModule.forFeature([User]),
  ],
  providers: [
    AuthService,
    TokenService,
    RedisService,
    AuthResolver,
    JwtStrategy,
  ],
  exports: [
    AuthService,
    TokenService,
    RedisService,
    JwtStrategy,
    PassportModule,
  ],
})
export class AuthModule {}
