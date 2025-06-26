import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';

@Injectable()
export class RoleCacheService {
  private readonly DEFAULT_TTL = 1800; // 30 phút

  constructor(private readonly redisService: RedisService) {}

  // Cache role của user
  async cacheUserRole(userId: number, role: string): Promise<void> {
    await this.redisService.cacheUserRole(userId, role, this.DEFAULT_TTL);
  }

  // Lấy role của user từ cache
  async getUserRole(userId: number): Promise<string | null> {
    return await this.redisService.getUserRole(userId);
  }

  // Cache thông tin user đầy đủ
  async cacheUserInfo(userId: number, userInfo: any): Promise<void> {
    await this.redisService.cacheUserInfo(userId, userInfo, this.DEFAULT_TTL);
  }

  // Lấy thông tin user từ cache
  async getUserInfo(userId: number): Promise<any | null> {
    return await this.redisService.getUserInfo(userId);
  }

  // Kiểm tra user có phải admin không
  async isAdmin(userId: number): Promise<boolean> {
    const role = await this.redisService.getUserRole(userId);
    return role === 'admin';
  }
}
