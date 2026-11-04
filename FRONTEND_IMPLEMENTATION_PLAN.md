# FRONTEND IMPLEMENTATION PLAN — AUTH PORTAL (REACT + TAILWIND CSS)

> **Mục đích tài liệu:** Đây là bản kế hoạch chi tiết (Step-by-Step Implementation Plan) dành riêng cho việc phát triển ứng dụng **Frontend React + Tailwind CSS** kết nối dữ liệu thiết kế từ **Figma thông qua Figma MCP**, và tích hợp với **Backend Auth API** có sẵn.
> **Nguyên tắc làm việc:** AI Agent phải thực hiện tuần tự từng Phase. **Chỉ chuyển sang Phase tiếp theo khi Người dùng đã review và nghiệm thu Phase hiện tại.**

---

## Quy tắc Git Workflow Bắt buộc xuyên suốt Các Phase

1. Branch `main` là Production, cấm commit trực tiếp lên `main`.
2. Mọi Phase phải được thực hiện trên một branch riêng (`chore/...`, `feat/...`, `docs/...`).
3. Chuẩn commit message: `feat:`, `fix:`, `chore:`, `docs:`.
4. Quy trình kết thúc mỗi Phase:
   ```bash
   git add .
   git commit -m "feat/chore: mô tả công việc của phase"
   git push origin <ten-branch>
   # → Tạo Pull Request (PR) trên GitHub
   # → Người dùng Review & Merge vào main
   ```

---

## Phase 1: Setup Foundation, Design Tokens & Git Initialization

- **Mục tiêu:** Khởi tạo project React chuẩn, cấu hình Tailwind CSS đồng bộ 100% với Figma token và kiểm tra kết nối API ban đầu.
- **Git Branch:** `chore/project-setup`
- **Đầu vào (Inputs):** 
  - Figma Color Styles & Typography từ file Figma (hoặc mục 6 của `SESSION_HANDOVER.md`).
  - Endpoint Backend: `GET /health` (kiểm tra server sống).
- **Các bước thực hiện:**
  1. Khởi tạo dự án React bằng Vite trong thư mục mới:
     ```bash
     npm create vite@latest . -- --template react
     npm install
     npm install -D tailwindcss postcss autoprefixer
     npx tailwindcss init -p
     npm install react-router-dom axios
     ```
  2. Cấu hình `tailwind.config.js` với đúng bảng màu Enterprise Blueprint:
     - `primary`: `#2563EB` (Tech Blue)
     - `secondary`: `#0F172A` (Slate-900)
     - `tertiary`: `#EFF6FF` (Blue-50)
     - `neutral`: `#64748B` (Slate-500)
     - `app-bg`: `#F8FAFC`
     - `card-border`: `#E2E8F0`
  3. Thêm cấu hình chặn con mắt Edge vào `src/styles/index.css`:
     ```css
     @tailwind base;
     @tailwind components;
     @tailwind utilities;

     input[type="password"]::-ms-reveal,
     input[type="password"]::-ms-clear {
       display: none;
     }
     ```
  4. Cấu hình file `.env.example` và `.env`:
     ```env
     VITE_API_URL=http://localhost:5000/api
     ```
  5. Viết `src/services/api.js` (cấu hình Axios instance cơ bản và test gọi thử endpoint `/health`).
- **Tiêu chí nghiệm thu (Definition of Done):**
  - Chạy `npm run dev` hiển thị trang chủ không có lỗi console.
  - Gọi được `GET /health` từ backend và in ra `{ status: "ok" }`.
  - Bảng màu Tailwind hiển thị đúng mã màu quy định.
- **Cấm kỵ:**
  - Không cài đặt các thư viện thừa (Redux, Next.js, Lodash, FontAwesome...).
  - Không tự ý thêm màu cam đất (`#BC4800`) vào Tailwind config.

---

## Phase 2: Figma Asset Extraction & Shared Layout Components

- **Mục tiêu:** Dùng Figma MCP tải đúng tài nguyên SVG và dựng các thành phần khung dùng chung (Layout, Topbar, Sidebar, Drawer, Modal).
- **Git Branch:** `feat/shared-layout`
- **Đầu vào (Inputs):**
  - Figma Node: Các icon SVG trên thanh sidebar và header.
  - Quy chuẩn Layout từ `docs/DESIGN.md:L91-118`.
