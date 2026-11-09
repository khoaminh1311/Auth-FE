# Auth Portal — Frontend Client (React + Tailwind CSS)

Ứng dụng giao diện người dùng (Frontend Client) cho hệ thống xác thực Stateless JWT và phân quyền vai trò (RBAC), xây dựng bằng **React 19** kết hợp **Tailwind CSS**, bám sát 100% bản thiết kế hệ thống **Enterprise Blueprint** từ Figma thông qua **Figma MCP**.

---

## 1. Công nghệ Sử dụng (Tech Stack)

Dự án tuân thủ nghiêm ngặt mô hình ứng dụng Single Page Application (SPA) phía Client, chỉ sử dụng các thư viện thực tế được cài đặt trong `package.json`:

* **Core Framework:** React 19 (`19.3.1`) — Functional Components & Hooks (`useState`, `useEffect`, `useContext`, `useMemo`, `useCallback`, `useRef`).
* **Styling Framework:** Tailwind CSS (`3.4.19`) kèm PostCSS và Autoprefixer — Bảng màu Enterprise Blueprint chuẩn hóa.
* **Định tuyến (Client-Side Routing):** React Router DOM (`7.18.5`) — Hệ thống route bảo vệ phân quyền (Protected Routes & RBAC Guards).
* **HTTP Client:** Axios (`1.21.0`) — Cấu hình Interceptors tự động đính kèm Bearer Token và bắt lỗi thu hồi phiên 401 Unauthorized.
* **Build Tool & Development Server:** Vite (`8.3.5`) — Tốc độ build siêu nhanh và tối ưu hóa tài nguyên bundle.
* **Code Linter:** Oxlint (`1.89.0`) — Kiểm tra chất lượng mã nguồn và tối ưu hiệu năng render của React.

> **Cam kết quy chuẩn tài liệu:** 100% Client-side. Không bao gồm công nghệ backend (Node.js, Express, MongoDB...) hay các thư viện không cài đặt (Redux, Next.js, TypeScript...).

---

## 2. Cấu trúc Thư mục Dự án (Project Architecture)

```text
Auth-FE/
├── public/
│   └── favicon.ico               # Favicon biểu tượng Auth Portal
├── src/
│   ├── assets/                   # Vector SVG xuất chính xác từ bản thiết kế Figma
│   │   └── icons/                # 28 file SVG chuẩn hóa (shield, lock, server, spin, eye...)
│   │
│   ├── components/               # Các UI Component tái sử dụng
│   │   ├── common/               # Component hạt nhân (Button.jsx)
│   │   ├── layout/               # Khung bố cục dùng chung:
│   │   │   ├── AppLayout.jsx     # Bọc Topbar + Sidebar + Container nội dung
│   │   │   ├── Topbar.jsx        # Header 64px, subtitle 11px, title H1, avatar + badge vai trò
│   │   │   ├── Sidebar.jsx       # Thanh điều hướng 260px cố định trên Desktop
│   │   │   └── MobileDrawer.jsx  # Drawer trượt kèm backdrop mờ trên Mobile
│   │   └── modals/
│   │       └── LogoutModal.jsx   # Modal xác nhận đăng xuất an toàn
│   │
│   ├── contexts/                 # Quản lý State toàn cục
│   │   └── AuthContext.jsx       # Lưu trữ token, user profile, role (user/admin), login(), logout()
│   │
│   ├── pages/                    # 4 Trang tương ứng 4 Màn hình chuẩn Figma
│   │   ├── AuthPage.jsx          # Screen 1: Tab Đăng nhập & Đăng ký (Split-screen 50/50)
│   │   ├── UserDashboardPage.jsx # Screen 2: Tổng quan tài khoản & Giám sát phiên JWT
│   │   ├── ChangePasswordPage.jsx# Screen 3: Không gian bảo mật & Đổi mật khẩu
│   │   └── AdminDashboardPage.jsx# Screen 4: Bảng điều khiển Quản trị & Ma trận RBAC
│   │
│   ├── routes/                   # Hệ thống Định tuyến React Router
│   │   ├── AppRoutes.jsx         # Khai báo cấu hình danh sách routes (/login, /dashboard, /change-password, /admin)
│   │   └── ProtectedRoute.jsx    # Guard chặn truy cập trái phép & kiểm tra role Admin
│   │
│   ├── services/                 # Giao tiếp với Backend Auth API
│   │   ├── api.js                # Axios client đính kèm Authorization header & 401 Interceptor
│   │   └── authService.js        # Khai báo các API call (login, register, me, changePassword, logout)
│   │
│   ├── styles/                   # Style toàn cục
│   │   └── index.css             # Import Tailwind CSS + quy tắc chặn con mắt Edge (::-ms-reveal)
│   │
│   ├── utils/                    # Các hàm tiện ích dùng chung
│   │   ├── token.js              # Lưu/lấy/xóa JWT (hỗ trợ cả localStorage và sessionStorage) & giải mã Base64URL
│   │   ├── formatDate.js         # Format timestamp & trích xuất ngày tạo từ MongoDB ObjectId
│   │   └── passwordValidator.js  # Hàm đánh giá 4 tiêu chí độ mạnh mật khẩu và so khớp mật khẩu
│   │
│   ├── App.jsx                   # Component gốc bọc AuthProvider và AppRoutes
│   └── main.jsx                  # Điểm khởi đầu ứng dụng (Entry point)
│
├── .env.example                  # File mẫu cấu hình biến môi trường
├── index.html                    # HTML template
├── package.json                  # Khai báo dependencies và scripts
├── tailwind.config.js            # Bảng màu Enterprise Blueprint Tokens
└── vite.config.js                # Cấu hình Vite bundler
```

