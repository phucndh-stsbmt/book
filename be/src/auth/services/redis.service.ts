// src/auth/services/redis.service.ts
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { AuthUser } from '../interfaces/jwt-payload.interface';

@Injectable()
export class RedisService implements OnModuleInit {
  private client!: Redis;
  private readonly logger = new Logger(RedisService.name);

  onModuleInit() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      maxRetriesPerRequest: 3,
      retryStrategy: (times: number) => {
        return Math.min(times * 50, 1000);
      },
    });

    this.client.on('connect', () => {
      this.logger.log('Redis connected successfully');
    });

    this.client.on('error', (error) => {
      this.logger.error('Redis connection error:', error);
    });
  }

  // Whitelist token - lưu thông tin user cùng token
  async addToWhitelist(
    userId: number,
    tokenId: string,
    userInfo: AuthUser,
    ttl: number,
  ): Promise<void> {
    const key = `whitelist:${userId}:${tokenId}`;
    await this.client.setex(key, ttl, JSON.stringify(userInfo));
  }

  // Kiểm tra và lấy thông tin từ whitelist
  async getFromWhitelist(
    userId: number,
    tokenId: string,
  ): Promise<AuthUser | null> {
    const key = `whitelist:${userId}:${tokenId}`;
    const result = await this.client.get(key);
    return result ? (JSON.parse(result) as AuthUser) : null;
  }

  // Blacklist token
  async addToBlacklist(tokenId: string, ttl: number): Promise<void> {
    const key = `blacklist:${tokenId}`;
    await this.client.setex(key, ttl, '1');
  }

  // Kiểm tra token trong blacklist
  async isInBlacklist(tokenId: string): Promise<boolean> {
    const key = `blacklist:${tokenId}`;
    const result = await this.client.get(key);
    return result === '1';
  }

  // Xóa token khỏi whitelist
  async removeFromWhitelist(userId: number, tokenId: string): Promise<void> {
    const key = `whitelist:${userId}:${tokenId}`;
    await this.client.del(key);
  }

  // Xóa tất cả token của user (logout all devices)
  async removeAllUserTokens(userId: number): Promise<void> {
    const pattern = `whitelist:${userId}:*`;
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  // Lưu refresh token
  async setRefreshToken(
    userId: number,
    tokenId: string,
    refreshToken: string,
    ttl: number,
  ): Promise<void> {
    const key = `refresh:${userId}:${tokenId}`;
    await this.client.setex(key, ttl, refreshToken);
  }

  // Lấy refresh token
  async getRefreshToken(
    userId: number,
    tokenId: string,
  ): Promise<string | null> {
    const key = `refresh:${userId}:${tokenId}`;
    return await this.client.get(key);
  }

  // Xóa refresh token
  async removeRefreshToken(userId: number, tokenId: string): Promise<void> {
    const key = `refresh:${userId}:${tokenId}`;
    await this.client.del(key);
  }

  // Lưu thông tin session user
  async setUserSession(
    userId: number,
    sessionData: any,
    ttl: number,
  ): Promise<void> {
    const key = `session:${userId}`;
    await this.client.setex(key, ttl, JSON.stringify(sessionData));
  }

  // Lấy thông tin session user
  async getUserSession(userId: number): Promise<AuthUser | null> {
    const key = `session:${userId}`;
    const result = await this.client.get(key);
    return result ? (JSON.parse(result) as AuthUser) : null;
  }

  // Xóa session user
  async removeUserSession(userId: number): Promise<void> {
    const key = `session:${userId}`;
    await this.client.del(key);
  }

  // Lấy tất cả active tokens của user
  async getUserActiveTokens(userId: number): Promise<string[]> {
    const pattern = `whitelist:${userId}:*`;
    const keys = await this.client.keys(pattern);
    return keys.map((key) => key.split(':')[2]);
  }

  // Lưu thông tin role của user
  async cacheUserRole(userId: number, role: string, ttl: number = 1800): Promise<void> {
    const key = `user:${userId}:role`;
    await this.client.setex(key, ttl, role);
  }

  // Lấy role của user từ cache
  async getUserRole(userId: number): Promise<string | null> {
    const key = `user:${userId}:role`;
    return await this.client.get(key);
  }

   // Cache thông tin user đầy đủ (bao gồm role)
   async cacheUserInfo(userId: number, userInfo: any, ttl: number = 1800): Promise<void> {
    const key = `user:${userId}:info`;
    await this.client.setex(key, ttl, JSON.stringify(userInfo));
    
    // Cache role riêng để query nhanh
    if (userInfo.role) {
      await this.cacheUserRole(userId, userInfo.role, ttl);
    }
  }

  // Lấy thông tin user từ cache
  async getUserInfo(userId: number): Promise<any | null> {
    const key = `user:${userId}:info`;
    const result = await this.client.get(key);
    return result ? JSON.parse(result) : null;
  }

  // Kiểm tra user có phải admin không (từ cache)
  async isUserAdmin(userId: number): Promise<boolean> {
    const role = await this.getUserRole(userId);
    return role === 'admin';
  }

  // Blacklist refresh token riêng (sử dụng prefix khác)
  async blacklistRefreshToken(tokenId: string, ttl: number): Promise<void> {
    const key = `refresh_blacklist:${tokenId}`;
    await this.client.setex(key, ttl, '1');
  }

  // Kiểm tra refresh token có bị blacklist không
  async isRefreshTokenBlacklisted(tokenId: string): Promise<boolean> {
    const key = `refresh_blacklist:${tokenId}`;
    const result = await this.client.get(key);
    return result === '1';
  }
}
