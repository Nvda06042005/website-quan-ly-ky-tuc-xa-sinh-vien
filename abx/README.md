# Hệ thống Quản lý Ký túc xá - Đại học Văn Lang# Hệ Thống Quản Lý Ký Túc Xá



## 📋 Mô tả## Mô tả dự án

Hệ thống quản lý ký túc xá toàn diện với 3 vai trò người dùng: Sinh viên, Nhân viên Quản lý, và Quản trị viên cấp cao.

Hệ thống quản lý ký túc xá toàn diện với giao diện người dùng tiếng Việt, hỗ trợ 3 vai trò: Admin, Manager và Student.

## Công nghệ sử dụng

## ✨ Tính năng

### Frontend

### 🔐 Xác thực & Phân quyền- React 18 + TypeScript

- Đăng nhập với 3 vai trò- Tailwind CSS

- Đăng ký tài khoản sinh viên (4 bước)- React Router v6

- Validation email sinh viên (@vanlanguni.vn)- Axios

- Upload ảnh chân dung & CCCD- React Query

- Zustand (State Management)

### 👨‍💼 Quản trị viên (Admin)

- Dashboard thống kê tổng quan### Backend

- Quản lý phòng (CRUD)- Node.js + Express + TypeScript

- Quản lý người dùng- MongoDB + Mongoose

- Duyệt đơn đăng ký → Tự động tạo hợp đồng & hóa đơn- JWT Authentication

- Quản lý hợp đồng- VNPay Payment Gateway

- Quản lý hóa đơn- Nodemailer

- Xử lý yêu cầu bảo trì

## Cấu trúc dự án

### 👨‍🏫 Quản lý (Manager)

- Tương tự Admin (không quản lý người dùng)```

abx/

### 🎓 Sinh viên (Student)├── client/                 # Frontend React Application

- Xem thông tin cá nhân│   ├── public/

- Đăng ký phòng ký túc xá│   ├── src/

- Xem hợp đồng & hóa đơn của mình│   │   ├── components/    # Reusable components

- Thanh toán hóa đơn online│   │   ├── pages/         # Page components

- Gửi yêu cầu bảo trì/khiếu nại│   │   ├── services/      # API services

│   │   ├── store/         # State management

## 🛠️ Công nghệ│   │   ├── types/         # TypeScript types

│   │   ├── utils/         # Utility functions

### Frontend│   │   └── App.tsx

- **React 18** + **TypeScript**│   └── package.json

- **Vite** - Build tool│

- **Tailwind CSS** - Styling├── server/                # Backend Node.js Application

- **React Router v6** - Routing│   ├── src/

- **Zustand** - State management│   │   ├── controllers/   # Request handlers

- **Lucide React** - Icons│   │   ├── models/        # Database models

│   │   ├── routes/        # API routes

### Storage│   │   ├── middleware/    # Middleware functions

- **localStorage** - Lưu trữ dữ liệu (demo, không cần database)│   │   ├── services/      # Business logic

- **Web Crypto API** - Hash mật khẩu (SHA-256)│   │   ├── utils/         # Utility functions

│   │   └── server.ts

## 📦 Cài đặt│   └── package.json

│

### Yêu cầu└── README.md

- Node.js 16+ và npm

```

### Các bước

## Chức năng theo vai trò

```bash

# 1. Di chuyển vào thư mục client### 1. Sinh viên

cd client- ✅ Đăng ký tài khoản và đăng ký ở ký túc xá

- ✅ Xem thông tin phòng và tình trạng phòng trống

# 2. Cài đặt dependencies- ✅ Quản lý hợp đồng (gia hạn, kết thúc)

npm install- ✅ Thanh toán trực tuyến qua VNPay

- ✅ Gửi yêu cầu sửa chữa

# 3. Chạy development server- ✅ Xem thông báo

npm run dev

### 2. Nhân viên Quản lý

# 4. Mở trình duyệt- ✅ Quản lý sinh viên (duyệt đơn, xếp phòng)

http://localhost:3000- ✅ Quản lý phòng và trang thiết bị

```- ✅ Ghi nhận chỉ số điện nước

- ✅ Quản lý tài chính và hóa đơn

## 👤 Tài khoản mặc định- ✅ Xử lý yêu cầu từ sinh viên

- ✅ Báo cáo và thống kê

### Admin

- Email: `admin@gmail.com`### 3. Quản trị viên

- Mật khẩu: `admin123`- ✅ Quản lý tài khoản nhân viên

- ✅ Phân quyền người dùng

### Manager- ✅ Quản lý danh mục hệ thống

- Email: `manager@gmail.com`- ✅ Xem báo cáo tổng hợp

- Mật khẩu: `manager123`

## Cài đặt

### Student (có đầy đủ dữ liệu mẫu)

- Email: `student@gmail.com`### Yêu cầu

- Mật khẩu: `student123`- Node.js >= 18.0.0

- MongoDB >= 6.0

### Sinh viên khác- npm hoặc yarn

- `nguyenvana@gmail.com` / `123456`