---

## 3. Cấu hình Biến Môi trường (Environment Setup)

Ứng dụng giao tiếp với Backend Auth API thông qua biến môi trường `VITE_API_URL`.

Tạo file `.env` tại thư mục gốc từ file mẫu:

```bash
cp .env.example .env
```

Nội dung file `.env`:

```env
# 1. Khi phát triển cục bộ (Local Development):
# VITE_API_URL=http://localhost:3000/api

# 2. Khi kết nối Backend Production (Render):
VITE_API_URL=https://auth-api-f540.onrender.com/api
```

> **Ghi chú về Endpoint Health Check:** Hàm kiểm tra sức khỏe máy chủ `checkHealth()` trong `src/services/api.js` tự động nhận diện gọi về endpoint root `/health` (ví dụ: `https://auth-api-f540.onrender.com/health` hoặc `http://localhost:3000/health`) thay vì `/api/health`.

---

## 4. Cài đặt & Khởi chạy (Getting Started)

### Bước 1: Cài đặt các thư viện phụ thuộc
```bash
npm install
```

### Bước 2: Khởi chạy môi trường phát triển (Development Server)
```bash
npm run dev
```
Ứng dụng sẽ chạy tại địa chỉ: `http://localhost:5173`

### Bước 3: Kiểm tra chất lượng mã nguồn (Linting)
```bash
npm run lint
```

### Bước 4: Đóng gói bản phát hành Production (Build)
```bash
npm run build
```
Bản build tĩnh được tạo ra tại thư mục `dist/`.

### Bước 5: Xem trước bản build Production (Preview)
```bash
npm run preview
```

---

## 5. Hướng dẫn Triển khai lên Vercel (Deployment)

Dự án đã được cấu hình sẵn file `vercel.json` định tuyến SPA (Single Page Application) để ngăn chặn lỗi `404: NOT_FOUND` khi người dùng F5 tải lại các trang con (`/dashboard`, `/change-password`, `/admin`):

