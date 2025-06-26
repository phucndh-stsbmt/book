# 🛠️ Categories Module - Redis & Authorization Integration

## 📋 Tổng quan
Module Categories đã được tích hợp với:
- ✅ **Redis Caching** để tăng hiệu suất
- ✅ **Role-based Authorization** để phân quyền truy cập
- ✅ **JWT Authentication** để xác thực người dùng

## 🔐 Phân quyền (Authorization)

### 👤 Role USER (user)
- ✅ **Xem danh sách categories** (`findAll`)
- ✅ **Xem chi tiết category** (`findOne`)
- ❌ **Không được tạo/sửa/xóa** categories

### 👨‍💼 Role ADMIN (admin)  
- ✅ **Tất cả quyền của USER**
- ✅ **Tạo category mới** (`createCategory`)
- ✅ **Cập nhật category** (`updateCategory`)
- ✅ **Xóa category** (`removeCategory`)

## 💾 Redis Caching Strategy

### Cache Keys Structure
```
categories:list          # Danh sách tất cả categories
categories:{id}          # Chi tiết category theo ID
```

### Cache TTL
- **30 phút** (1800 seconds) cho tất cả cache

### Cache Operations

#### 📖 READ Operations
1. **findAll()**: Cache toàn bộ danh sách categories
2. **findOne(id)**: Cache chi tiết category theo ID

#### ✏️ WRITE Operations  
1. **create()**: Cache category mới + xóa list cache
2. **update()**: Cập nhật cache category + xóa list cache
3. **remove()**: Xóa cache category + xóa list cache

## 🚀 API Endpoints & Permissions

### GraphQL Queries (Authenticated Users)

```graphql
# ✅ Tất cả user đã đăng nhập
query GetCategories {
  categories {
    id
    name
    slug
    description
    isActive
    createdAt
    updatedAt
  }
}

# ✅ Tất cả user đã đăng nhập
query GetCategory($id: Int!) {
  category(id: $id) {
    id
    name
    slug
    description
    isActive
    createdAt
    updatedAt
  }
}
```

### GraphQL Mutations (ADMIN Only)

```graphql
# 🔒 Chỉ ADMIN
mutation CreateCategory($input: CreateCategoryInput!) {
  createCategory(createCategoryInput: $input) {
    id
    name
    slug
    description
    isActive
  }
}

# 🔒 Chỉ ADMIN  
mutation UpdateCategory($input: UpdateCategoryInput!) {
  updateCategory(updateCategoryInput: $input) {
    id
    name
    slug
    description
    isActive
  }
}

# 🔒 Chỉ ADMIN
mutation RemoveCategory($id: Int!) {
  removeCategory(id: $id) {
    id
    name
  }
}
```

## 🔧 Technical Implementation

### Guards Used
1. **GqlAuthGuard**: Xác thực JWT token
2. **RolesGuard**: Kiểm tra quyền role

### Dependencies Added
- `AuthModule` được import để sử dụng `RedisService`
- `RedisService` được inject vào `CategoriesService`

### Error Handling
- Sử dụng `NotFoundException` thay vì `Error` generic
- Logging với `Logger` cho debugging
- Graceful fallback khi Redis bị lỗi

## 📊 Performance Benefits

### Before (No Cache)
- Mỗi request = 1 database query
- Response time: ~50-100ms

### After (With Redis Cache)
- Cache hit: ~1-5ms response time
- Cache miss: ~50-100ms (+ cache update)
- Giảm tải database đáng kể

## 🧪 Testing

### Test với USER role:
```bash
# Đăng nhập với user thường
# Thử gọi Query → ✅ Success
# Thử gọi Mutation → ❌ Forbidden
```

### Test với ADMIN role:
```bash
# Đăng nhập với admin
# Thử gọi Query → ✅ Success  
# Thử gọi Mutation → ✅ Success
```

## 🔄 Cache Invalidation Strategy

### Automatic Cache Clearing
- **Create**: Xóa list cache (vì có item mới)
- **Update**: Xóa cả individual + list cache
- **Delete**: Xóa cả individual + list cache

### Manual Cache Clear (nếu cần)
```bash
# Clear tất cả categories cache
redis-cli DEL categories:list
redis-cli DEL categories:*
```

## 📝 Usage Examples

### Frontend Integration
```typescript
// Query categories (cả USER và ADMIN)
const { data } = await apollo.query({
  query: GET_CATEGORIES
});

// Create category (chỉ ADMIN)
const { data } = await apollo.mutate({
  mutation: CREATE_CATEGORY,
  variables: { input: { name: "...", slug: "..." } }
});
```

### Headers Required
```http
Authorization: Bearer <jwt_token>
```

## ⚠️ Important Notes

1. **Authentication Required**: Tất cả endpoints đều cần JWT token
2. **Role-based Access**: CRUD operations chỉ dành cho ADMIN
3. **Cache Strategy**: Write operations sẽ invalidate cache
4. **Error Handling**: Redis errors không làm crash app
5. **Logging**: Tất cả operations đều được log

## 🔮 Next Steps (Optional Enhancements)

- [ ] Implement cache warming strategy
- [ ] Add cache metrics/monitoring  
- [ ] Implement pagination for large datasets
- [ ] Add search functionality with caching
- [ ] Rate limiting per role 