import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';

export const redisModule = CacheModule.registerAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    store: redisStore,
    host: configService.get('REDIS_HOST'),
    port: configService.get('REDIS_PORT'),
    password: configService.get('REDIS_PASSWORD'),
    db: configService.get('REDIS_DB'),
    ttl: 600, // 600 seconds = 10 minutes
  }),
  inject: [ConfigService],
  isGlobal: true,
});