1. **Đăng nhập Vercel** ([vercel.com](https://vercel.com)) và chọn **"Add New..."** $\rightarrow$ **"Project"**.
2. **Import** kho mã nguồn GitHub của dự án (`Auth-FE`).
3. **Cấu hình Project Settings:**
   * **Framework Preset:** `Vite` (Vercel tự động nhận diện).
   * **Root Directory:** `./`
   * **Build Command:** `npm run build`
   * **Output Directory:** `dist`
4. **Cấu hình Environment Variables (Bắt buộc):**
   * **Key:** `VITE_API_URL`
   * **Value:** `https://auth-api-f540.onrender.com/api`
5. Nhấn **"Deploy"** để hoàn tất triển khai.

---

## 6. Chi tiết 4 Màn hình Giao diện Chuẩn Figma

Dự án được thiết kế đồng bộ 100% với từng chi tiết trên bản vẽ Figma:

### 1. Screen 1 — Authentication Portal (Đăng nhập & Đăng ký)
* **Bố cục:** Split-Screen 50/50 trên Desktop (panel xanh nhận diện thương hiệu bên trái và form thẻ trắng bên phải); tự động co giãn hiển thị đơn cột trên Mobile.
* **Segmented Tabs:** Chuyển đổi mượt mà giữa form *Đăng nhập* và *Đăng ký*.
* **Form Đăng nhập:**
  * Input Email công việc và Mật khẩu (nút con mắt toggle ẩn/hiện chuyên biệt).
  * Checkbox *"Ghi nhớ đăng nhập"*: Tích chọn $\rightarrow$ lưu token vào `localStorage` (phiên dài hạn); bỏ chọn $\rightarrow$ lưu token vào `sessionStorage` (phiên ngắn hạn tự hủy khi đóng tab).
  * Nút bấm CTA có hiệu ứng Spinner xoay vòng khi đang xử lý request.
  * Bắt lỗi `401 Unauthorized` và `429 Too Many Requests` hiển thị Callout lỗi đỏ trực quan.
* **Form Đăng ký:**
  * Input Họ tên, Email, Mật khẩu và Xác nhận mật khẩu.
  * Thanh đo độ mạnh mật khẩu 3 vạch cập nhật thời gian thực (Chưa nhập: 3 xám; Yếu: 1 đỏ; Trung bình: 2 vàng; Mạnh: 3 xanh lá).
  * Huy hiệu badge kiểm tra độ trùng khớp mật khẩu tức thì.
  * Xử lý lỗi trùng email `409 Conflict` thân thiện.

### 2. Screen 2 — User Workspace Dashboard (Tổng quan Tài khoản)
* **Hero Banner:** Thẻ Tech Blue `#2563EB` chào mừng người dùng, kèm huy hiệu route `[GET] /api/auth/me` và nút *"Làm mới dữ liệu"* có hiệu ứng xoay icon `spin.svg` và Toast thông báo.
* **2 Thẻ Giám sát Phiên:**
  * *Trạng thái tài khoản:* "Đang hoạt động" kèm chấm xanh bảo mật.
  * *Thời hạn phiên đăng nhập:* Bộ đếm đếm lùi thời gian thực (`setInterval` 30s), tự động cập nhật số giờ/phút còn lại và chuyển thành "Đã hết hạn" khi chạm mốc `exp`.
* **Thẻ Chi tiết Tài khoản:** Hiển thị User ID (kèm nút sao chép nhanh có phản hồi tick xanh), Email, Vai trò, và Ngày tham gia (trích xuất thông minh từ timestamp của MongoDB ObjectId).
* **Panel JWT Claims Payload:** Khung hiển thị JSON claims đã giải mã từ chữ ký HMAC-SHA256, hỗ trợ nút "Sao chép JSON" kèm cơ chế fallback an toàn cho môi trường HTTP/iframe.

### 3. Screen 3 — Password Security Workspace (Không gian Đổi Mật khẩu)
* **Banner Lưu ý Bảo mật:** Khung màu vàng hổ phách `#FEF3C7` viền `#FCD34D` (**thuần văn bản, nghiêm ngặt không icon theo chuẩn Figma Node 1:337**), cảnh báo tự động hủy toàn bộ phiên cũ trên thiết bị khác.
* **Form Cập nhật Mật khẩu:**
  * Mật khẩu hiện tại, Mật khẩu mới và Xác nhận mật khẩu mới (đều có nút con mắt toggle).
  * Cơ chế Client Validation: Chặn đặt mật khẩu mới trùng với mật khẩu hiện tại, kèm huy hiệu cảnh báo `[Trùng mật khẩu hiện tại]` màu amber và viền cảnh báo ngay khi đang gõ.
  * Card Checklist 4 tiêu chí bảo mật (Tối thiểu 8 ký tự, Chữ in hoa, Chữ số, Ký tự đặc biệt) đổi màu tick xanh theo thời gian thực.
  * Nút "Cập nhật mật khẩu mới" (**thuần text, không icon**) có trạng thái loading.
* **Cơ chế Hủy phiên Tự động:** Sau khi đổi mật khẩu thành công, ứng dụng hiển thị thông báo, tự động thu hồi token và điều hướng về trang Login kèm banner thông báo xanh lá sau 2 giây.
* **Thẻ Cơ chế Bảo mật:** Trình bày nguyên lý băm Bcrypt 12 rounds, cập nhật `password_changed_at` và cơ chế chống lặp mật khẩu.

### 4. Screen 4 — Admin Console (Bảng điều khiển Quản trị & Ma trận RBAC)
* **Kiểm soát Quyền truy cập (Route Guard):** Chỉ cho phép tài khoản có `role === 'admin'` truy cập. Tài khoản `role === 'user'` truy cập sẽ tự động bị chặn và điều hướng về `/dashboard`.
* **Thẻ Hero Admin:** Đồng bộ cấu trúc với User Dashboard, huy hiệu vai trò `VAI TRÒ: QUẢN TRỊ VIÊN`.
* **3 Thẻ Thống kê Thực tế:**
  * *Trạng thái Server:* Trạng thái kết nối thời gian thực tới backend (`200 OK - Sẵn sàng` hoặc `Offline`).
  * *Phân quyền Hiện tại:* 2 Cấp độ phân quyền (Quản trị viên / Thành viên).
  * *Phạm vi Truy cập:* Giới hạn tần suất và chính sách bảo mật API.
* **Bảng Ma trận Phân quyền Endpoint API (RBAC Matrix Table):**
  * Bảng 4 cột: *Phương thức*, *Tuyến đường*, *Quyền hạn*, *Mô tả*.
  * Cột Phương thức hiển thị badge màu chuẩn RESTful: `GET` (Xanh lá), `POST` (Xanh dương), `PUT` (Vàng hổ phách).
  * Liệt kê đầy đủ 6 endpoint hệ thống:
    1. `GET /health` — Public — Kiểm tra trạng thái máy chủ và database.
    2. `POST /api/auth/register` — Public — Đăng ký tài khoản mới.
    3. `POST /api/auth/login` — Public — Đăng nhập và nhận chuỗi JWT token.
    4. `GET /api/auth/me` — Protected (Token) — Lấy thông tin hồ sơ tài khoản hiện tại.
    5. `PUT /api/auth/change-password` — Protected (Token) — Đổi mật khẩu, hủy token cũ.
    6. `POST /api/auth/logout` — Protected (Token) — Đăng xuất và hướng dẫn client xóa token.

---

## 7. Điểm Nhấn Kỹ thuật & Tối ưu Bảo mật (Technical Highlights)

1. **Quản lý Token Linh hoạt (Storage Strategy):** Hỗ trợ linh hoạt cả `localStorage` (phiên dài hạn) và `sessionStorage` (phiên ngắn hạn theo tab khi không tích "Ghi nhớ đăng nhập").
2. **Tự động Thu hồi Phiên với 401 Interceptor:** Khi token hết hạn hoặc mật khẩu bị đổi từ thiết bị khác, Axios interceptor tự động xóa token và chuyển hướng về `/login?expired=true` kèm thông báo lỗi rõ ràng.
3. **Bảo toàn Phiên khi Mất kết nối Mạng:** Khắc phục nhược điểm xóa token oan; khi server gián đoạn mạng, ứng dụng vẫn giữ phiên làm việc và giải mã JWT cục bộ.
4. **Giải mã Base64URL Chuẩn RFC 7519:** Tự động tính toán phần bù padding `=` trước khi giải mã qua `atob()`, triệt tiêu 100% lỗi `DOMException`.
5. **Bộ đếm Thời gian Phiên Real-time:** Không bị đóng băng thời gian, cập nhật động sau mỗi 30 giây và tự động hiển thị "Đã hết hạn".
6. **Ngăn chặn Flash Redirect:** Cấp router `AppRoutes.jsx` kiểm tra cờ `loading` trước khi chuyển hướng, loại bỏ hoàn toàn hiện tượng nhấp nháy 2 lần URL tại trang gốc `/`.
7. **Khắc phục Lỗi Trình duyệt Edge:** Tích hợp luật CSS vô hiệu hóa nút con mắt mặc định của Microsoft Edge (`::-ms-reveal`), đảm bảo nút toggle con mắt của ứng dụng hoạt động chuẩn xác và không bị trùng lặp.

---

## 8. Bảng Màu Hệ Thống (Enterprise Blueprint Tokens)

| Token | Mã màu | Ý nghĩa sử dụng |
| :--- | :--- | :--- |
| **Primary** | `#2563EB` | Tech Blue — Nền hero card, nút CTA chính, active state |
| **Primary Hover** | `#1D4ED8` | Blue-700 — Trạng thái hover của nút CTA chính |
| **Secondary** | `#0F172A` | Slate-900 — Tiêu đề trang, văn bản chính, chữ đậm |
| **Tertiary** | `#EFF6FF` | Blue-50 — Nền active sidebar item, nền role badge |
| **Neutral** | `#64748B` | Slate-500 — Phụ đề, mô tả phụ, text placeholder |
| **Card Border** | `#E2E8F0` | Slate-200 — Đường viền mảnh 1px của card và bảng |
| **App Background** | `#F8FAFC` | Slate-50 — Nền phẳng toàn ứng dụng (không gradient) |
| **Surface** | `#FFFFFF` | Trắng tinh khiết — Nền các card dữ liệu và sidebar |