- `lethib@gmail.com` / `123456`### Backend

- `phamvanc@gmail.com` / `123456````bash

cd server

## 🎯 Luồng hoạt độngnpm install

cp .env.example .env

### 1. Sinh viên đăng ký tài khoản# Cấu hình .env file

1. Truy cập `/register`npm run dev

2. Điền 4 bước:```

   - Bước 1: Thông tin cơ bản (email @vanlanguni.vn)

   - Bước 2: Thông tin học vụ (mã SV 10 số, khoa, ngành...)### Frontend

   - Bước 3: Upload ảnh chân dung```bash

   - Bước 4: Upload ảnh CCCD 2 mặtcd client

3. Hoàn tất đăng kýnpm install

npm run dev

### 2. Sinh viên đăng ký phòng```

1. Đăng nhập

2. Vào "Đơn đăng ký" > "Tạo đơn mới"## Biến môi trường

3. Chọn phòng, học kỳ, năm học

4. Đợi admin duyệt### Server (.env)

```

### 3. Admin duyệt đơnPORT=5000

1. Đăng nhập adminMONGODB_URI=mongodb://localhost:27017/dormitory

2. Vào "Đơn đăng ký"JWT_SECRET=your_jwt_secret_key

3. Nhấn "Duyệt" đơn → **Tự động**:JWT_EXPIRE=7d

   - Tạo hợp đồng (5 tháng)VNPAY_TMN_CODE=your_vnpay_tmn_code

   - Tạo hóa đơn tháng đầuVNPAY_HASH_SECRET=your_vnpay_hash_secret

   - Cập nhật số người ở phòngVNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html

VNPAY_RETURN_URL=http://localhost:3000/payment/return

### 4. Sinh viên thanh toánEMAIL_HOST=smtp.gmail.com

1. Vào "Hóa đơn"EMAIL_PORT=587

2. Xem hóa đơn pendingEMAIL_USER=your_email@gmail.com

3. Nhấn "Thanh toán"EMAIL_PASSWORD=your_email_password

```

### 5. Yêu cầu bảo trì

1. Sinh viên tạo yêu cầu (bảo trì/khiếu nại)### Client (.env)

2. Manager xử lý: Pending → In Progress → Completed```

VITE_API_URL=http://localhost:5000/api

## 🗂️ Cấu trúc thư mục```



```## API Documentation

client/API documentation sẽ được cung cấp sau khi khởi động server tại: http://localhost:5000/api-docs

├── src/

│   ├── components/## License

│   │   └── Layout.tsx          # Layout chính với sidebarMIT

│   ├── pages/
│   │   ├── Login.tsx           # Trang đăng nhập
│   │   ├── Register.tsx        # Trang đăng ký (4 bước)
│   │   ├── Dashboard.tsx       # Tổng quan
│   │   ├── Profile.tsx         # Thông tin cá nhân
│   │   ├── Rooms.tsx           # Quản lý phòng
│   │   ├── Applications.tsx    # Đơn đăng ký
│   │   ├── Contracts.tsx       # Hợp đồng
│   │   ├── Invoices.tsx        # Hóa đơn
│   │   ├── Requests.tsx        # Yêu cầu bảo trì
│   │   └── Users.tsx           # Quản lý người dùng
│   ├── services/
│   │   ├── api.ts              # Mock API service
│   │   └── localStorageService.ts  # CRUD với localStorage
│   ├── store/
│   │   └── authStore.ts        # Zustand auth store
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces
│   ├── App.tsx                 # Routes
│   ├── main.tsx                # Entry point
│   └── index.css               # Global styles
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

## 🔄 Tính năng đồng bộ tự động

### Khi duyệt đơn đăng ký:
- ✅ Tạo hợp đồng 5 tháng
- ✅ Tạo hóa đơn tiền phòng tháng đầu
- ✅ Tăng số người ở phòng
- ✅ Cập nhật trạng thái phòng (nếu đầy)

### Khi tạo hợp đồng thủ công:
- ✅ Tạo hóa đơn tháng đầu
- ✅ Cập nhật trạng thái phòng

### Khi xóa hợp đồng:
- ✅ Xóa tất cả hóa đơn liên quan

## 🎨 Giao diện

- Responsive design
- Tailwind CSS utility classes
- Card-based layouts
- Color-coded status badges
- Icon-rich UI với Lucide React

## 🔒 Bảo mật

- Mật khẩu được hash bằng SHA-256
- Protected routes theo role
- Validation đầy vào form
- Kiểm tra email sinh viên Văn Lang
- Validate mã sinh viên 10 số
- Validate CCCD 9/12 số

## 📱 Responsive

- Desktop: Full sidebar
- Tablet: Collapsible sidebar
- Mobile: Bottom navigation

## 🧹 Reset dữ liệu

Mở Console trình duyệt (F12) và chạy:

```javascript
localStorage.clear();
location.reload();
```

## 📝 License

MIT License - Sử dụng tự do cho mục đích học tập

## 👨‍💻 Author

Developed for Văn Lang University Dormitory Management System
