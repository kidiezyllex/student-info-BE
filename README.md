# Express Backend API

Backend API được xây dựng bằng Express và TypeScript, tuân theo các tiêu chuẩn RESTful.

## Cấu trúc dự án

```
src/
├── config/        # Cấu hình ứng dụng (database, auth, etc.)
├── controllers/   # Xử lý logic và gọi services
├── middlewares/   # Middlewares (auth, validation, error handling)
├── models/        # Định nghĩa Schema models Mongoose
├── routes/        # Định nghĩa API routes
├── services/      # Xử lý logic nghiệp vụ
├── utils/         # Các hàm tiện ích
├── index.ts       # Điểm khởi đầu ứng dụng
└── routes.ts      # Đăng ký routes
```

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