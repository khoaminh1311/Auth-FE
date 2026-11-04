# SESSION HANDOVER: TRANSITION TO REACT FRONTEND (FIGMA MCP INTEGRATION)

> **Mục đích tài liệu:** Tài liệu bàn giao bối cảnh dự án, kiến trúc kỹ thuật, quy chuẩn thiết kế, giao thức an toàn và các nguyên tắc bắt buộc cho AI Agent ở phiên làm việc mới. Phiên tiếp theo sẽ sử dụng **Figma MCP** để kết nối trực tiếp với bản thiết kế Figma và xây dựng dự án frontend hoàn chỉnh bằng **React + Tailwind CSS** trên một repository mới độc lập.

---

## 1. Tổng quan Dự án & Bối cảnh Chuyển giao

- **Tên dự án:** Auth-API (Hệ thống xác thực Stateless JWT & phân quyền RBAC - Dự án Thực tập).
- **Hiện trạng hệ thống:**
  - **Backend API:** Đã hoàn thiện 100% trên Node.js/Express/MongoDB, vượt qua toàn bộ smoke test nội bộ.
  - **Giao diện mẫu:** Đã chốt hoàn thiện 4 màn hình và quy chuẩn hóa tại `docs/DESIGN.md`. Giao diện hiện đã được đưa lên Figma.
- **Mục tiêu của AI ở Session mới:**
  1. Sử dụng công cụ **Figma MCP** (`get_figma_data`, `download_figma_images`) để đọc thông số thiết kế từ Figma.
  2. Bóc tách chính xác components, layout, typography, màu sắc và icon SVG từ Figma.
  3. Xây dựng ứng dụng frontend hoàn chỉnh bằng **React + Tailwind CSS** (tuyệt đối không dùng Vanilla JS).
  4. Đấu nối với Backend API sẵn có (`VITE_API_URL`) và tuân thủ đúng 100% thiết kế từ Figma.
  5. Thực hiện tuần tự theo kế hoạch chi tiết trong file độc lập **`FRONTEND_IMPLEMENTATION_PLAN.md`**.

---

## 2. Thông tin Kết nối Figma (Placeholders)

> *Người dùng sẽ dán link và thông tin Figma trực tiếp vào phần này trước khi bắt đầu phiên làm việc mới:*

