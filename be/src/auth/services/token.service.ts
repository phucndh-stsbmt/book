/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// src/auth/services/token.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { RedisService } from './redis.service';
import { AuthUser, JwtPayload } from '../interfaces/jwt-payload.interface';
import { User } from '../../users/entities/user.entity';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  tokenId: string;
}

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    private jwtService: JwtService,
    private redisService: RedisService,
  ) {}

  async generateTokenPair(user: User): Promise<TokenPair> {
    const tokenId = uuidv4();
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      jti: tokenId,
    };

    // Tạo access token (15 phút)
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
      secret: process.env.JWT_SECRET,
    });

    // Tạo refresh token (7 ngày)
    const refreshToken = this.jwtService.sign(
      { sub: user.id, jti: tokenId },
      {
        expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
        secret: process.env.JWT_SECRET,
      },
    );

    // Lưu thông tin user vào whitelist
    const userInfo = {
      id: user.id,
      email: user.email,
      role: user.role,
      userId: user.id,
      tokenId,
    };

    // Thêm vào whitelist (15 phút)
    await this.redisService.addToWhitelist(user.id, tokenId, userInfo, 15 * 60);

    // Lưu refresh token (7 ngày)
    await this.redisService.setRefreshToken(
      user.id,
      tokenId,
      refreshToken,
      7 * 24 * 60 * 60,
    );

    // Lưu session user (7 ngày)
    await this.redisService.setUserSession(
      user.id,
      {
        lastLogin: new Date(),
        activeTokens: await this.redisService.getUserActiveTokens(user.id),
      },
      7 * 24 * 60 * 60,
    );

    this.logger.log(`Generated token pair for user ${user.id}`);

    return {
      accessToken,
      refreshToken,
      tokenId,
    };
  }

  async validateAccessToken(token: string): Promise<JwtPayload | null> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      // Kiểm tra blacklist
      if (await this.redisService.isInBlacklist(payload.jti as string)) {
        this.logger.warn(`Token ${payload.jti} is blacklisted`);
        return null;
      }

      // Kiểm tra whitelist và lấy thông tin user
      const userInfo = await this.redisService.getFromWhitelist(
        payload.sub,
        payload.jti as string,
      );
      if (!userInfo) {
        this.logger.warn(`Token ${payload.jti} not in whitelist`);
        return null;
      }

      return payload as JwtPayload;
    } catch (error) {
      this.logger.error('Token validation failed:', error);
      return null;
    }
  }

  async refreshTokens(refreshToken: string): Promise<TokenPair | null> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_SECRET,
      }) as { sub: number; jti: string };

      // Kiểm tra refresh token trong Redis
      const storedRefreshToken = await this.redisService.getRefreshToken(
        payload.sub,
        payload.jti,
      );

      if (storedRefreshToken !== refreshToken) {
        this.logger.warn(`Invalid refresh token for user ${payload.sub}`);
        return null;
      }

      // Lấy thông tin user từ whitelist
      const userInfo = await this.redisService.getFromWhitelist(
        payload.sub,
        payload.jti,
      );
      if (!userInfo) {
        this.logger.warn(`User info not found for token ${payload.jti}`);
        return null;
      }

      // Tạo user object từ thông tin đã lưu
      const user = {
        id: userInfo.userId,
        email: userInfo.email,
        role: userInfo.role,
      } as User;

      // Tạo token pair mới
      const newTokenPair = await this.generateTokenPair(user);

      // Revoke token cũ
      await this.revokeToken(payload.sub, payload.jti);

      this.logger.log(`Refreshed tokens for user ${payload.sub}`);

      return newTokenPair;
    } catch (error) {
      this.logger.error('Token refresh failed:', error);
      return null;
    }
  }

  async revokeToken(userId: number, tokenId: string): Promise<void> {
    // Thêm vào blacklist (7 ngày để đảm bảo token không được sử dụng lại)
    await this.redisService.addToBlacklist(tokenId, 7 * 24 * 60 * 60);
    // Xóa khỏi whitelist
    await this.redisService.removeFromWhitelist(userId, tokenId);
    // Xóa refresh token
    await this.redisService.removeRefreshToken(userId, tokenId);

    this.logger.log(`Revoked token ${tokenId} for user ${userId}`);
  }

  async revokeAllTokens(userId: number): Promise<void> {
    // Lấy tất cả active tokens
    const activeTokens = await this.redisService.getUserActiveTokens(userId);
    // Blacklist tất cả tokens
    for (const tokenId of activeTokens) {
      await this.redisService.addToBlacklist(tokenId, 7 * 24 * 60 * 60);
    }

    // Xóa tất cả tokens khỏi whitelist
    await this.redisService.removeAllUserTokens(userId);
    // Xóa session user
    await this.redisService.removeUserSession(userId);

    this.logger.log(`Revoked all tokens for user ${userId}`);
  }

  async getUserFromToken(token: string): Promise<AuthUser | null> {
    const payload = await this.validateAccessToken(token);
    if (!payload) return null;

    return await this.redisService.getFromWhitelist(
      payload.sub,
      payload.jti as string,
    );
  }
}