- **Các bước thực hiện:**
  1. Dùng Figma MCP `download_figma_images` (hoặc lấy mã vector SVG trực tiếp) để xuất các icon: `shield/verified_user`, `dashboard`, `lock`, `logout`, `menu`, `close`, `admin_panel_settings` lưu vào `src/assets/icons/`.
  2. Xây dựng các UI nguyên tử:
     - `src/components/common/Button.jsx`
     - `src/components/common/Input.jsx`
     - `src/components/common/Badge.jsx`
  3. Xây dựng Khung Layout dùng chung:
     - `src/components/layout/Topbar.jsx`: Cao 64px, chứa nút hamburger (mobile), subtitle 11px uppercase `CỔNG XÁC THỰC BẢO MẬT` (mb-1), title H1, user capsule và role badge.
     - `src/components/layout/Sidebar.jsx`: Chiều rộng 260px, header logo `Auth Portal`, menu danh mục `DANH MỤC LÀM VIỆC`, footer chân trang cách đều 12px (`space-y-3`) tới nút Đăng xuất đỏ viền mỏng.
     - `src/components/layout/MobileDrawer.jsx`: Xử lý backdrop mờ `#sidebar-backdrop` và trượt drawer trên màn hình nhỏ `< 1024px`.
     - `src/components/layout/AppLayout.jsx`: Bọc Topbar + Sidebar + Container nội dung `pt-24 pb-12 px-4 sm:px-8 max-w-7xl mx-auto`.
  4. Xây dựng Modal Xác nhận đăng xuất:
     - `src/components/modals/LogoutModal.jsx`: Dialog bo góc `rounded-xl`, khung icon tròn `w-10 h-10` đỏ nhạt, tiêu đề H3 `Xác nhận đăng xuất`, nút Hủy và nút Đăng xuất màu đỏ.
- **Tiêu chí nghiệm thu:**
  - Bật/tắt được Sidebar Drawer trên màn hình responsive mobile mượt mà.
  - Bấm nút Đăng xuất mở đúng `LogoutModal`, bấm Hủy hoặc Backdrop thì đóng modal.
  - Toàn bộ icon hiển thị đúng 100% SVG từ Figma, không dùng icon lệch từ thư viện ngoài.
- **Cấm kỵ:**
  - Không tự chế thêm nút ADMIN hay badge lạ vào Sidebar.
  - Không để nút Đăng xuất dính sát viền thẻ profile ở footer.

---

## Phase 3: Screen 1 — Authentication Portal (Login & Register)

- **Mục tiêu:** Xây dựng màn hình đăng nhập & đăng ký đầy đủ tương tác, bám sát Figma Screen 1 và kết nối Backend API.
- **Git Branch:** `feat/auth-portal`
- **Đầu vào (Inputs):**
  - Figma Node ID: `[NODE_ID_SCREEN_1]`
  - Backend Endpoints: `POST /api/auth/login`, `POST /api/auth/register`.
- **Các bước thực hiện:**
  1. Gọi Figma MCP `get_figma_data` cho `[NODE_ID_SCREEN_1]` để lấy thông số căn chỉnh, khoảng cách card `max-w-[440px]`.
  2. Tạo `src/utils/passwordValidator.js`: Viết hàm kiểm tra 4 tiêu chí (độ dài >= 8, chữ hoa, số, ký tự đặc biệt).
  3. Tạo `src/contexts/AuthContext.jsx`: Quản lý state đăng nhập, lưu JWT vào `localStorage` khi đăng nhập thành công.
  4. Tạo `src/pages/AuthPage.jsx`:
     - Bố cục Split-Screen 50/50 trên Desktop; trên Mobile tự động ẩn panel màu xanh bên trái (`hidden lg:flex`), hiện logo nhỏ phía trên form (`lg:hidden`).
     - Segmented Tabs: Switcher 50/50 giữa "Đăng nhập" và "Đăng ký".
     - **Form Đăng nhập:**
       - Input Email, Input Password (nút con mắt toggle ẩn/hiện).
       - Checkbox "Ghi nhớ đăng nhập" (không tick sẵn; không có link Quên mật khẩu).
       - Nút CTA "Đăng nhập →" có spinner loading và disable khi đang gọi API.
       - Bắt lỗi `401 Unauthorized` từ API -> hiển thị Callout lỗi đỏ.
     - **Form Đăng ký:**
       - Input Họ tên, Email, Password, Confirm Password.
       - Thanh đo độ mạnh mật khẩu 3 vạch cập nhật tức thì (Chưa nhập: 3 xám; Yếu: 1 đỏ; Trung bình: 2 vàng; Mạnh: 3 xanh).
       - Badge kiểm tra trùng khớp mật khẩu thời gian thực (Mật khẩu khớp: xanh lá / Không khớp: đỏ).
       - Nút CTA "Tạo tài khoản →" có spinner loading.
       - Bắt lỗi `409 Conflict` khi email đã tồn tại -> hiển thị Callout lỗi đỏ.
