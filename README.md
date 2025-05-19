# Facebook Clone

Ứng dụng mạng xã hội đầy đủ tính năng được xây dựng bằng React và Spring Boot.

## Tổng quan

Dự án này là một bản sao của Facebook được phát triển như một phần của khóa học "Phát Triển Phần Mềm Theo Mô Hình Phân Lớp". Ứng dụng bao gồm các tính năng như:

- Xác thực người dùng (đăng nhập, đăng ký, đặt lại mật khẩu)
- Bảng tin với bài đăng, lượt thích và bình luận
- Hồ sơ người dùng
- Hệ thống bạn bè
- Trò chuyện thời gian thực sử dụng WebSockets
- Chia sẻ phương tiện (hình ảnh và video)
- Bảng điều khiển quản trị viên

## Công nghệ sử dụng

### Frontend
- React 19
- React Router
- Bootstrap 5
- Axios cho các yêu cầu API
- STOMP/WebSockets cho tính năng thời gian thực

### Backend
- Spring Boot 3.1
- MongoDB cho cơ sở dữ liệu
- JWT cho xác thực
- WebSocket cho giao tiếp thời gian thực
- Spring Mail cho thông báo email

## Yêu cầu hệ thống

- Node.js (v16+)
- npm (v8+)
- Java 17+
- Maven
- MongoDB (chạy cục bộ hoặc có thể truy cập)

## Cài đặt

### Sao chép kho lưu trữ
```bash
git clone https://github.com/yourusername/facebook_clone.git
cd facebook_clone
```

### Thiết lập Backend
1. Di chuyển đến thư mục backend:
```bash
cd backend
```

2. Cài đặt các phụ thuộc và chạy ứng dụng:
```bash
mvn spring-boot:run
```
Máy chủ backend sẽ khởi động tại http://localhost:8080

### Thiết lập Frontend
1. Di chuyển đến thư mục frontend:
```bash
cd frontend
```

2. Cài đặt các phụ thuộc:
```bash
npm install
npm install @stomp/stompjs sockjs-client
```

3. Khởi động máy chủ phát triển:
```bash
npm start
```
Ứng dụng frontend sẽ có sẵn tại http://localhost:3000

## Cấu hình

### Cấu hình Backend
Tệp cấu hình chính nằm tại `backend/src/main/resources/application.properties`. Các cài đặt quan trọng bao gồm:

- Kết nối MongoDB: `spring.data.mongodb.uri=mongodb://localhost:27017/facebook_clone`
- Cài đặt JWT: Cấu hình `jwt.secret` và `jwt.expiration`
- Cài đặt Email: Cập nhật cấu hình email cho chức năng đặt lại mật khẩu
- Tạo 1 file secrets.properties và chèn nội dung sau:
```
gemini.api.key=your_gemini_api_key
spring.mail.password=your_apppassword
```

### Cấu hình Frontend
Frontend kết nối với API backend bằng cách sử dụng cài đặt proxy trong `package.json`. Mặc định, nó trỏ đến http://localhost:8080.

## Sử dụng

1. Đăng ký tài khoản mới hoặc đăng nhập bằng thông tin đăng nhập hiện có
2. Tạo bài đăng với văn bản, hình ảnh hoặc video
3. Thích và bình luận bài đăng
4. Thêm bạn bè và trò chuyện thời gian thực
5. Cập nhật thông tin hồ sơ và ảnh đại diện
6. Tìm kiếm người dùng và bài đăng

## Truy cập Quản trị viên

Để truy cập bảng điều khiển quản trị viên:
1. Điều hướng đến `/admin/login`
2. Đăng nhập bằng thông tin đăng nhập quản trị viên
3. Quản lý người dùng, bài đăng và các cài đặt hệ thống khác


