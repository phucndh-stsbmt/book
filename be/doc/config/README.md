# Backend Configuration Documentation

Tài liệu hướng dẫn cấu hình Backend sử dụng NestJS

## Tổng quan
Dự án backend này sử dụng NestJS framework với các công nghệ sau:
- **Database**: MySQL (TypeORM)
- **Cache**: Redis
- **API**: GraphQL
- **Authentication**: JWT (optional)

## Cấu trúc thư mục doc/
- `mysql-config.md` - Hướng dẫn cấu hình MySQL và TypeORM
- `redis-config.md` - Hướng dẫn cấu hình Redis cache
- `graphql-config.md` - Hướng dẫn cấu hình GraphQL
- `environment-setup.md` - Cấu hình environment variables

## Thứ tự cài đặt khuyến nghị
1. Cài đặt dependencies
2. Cấu hình MySQL và TypeORM
3. Cấu hình Redis
4. Cấu hình GraphQL
5. Cấu hình environment variables

## Cài đặt Dependencies

```bash
# Database - MySQL & TypeORM
npm install @nestjs/typeorm typeorm mysql2

# Cache - Redis
npm install @nestjs/cache-manager cache-manager
npm install @nestjs/redis redis

# GraphQL
npm install @nestjs/graphql @nestjs/apollo @apollo/server graphql

# Configuration
npm install @nestjs/config

# Validation
npm install class-validator class-transformer

# Development dependencies
npm install --save-dev @types/cache-manager
```

## Khởi chạy dự án
```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
``` 