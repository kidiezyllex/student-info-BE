# Express Backend API

Backend API được xây dựng bằng Express và TypeScript, tuân theo các tiêu chuẩn RESTful.

## Cấu trúc dự án chi tiết

```
src/
├── config/                    # Cấu hình ứng dụng
│   ├── database.ts           # Cấu hình kết nối MongoDB
│   ├── auth.ts              # Cấu hình JWT và xác thực
│   └── constants.ts         # Các hằng số của ứng dụng
│
├── controllers/              # Xử lý logic và gọi services
│   ├── auth.controller.ts   # Xử lý authentication
│   ├── user.controller.ts   # Xử lý user operations
│   └── base.controller.ts   # Controller base class
│
├── middlewares/             # Middlewares 
│   ├── auth.middleware.ts   # Xác thực JWT token
│   ├── error.middleware.ts  # Xử lý lỗi tập trung
│   ├── validate.ts         # Validation request
│   └── role.middleware.ts  # Phân quyền người dùng
│
├── models/                  # Mongoose models
│   ├── user.model.ts       # User schema và model
│   └── types/              # Type definitions
│       └── user.types.ts   # User related types
│
├── routes/                  # API routes
│   ├── auth.routes.ts      # Authentication routes  
│   ├── user.routes.ts      # User management routes
│   └── index.ts           # Route registry
│
├── services/               # Business logic
│   ├── auth.service.ts    # Authentication service
│   ├── user.service.ts    # User operations service
│   └── base.service.ts    # Service base class
│
├── utils/                  # Helper functions
│   ├── logger.ts          # Logging utility
│   ├── password.ts        # Password hashing
│   └── response.ts        # API response formatter
│
├── index.ts               # Application entry point
└── routes.ts             # Route registration
```


### Quan hệ giữa các bảng
- Hiện tại hệ thống đang sử dụng MongoDB với schema Users làm core chính
- Các collection khác sẽ được bổ sung theo yêu cầu nghiệp vụ và sẽ có quan hệ thông qua ObjectId reference
- Ví dụ về quan hệ có thể phát triển thêm:
  - Users - Posts (1-n): Một user có thể tạo nhiều bài post
  - Users - Comments (1-n): Một user có thể có nhiều comment
  - Posts - Comments (1-n): Một post có thể có nhiều comment

## Cài đặt

```bash
# Cài đặt dependencies
npm install

# Chạy ở chế độ development
npm run dev

# Build cho production
npm run build

# Chạy ở chế độ production
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Đăng ký người dùng mới
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/profile` - Lấy thông tin profile (yêu cầu xác thực)

### Users

- `GET /api/users` - Lấy danh sách người dùng (chỉ Admin)
- `GET /api/users/:id` - Lấy thông tin người dùng theo ID
- `PUT /api/users/:id` - Cập nhật thông tin người dùng
- `DELETE /api/users/:id` - Xóa người dùng (chỉ Admin)

## Authentication

API sử dụng JWT (JSON Web Tokens) cho xác thực. Để truy cập các endpoint được bảo vệ, cần thêm token vào header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Documentation

API documentation được tạo tự động với Swagger và có thể truy cập tại:

```
http://localhost:5000/api-docs
``` 