- **Figma File URL:** (https://www.figma.com/design/YemSVfRSBRCHcf6PDSoExs/Untitled?node-id=0-1&t=m6ipZchJXMd4fTgk-1)
- **Figma File Key:** YemSVfRSBRCHcf6PDSoExs
- **Figma Node IDs (từng màn hình):**
  - Screen 1 (Authentication Portal - Login & Register): 1:2
  - Screen 2 (User Workspace Dashboard - Profile & JWT Claims): 1:524
  - Screen 3 (Password Security Workspace - Change Password): 1:337
  - Screen 4 (Admin Console - RBAC Monitoring & Endpoint Matrix): 1:140

---

## 3. Các Nguyên tắc Bắt buộc (Strict Rules & Constraints)

AI Agent ở session mới **bắt buộc phải tuân thủ nghiêm ngặt các quy tắc sau**:

### 3.1. Công nghệ Frontend bắt buộc
- **Framework & Styling:** **React (Functional Components & Hooks: `useState`, `useEffect`, `useContext`)** kết hợp **Tailwind CSS**.
- **Tuyệt đối KHÔNG sử dụng Vanilla JS** hoặc gom chung HTML/JS vào một file như bản prototype cũ.

### 3.2. Tuân thủ 100% Giao diện Figma (Zero Deviation)
- Bám sát chính xác từng pixel, padding, margin, font size, border radius và color fill từ Figma thông qua MCP.
- **Tuyệt đối không tự ý thêm bớt** nút bấm, thẻ thông tin, badge, cột bảng hay tự sáng tạo thêm các thành phần ngoài thiết kế Figma.

### 3.3. Quy tắc về Icon & Tài nguyên Đồ họa (Asset Fidelity)
- **Tuyệt đối không tự ý thêm icon:** Nếu trên Figma một nút bấm, thẻ cảnh báo, hay menu chỉ có chữ thuần (ví dụ: banner cảnh báo hổ phách và nút Submit ở Screen 3 là pure text), thì trong React code **cấm tuyệt đối không được chèn thêm bất kỳ icon nào**.
- **Xuất đúng vector SVG từ Figma:** Tất cả các icon có trên Figma bắt buộc phải được xuất chính xác dưới dạng SVG chuẩn qua tool `download_figma_images` hoặc lấy đúng mã vector SVG trong node data của Figma. **Không được tự ý thay thế bằng icon từ các bộ icon ngoài (như FontAwesome, Lucide...) nếu không giống 100%.**
- Kích thước icon (`width`, `height`) và màu sắc (`fill`, `stroke`) phải lấy đúng từ Figma node.

### 3.4. Giao thức An toàn Xử lý Lỗi Figma MCP & Rate Limit (Fail-Safe Protocol)
- **DỪNG LẠI NGAY LẬP TỨC (HALT ON ERROR):** Khi gọi MCP tool (`get_figma_data`, `download_figma_images`) mà xảy ra bất kỳ lỗi nào sau đây:
  - `401 Unauthorized`: Token Figma bị sai hoặc hết hạn.
  - `403 Forbidden`: Tài khoản không có quyền đọc file Figma.
  - `404 Not Found`: Sai File Key hoặc Node ID.
  - `429 Too Many Requests`: Đã chạm ngưỡng giới hạn lượt gọi (Rate Limit) của Figma API.
  - Lỗi mạng hoặc response payload bị lỗi:
  👉 **AI KHÔNG ĐƯỢC PHÉP tự ý đoán mò hay tự bịa code giao diện để "chữa cháy".**
- **Báo cáo minh bạch:** AI phải lập tức in thông báo rõ ràng cho Người dùng: tên lỗi, mã HTTP code, nguyên nhân phát sinh lỗi và dừng lại chờ lệnh từ Người dùng.
- **Tiết kiệm Quota:** Không gọi toàn bộ file Figma (document root). Chỉ gọi đúng Node ID của màn hình đang thực hiện theo kế hoạch.

### 3.5. Quy trình Review-First
- **Không tự ý ghi đè mã nguồn một cách âm thầm.** Luôn trình bày kế hoạch component, cấu trúc thư mục hoặc đoạn code cần tạo/sửa để Người dùng review và phê duyệt trước khi áp dụng.

### 3.6. Giới hạn Phạm vi Backend (Scope Boundaries)
- **KHÔNG LÀM CRUD USER:** Backend hoàn toàn không có endpoint `/api/users`, không hỗ trợ thêm/sửa/xóa user. Tuyệt đối không tạo bảng danh sách quản lý user hay các modal CRUD trên Admin Dashboard.
- **KHÔNG LÀM QUÊN MẬT KHẨU (Forgot Password):** Backend không có luồng gửi mail reset token. Chỉ có tính năng **"Đổi mật khẩu" (Change Password)** khi đã đăng nhập.
- **LOGOUT STATELESS:** Logout chỉ xóa JWT token tại client (localStorage/cookie/state). Server không dùng Redis blacklist.

### 3.7. Quy tắc Git Workflow chuẩn
Người dùng và AI phải tuân thủ nghiêm ngặt Git workflow sau:
- Branch `main` là Production, làm việc trên feature branch, tạo Pull Request (PR) trước khi merge.
- Commit message theo chuẩn: `feat:`, `fix:`, `chore:`, `docs:`:
```bash
# Bắt đầu feature mới
git checkout -b feat/ten-feature

# Commit thường xuyên
git add .
git commit -m "feat: mô tả ngắn gọn công việc"

# Push và tạo PR
git push origin feat/ten-feature
# → Tạo Pull Request trên GitHub
# → Review → Merge vào main
```
- **Lưu ý:** AI không tự ý chạy các lệnh `git push`, `git merge` làm thay đổi repo. Chỉ gợi ý lệnh để người dùng tự thực hiện.

---

## 4. Đề xuất Cấu trúc Thư mục Repository Frontend Mới

```text
auth-frontend/ (Repository React độc lập)
├── public/
│   └── favicon.ico               # Favicon biểu tượng Auth Portal
├── src/
│   ├── assets/                   # Tài nguyên xuất CHÍNH XÁC từ Figma qua MCP
│   │   └── icons/                # Các file SVG icon tải từ Figma (không dùng thư viện ngoài)
│   │
│   ├── components/               # Các UI Component tái sử dụng
│   │   ├── common/               # Component hạt nhân (Button, Input, Badge, Toast, Spinner)
│   │   ├── layout/               # Layout dùng chung:
│   │   │   ├── AppLayout.jsx     # Khung Workspace chứa Topbar + Sidebar
│   │   │   ├── Topbar.jsx        # Header 64px, subtitle 11px, title H1, avatar + badge vai trò
│   │   │   ├── Sidebar.jsx       # Sidebar 260px (Desktop cố định) + Drawer (Mobile)
│   │   │   └── MobileDrawer.jsx  # Backdrop mờ (#sidebar-backdrop) + hiệu ứng slide-over
│   │   └── modals/
│   │       └── LogoutModal.jsx   # Modal xác nhận đăng xuất chuẩn mực (#logout-modal)
│   │
│   ├── contexts/                 # Quản lý State toàn cục
│   │   └── AuthContext.jsx       # Quản lý token, user profile, role (user/admin), login(), logout()
│   │
│   ├── services/                 # Giao tiếp với Backend API (Node.js/Express)
│   │   ├── api.js                # Axios/Fetch client đính kèm Header Authorization: Bearer <token>
│   │   └── authService.js        # Khai báo chính xác 5 endpoint Auth + 1 health check
│   │
│   ├── utils/                    # Các hàm bổ trợ dùng chung
│   │   ├── token.js              # Lưu/lấy/xóa JWT từ localStorage
│   │   ├── formatDate.js         # Format timestamp sang định dạng ngày giờ chuẩn Việt Nam
│   │   └── passwordValidator.js  # Hàm kiểm tra 4 tiêu chí độ mạnh mật khẩu (dùng chung cho Đăng ký & Đổi mk)
│   │
│   ├── pages/                    # 4 Trang tương ứng 100% với 4 Screen trên Figma
│   │   ├── AuthPage.jsx          # Screen 1: Tab Đăng nhập & Đăng ký (Split-screen)
│   │   ├── UserDashboardPage.jsx # Screen 2: Tổng quan tài khoản (/api/auth/me)
│   │   ├── ChangePasswordPage.jsx# Screen 3: Đổi mật khẩu (/api/auth/change-password)
│   │   └── AdminDashboardPage.jsx# Screen 4: Quản trị hệ thống & Ma trận RBAC
│   │
│   ├── routes/                   # Hệ thống Định tuyến (React Router)
│   │   ├── AppRoutes.jsx         # Cấu hình danh sách route (/login, /dashboard, /change-password, /admin)
│   │   └── ProtectedRoute.jsx    # Chặn truy cập khi chưa có token; kiểm tra đúng role Admin
│   │
│   ├── styles/                   # Style toàn cục
│   │   └── index.css             # Import Tailwind CSS + quy tắc chặn con mắt Edge (::-ms-reveal)
│   │
│   ├── App.jsx                   # Root component
│   └── main.jsx                  # Entry point
│
├── .env.example                  # VITE_API_URL=http://localhost:5000/api
├── package.json                  # Khai báo CHÍNH XÁC các dependency (react, react-router-dom, tailwindcss...)
├── tailwind.config.js            # Khai báo đúng màu Enterprise Blueprint (#2563EB, #0F172A, #EFF6FF, #64748B)
├── vite.config.js                # Cấu hình Vite
└── README.md                     # Tài liệu hướng dẫn Frontend chuẩn xác 100%
```

---

## 5. Quy chuẩn Soạn thảo `README.md` cho Frontend (Chống ghi sai / ghi thiếu)

Khi viết file `README.md` cho repository frontend mới, AI phải tuân thủ nghiêm ngặt:

1. **Tập trung 100% vào Frontend:**
   - **Tech Stack:** Chỉ ghi các công nghệ thực tế trong frontend (`React 18+`, `Tailwind CSS`, `React Router DOM`, `Vite`, `Axios`).
   - **Tuyệt đối KHÔNG đưa công nghệ backend** (Node, Express, MongoDB, Mongoose, Bcrypt...) vào mục Tech Stack của frontend.
   - **Cấm:** Không được nhắc tới TypeScript (nếu dùng JSX), Next.js, Redux, Docker, Jest, Swagger hay các thư viện "ma" không cài đặt.
2. **Cấu hình Kết nối Backend:**
   - Chỉ cần hướng dẫn biến môi trường duy nhất: `VITE_API_URL` trỏ tới Backend API sẵn có (kèm file `.env.example`).
3. **Mô tả 4 Màn hình Chính xác:**
   - Mô tả đúng 4 màn hình: Authentication Portal (Split-Screen), User Dashboard, Change Password Workspace, Admin Console (RBAC Monitoring).
   - Tuyệt đối không mô tả tính năng CRUD người dùng hay Quên mật khẩu qua email.
4. **Hướng dẫn Cài đặt & Khởi chạy Trung thực:**
   - Các lệnh chạy thực tế từ `package.json`: `npm install`, `npm run dev`, `npm run build`.

---

## 6. Bảng Màu Chuẩn (Enterprise Blueprint Tokens)

> **Cảnh báo quan trọng:** Dự án sử dụng hệ màu **Tech Blue & Slate**. Tuyệt đối **KHÔNG** sử dụng màu cam đất (`#BC4800`) hay xám nâu (`#757681`).

- **Primary:** `#2563EB` (Tech Blue / Blue-600) — Nền hero card, nút CTA chính, active state.
- **Primary Hover:** `#1D4ED8` (Blue-700) — Trạng thái hover nút CTA.
- **Secondary / Headings:** `#0F172A` (Slate-900) — Tiêu đề trang, chữ đậm, viền card tương phản.
- **Tertiary / Light Accent:** `#EFF6FF` (Blue-50) — Nền item active ở sidebar, nền pill badge vai trò.
- **Neutral / Subtitles:** `#64748B` (Slate-500) — Phụ đề topbar, mô tả phụ, placeholder.
- **Card Surface & Sidebar:** `#FFFFFF` (Trắng tinh khiết).
- **Page Background:** `#F8FAFC` (Slate-50 phẳng, tuyệt đối không dùng gradient).
- **Card Border:** `#E2E8F0` (Slate-200, viền mảnh 1px sắc nét).
- **Edge Browser Password Fix:** Phải thêm luật CSS ẩn con mắt mặc định của Edge vào `src/styles/index.css`:
  ```css
  input[type="password"]::-ms-reveal,
  input[type="password"]::-ms-clear {
    display: none;
  }
  ```

---

## 7. Tài liệu Kế hoạch Triển khai Chi tiết

Mọi bước triển khai kỹ thuật cụ thể theo từng Phase được quy định chi tiết tại file độc lập:
👉 **[FRONTEND_IMPLEMENTATION_PLAN.md](D:\Master-Plan-Intern\Auth-FE\FRONTEND_IMPLEMENTATION_PLAN.md)**
