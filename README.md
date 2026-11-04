# Auth Portal — Frontend Client

Ứng dụng giao diện người dùng (Frontend Client) cho hệ thống xác thực Stateless JWT và phân quyền RBAC, xây dựng bằng **React** kết hợp **Tailwind CSS**, đồng bộ 100% thiết kế từ **Figma** thông qua **Figma MCP**.

---

## 1. Công nghệ Sử dụng (Tech Stack)

- **Framework:** React 19 (Functional Components, Hooks)
- **Styling:** Tailwind CSS (Enterprise Blueprint Design Tokens)
- **Routing:** React Router DOM
- **HTTP Client:** Axios
- **Build Tool:** Vite

---

## 2. Cấu hình Biến Môi trường (Environment Configuration)

Ứng dụng giao tiếp với Backend Auth API thông qua biến môi trường `VITE_API_URL`:

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Nội dung `.env`:

```env
# Backend API Base URL
VITE_API_URL=http://localhost:3000/api
```

---

## 3. Cài đặt & Khởi chạy (Getting Started)

### Cài đặt dependencies:
```bash
npm install
```

### Chạy môi trường phát triển (Dev Server):
```bash
npm run dev
```

### Xây dựng bản phát hành Production:
```bash
npm run build
```

### Xem thử bản build (Preview):
```bash
npm run preview
```

---

## 4. Danh sách Màn hình Giao diện (Screens)

1. **Authentication Portal (Split-Screen):** Tab chuyển đổi giữa Đăng nhập (hỗ trợ toggle ẩn/hiện mật khẩu) và Đăng ký (thanh đo độ mạnh mật khẩu và kiểm tra trùng khớp thời gian thực).
2. **User Workspace Dashboard:** Hiển thị thông tin hồ sơ tài khoản (`/api/auth/me`), trạng thái server và panel Claims JWT có tính năng sao chép JSON.
3. **Password Security Workspace:** Form đổi mật khẩu bảo mật kèm banner cảnh báo thu hồi phiên và hướng dẫn cơ chế Bcrypt 12 rounds.
4. **Admin Console (RBAC Monitoring):** Bảng ma trận phân quyền Endpoint API (RBAC Matrix Table) và thống kê trạng thái hệ thống dành riêng cho tài khoản Quản trị viên (`role: admin`).
