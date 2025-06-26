/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
// src/auth/services/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../users/entities/user.entity';
import { TokenService } from './token.service';
import { RedisService } from './redis.service';
import { RoleCacheService } from './role-cache.service';
import { LoginInput } from '../dto/login.input';
import { RegisterInput } from '../dto/register.input';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly tokenService: TokenService,
    private readonly redisService: RedisService,
    private readonly roleCacheService: RoleCacheService,
  ) {}

  async register(registerInput: RegisterInput) {
    const { email, password, first_name, last_name } = registerInput;

    // Kiểm tra user đã tồn tại
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Set default role for registration
    const userRole = 'user';

    try {
      // Hash password
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Tạo user mới
      const user = this.userRepository.create({
        email,
        password: hashedPassword,
        first_name,
        last_name,
        role: userRole,
      });

      const savedUser = await this.userRepository.save(user);
      // Xóa password khỏi response
      const { password: _, ...userWithoutPassword } = savedUser;

      this.logger.log(`User registered successfully: ${savedUser.email}`);

      return userWithoutPassword;
      
    } catch (error) {
      this.logger.error('Registration failed:', error);
      throw new BadRequestException('Registration failed');
    }
  }

  async login(loginInput: LoginInput) {
    const { email, password } = loginInput;

    try {
      // Tìm user (bao gồm password để verify)
      const user = await this.userRepository.findOne({ 
        where: { email },
        select: ['id', 'email', 'password', 'first_name', 'last_name', 'phone', 'address', 'role', 'createdAt', 'updatedAt']
      });

      if (!user) {
        throw new UnauthorizedException('Invalid email or password');
      }

      // Kiểm tra password
      const isPasswordValid = await bcrypt.compare(password, user.password || '');
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid email or password');
      }
      // Xóa password khỏi user object
      const { password: _, ...userWithoutPassword } = user;

      // Tạo tokens
      const tokens = await this.tokenService.generateTokenPair(userWithoutPassword as User);

      this.logger.log(`User logged in successfully: ${user.email}`);

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error('Login failed:', error);
      throw new BadRequestException('Login failed');
    }
  }

  async refreshTokens(refreshToken: string) {
    const tokens = await this.tokenService.refreshTokens(refreshToken);
    
    if (!tokens) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async logout(userId: number, tokenId: string) {
    try {
      // Kiểm tra token đã bị revoked chưa (check cả access và refresh token)
      const isAccessTokenRevoked = await this.redisService.isInBlacklist(tokenId);
      const isRefreshTokenRevoked = await this.redisService.isInBlacklist(tokenId);
      
      if (isAccessTokenRevoked || isRefreshTokenRevoked) {
        this.logger.warn(`Token pair ${tokenId} is already revoked`);
        return { 
          message: 'Token Revoked',
        };
      }

      // Revoke cả cặp tokens (access + refresh)
      await this.tokenService.revokeToken(userId, tokenId);
      
      this.logger.log(`User ${userId} logged out successfully - revoked token pair ${tokenId}`);
      
      return { 
        message: 'Logged out successfully',
      };
    } catch (error) {
      this.logger.error('Logout failed:', error);
      throw new BadRequestException('Logout failed');
    }
  }

  async logoutAll(userId: number) {
    try {
      await this.tokenService.revokeAllTokens(userId);
      
      this.logger.log(`User ${userId} logged out from all devices`);
      
      return { 
        message: 'Logged out from all devices successfully',
      };
    } catch (error) {
      this.logger.error('Logout all failed:', error);
      throw new BadRequestException('Logout all failed');
    }
  }

  async getCurrentUser(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({ 
      where: { id: userId },
      select: ['id', 'email', 'first_name', 'last_name', 'phone', 'address', 'role', 'createdAt', 'updatedAt']
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async updateProfile(userId: number, updateData: Partial<User>): Promise<User> {
    // Không cho phép update password, email, role qua endpoint này
    const { password, email, role, ...allowedUpdates } = updateData;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    Object.assign(user, allowedUpdates);
    const updatedUser = await this.userRepository.save(user);

    // Xóa password khỏi response
    const { password: _, ...userWithoutPassword } = updatedUser;

    this.logger.log(`User ${userId} updated profile`);

    return userWithoutPassword as User;
  }

  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'password'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password || '',
    );
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await this.userRepository.update(userId, { password: hashedNewPassword });

    // Logout from all devices for security
    await this.tokenService.revokeAllTokens(userId);

    this.logger.log(`User ${userId} changed password`);

    return {
      message: 'Password changed successfully. Please login again.',
      success: true,
    };
  }
}