- **Tiêu chí nghiệm thu:**
  - Đăng ký thành công tài khoản mới vào database MongoDB thật.
  - Đăng nhập thành công, nhận JWT token và lưu vào `localStorage`.
  - Hiển thị đúng lỗi khi nhập sai mật khẩu (401) hoặc trùng email (409).
  - Thanh đo độ mạnh mật khẩu và báo trùng khớp hoạt động mượt mà.
- **Cấm kỵ:**
  - Không thêm link "Quên mật khẩu?" gửi email.
  - Không để giá trị email/password điền sẵn trong form.

---

## Phase 4: Screen 2 & Screen 3 — User Workspace & Password Security

- **Mục tiêu:** Dựng màn hình Dashboard tài khoản cá nhân và màn hình Đổi mật khẩu, kết nối API lấy profile và cập nhật mật khẩu.
- **Git Branch:** `feat/user-workspace`
- **Đầu vào (Inputs):**
  - Figma Node IDs: `[NODE_ID_SCREEN_2]` và `[NODE_ID_SCREEN_3]`.
  - Backend Endpoints: `GET /api/auth/me`, `PUT /api/auth/change-password`, `POST /api/auth/logout`.
- **Các bước thực hiện:**
  1. Tạo `src/utils/formatDate.js` để định dạng ngày tạo tài khoản.
  2. Tạo `src/pages/UserDashboardPage.jsx` (Screen 2):
     - Gọi `GET /api/auth/me` để lấy thông tin người dùng thật (`name`, `email`, `role`, `createdAt`).
     - Gọi `GET /health` để hiển thị trạng thái `TRẠNG THÁI API: Sẵn sàng`.
     - Thẻ Hero xanh chào Flamingo có nút "Làm mới dữ liệu" (xoay icon `sync` khi bấm).
     - Thẻ chi tiết hồ sơ (User ID có nút sao chép, Email, Vai trò, Ngày tạo).
     - Panel Claims JWT: Khung code hiển thị JSON giải mã kèm nút "Sao chép JSON" (phản hồi text "Đã sao chép!" trong 1.5s).
  3. Tạo `src/pages/ChangePasswordPage.jsx` (Screen 3):
     - Banner cảnh báo thu hồi phiên màu hổ phách (thuần text, không có icon).
     - Form đổi mật khẩu: Mật khẩu hiện tại, Mật khẩu mới (có 3 vạch đo độ mạnh), Xác nhận mật khẩu mới (có badge báo khớp).
     - Nút "Hủy thay đổi" (reset form) và nút "Cập nhật mật khẩu mới" (thuần text, có spinner loading khi submit).
     - Gọi `PUT /api/auth/change-password`: Nếu thành công -> hiển thị Alert xanh -> tự động đăng xuất và điều hướng về trang đăng nhập.
     - Card giáo dục giải thích chính sách Bcrypt 12 rounds và cơ chế tự động hủy phiên qua `password_changed_at`.
- **Tiêu chí nghiệm thu:**
  - Vào Dashboard hiển thị đúng thông tin của tài khoản vừa đăng nhập.
  - Bấm sao chép JSON hoạt động bình thường trên trình duyệt.
  - Đổi mật khẩu thành công bằng API backend thật; token cũ bị thu hồi.
  - Không có bất kỳ icon nào xuất hiện trong banner cảnh báo hổ phách và nút submit của Screen 3.
- **Cấm kỵ:**
  - Không chèn thêm icon trang trí vào Screen 3 trái với thiết kế Figma.

---

## Phase 5: Screen 4 — Admin RBAC Console & Route Authorization

- **Mục tiêu:** Dựng màn hình Quản trị hệ thống, kiểm soát phân quyền RBAC và hiển thị Ma trận Endpoint API chuẩn 100% README.
- **Git Branch:** `feat/admin-rbac`
- **Đầu vào (Inputs):**
  - Figma Node ID: `[NODE_ID_SCREEN_4]`.
  - Tài liệu tham chiếu: Mục 6.1 `README.md` (Danh sách 6 endpoint).
