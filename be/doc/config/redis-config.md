# Redis Configuration

## 1. Cài đặt Dependencies

```bash
npm install @nestjs/cache-manager cache-manager
npm install @nestjs/redis redis
npm install --save-dev @types/cache-manager
```

## 2. Cập nhật file .env

Thêm vào file `.env`:

```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

## 3. Cấu hình Redis Module

Cập nhật `src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-store';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST'),
        port: configService.get('REDIS_PORT'),
        password: configService.get('REDIS_PASSWORD'),
        db: configService.get('REDIS_DB'),
        ttl: 600, // seconds
      }),
      inject: [ConfigService],
      isGlobal: true,
    }),
    // ... other imports
  ],
  // ...
})
export class AppModule {}
```

## 4. Sử dụng Redis Cache trong Service

Tạo file `src/cache/cache.service.ts`:

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | undefined> {
    return await this.cacheManager.get<T>(key);
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async reset(): Promise<void> {
    await this.cacheManager.reset();
  }

  async keys(pattern?: string): Promise<string[]> {
    return await this.cacheManager.store.keys(pattern);
  }
}
```

## 5. Sử dụng Cache trong Controller

Example trong `src/users/users.controller.ts`:

```typescript
import { Controller, Get, Param, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { UsersService } from './users.service';
import { CacheService } from '../cache/cache.service';

@Controller('users')
@UseInterceptors(CacheInterceptor)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly cacheService: CacheService,
  ) {}

  @Get()
  @CacheKey('all_users')
  @CacheTTL(300) // 5 minutes
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const cacheKey = `user_${id}`;
    
    // Kiểm tra cache trước
    let user = await this.cacheService.get(cacheKey);
    
    if (!user) {
      // Nếu không có trong cache, lấy từ database
      user = await this.usersService.findOne(+id);
      
      // Lưu vào cache
      await this.cacheService.set(cacheKey, user, 300);
    }
    
    return user;
  }
}
```

## 6. Cache Decorator (Advanced)

Tạo custom decorator `src/decorators/cache.decorator.ts`:

```typescript
import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';

export function ApiCache(key: string, ttl: number = 300) {
  return applyDecorators(
    CacheKey(key),
    CacheTTL(ttl),
    UseInterceptors(CacheInterceptor),
  );
}
```

Sử dụng decorator:

```typescript
@Get()
@ApiCache('all_users', 600)
async findAll() {
  return this.usersService.findAll();
}
```

## 7. Testing Redis Connection

Tạo file `src/health/redis.health.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(private readonly cacheService: CacheService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.cacheService.set('health_check', 'ok', 10);
      const result = await this.cacheService.get('health_check');
      
      if (result === 'ok') {
        return this.getStatus(key, true);
      }
      
      throw new Error('Redis not responding correctly');
    } catch (error) {
      throw new HealthCheckError('Redis check failed', this.getStatus(key, false));
    }
  }
}
```

## 8. Cấu hình cho Production

Trong production, cập nhật Redis config:

```typescript
// app.module.ts
CacheModule.registerAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    store: redisStore,
    host: configService.get('REDIS_HOST'),
    port: configService.get('REDIS_PORT'),
    password: configService.get('REDIS_PASSWORD'),
    db: configService.get('REDIS_DB'),
    ttl: 600,
    max: 1000, // Maximum number of items in cache
    retryDelayOnFailover: 100,
    enableReadyCheck: true,
    maxRetriesPerRequest: 3,
  }),
  inject: [ConfigService],
  isGlobal: true,
}),
``` 