- **Các bước thực hiện:**
  1. Xây dựng `src/routes/ProtectedRoute.jsx`:
     - Kiểm tra nếu chưa đăng nhập -> chuyển hướng về `/login`.
     - Kiểm tra nếu `requiredRole="admin"` mà người dùng có `role === "user"` -> chặn truy cập, chuyển hướng về `/dashboard`.
  2. Tạo `src/pages/AdminDashboardPage.jsx` (Screen 4):
     - Badge Topbar: `VAI TRÒ: QUẢN TRỊ VIÊN`.
     - Menu Active: `Quản trị hệ thống` (thuần icon + text, không có pill badge ADMIN).
     - Thẻ Hero Admin: Đồng bộ cấu trúc với User Dashboard (tiêu đề "Trung tâm Quản trị Xác thực & Phân quyền RBAC", badge `[GET] /api/auth/me`, nút "Làm mới dữ liệu" xoay icon và hiển thị Toast thông báo).
     - 3 Thẻ số liệu thực tế: `TRẠNG THÁI SERVER` (`200 OK`), `CƠ CHẾ PHÂN QUYỀN` (`2 Cấp độ`), `GIỚI HẠN TẦN SUẤT API` (`20 req / 15m`).
     - **Bảng Ma trận Phân quyền Endpoint API (RBAC Matrix Table):**
       - 4 cột: `Phương thức` | `Tuyến đường` | `Quyền hạn` | `Mô tả`.
       - Cột `Quyền hạn` hiển thị text thuần (`text-slate-700 font-medium`), đồng nhất giữa `Public` và `Protected (Token)` (không dùng badge viền màu).
       - Hiển thị đúng 6 dòng endpoint từ mục 6.1 README backend.
- **Tiêu chí nghiệm thu:**
  - Đăng nhập bằng tài khoản `role: user` không thể truy cập vào route `/admin`.
  - Đăng nhập bằng tài khoản `role: admin` truy cập đầy đủ và thấy bảng Ma trận Endpoint hiển thị đẹp mắt, chuẩn responsive.
- **Cấm kỵ:**
  - TUYỆT ĐỐI KHÔNG tạo bảng danh sách người dùng hay các nút Thêm/Sửa/Xóa user (CRUD) ảo.

---

## Phase 6: E2E Verification, Clean Code & Accurate Frontend Documentation

- **Mục tiêu:** Kiểm thử toàn diện toàn bộ luồng người dùng trên trình duyệt và biên soạn file `README.md` chuẩn mực cho repository Frontend.
- **Git Branch:** `docs/readme-cleanup`
- **Các bước thực hiện:**
  1. Kiểm thử thông suốt (End-to-End Testing):
     - Đăng ký tài khoản mới -> Tự động chuyển đăng nhập.
     - Đăng nhập -> Vào User Dashboard kiểm tra thông tin profile.
     - Sang trang Đổi mật khẩu -> Đổi thành công -> Bị đăng xuất -> Đăng nhập lại bằng mật khẩu mới.
     - Đăng xuất bằng Modal xác nhận -> Kiểm tra token đã bị xóa khỏi `localStorage`.
     - Đăng nhập bằng tài khoản Admin -> Vào Admin Dashboard xem ma trận phân quyền.
  2. Rà soát console trình duyệt: Đảm bảo không còn bất kỳ warning hay error nào.
  3. Biên soạn file `README.md` cho repository Frontend:
     - Tên dự án: **Auth Portal - Frontend Client (React + Tailwind CSS)**.
     - Tech Stack: Ghi đúng React 18, Tailwind CSS, Vite, Axios, React Router. Không ghi công nghệ backend.
     - Hướng dẫn cài đặt & chạy: `npm install`, `npm run dev`, `npm run build`.
     - Cấu hình biến môi trường: Giải thích `VITE_API_URL` và file `.env.example`.
     - Mô tả 4 màn hình giao diện thực tế.
- **Tiêu chí nghiệm thu:**
  - Toàn bộ flow kiểm thử chạy hoàn hảo không phát sinh lỗi.
  - File `README.md` sạch sẽ, chính xác 100%, không có thông tin rác.
  - Tạo PR cuối cùng để merge vào branch `main`.

