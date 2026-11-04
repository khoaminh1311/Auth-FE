import { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Button from './components/common/Button';
import Input from './components/common/Input';
import Badge from './components/common/Badge';

// Icons extracted from Figma via MCP
import shieldIcon from './assets/icons/shield.svg';
import dashboardIcon from './assets/icons/dashboard.svg';
import lockIcon from './assets/icons/lock.svg';
import adminIcon from './assets/icons/admin.svg';
import logoutIcon from './assets/icons/logout.svg';
import refreshIcon from './assets/icons/refresh.svg';
import copyIcon from './assets/icons/copy.svg';
import emailIcon from './assets/icons/email.svg';
import codeIcon from './assets/icons/code.svg';
import userIcon from './assets/icons/user.svg';

function Phase2Showcase() {
  const [currentUser, setCurrentUser] = useState({
    name: 'Flamingo',
    email: 'flamingo@authportal.io',
    role: 'user', // 'user' or 'admin'
  });
  const [testPassword, setTestPassword] = useState('');
  const [testEmail, setTestEmail] = useState('');

  const toggleRole = () => {
    setCurrentUser((prev) => ({
      ...prev,
      role: prev.role === 'admin' ? 'user' : 'admin',
      name: prev.role === 'admin' ? 'Flamingo' : 'Admin Flamingo',
      email: prev.role === 'admin' ? 'flamingo@authportal.io' : 'admin@authportal.io',
    }));
  };

  const handleLogoutConfirm = () => {
    alert('Đăng xuất thành công (Demo callback)!');
  };

  return (
    <AppLayout
      title="Khung Giao Diện Dùng Chung & UI Components"
      subtitle="PHASE 2 • SHARED WORKSPACE LAYOUT"
      user={currentUser}
      onLogoutConfirm={handleLogoutConfirm}
    >
      <div className="space-y-8">
        
        {/* Banner giới thiệu Phase 2 */}
        <div className="bg-primary text-white p-6 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase bg-white/20 mb-2">
              Phase 2 Nghiệm thu
            </div>
            <h2 className="text-xl font-bold">
              Shared Layout, Drawer, Modal &amp; Nguyên tử UI
            </h2>
            <p className="text-sm text-blue-100 mt-1">
              Toàn bộ icon đã trích xuất 100% từ Figma Node qua Figma MCP. Khung Layout đáp ứng chuẩn Responsive Mobile/Desktop.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={toggleRole}
            >
              Chuyển vai trò: {currentUser.role === 'admin' ? 'Admin ➔ User' : 'User ➔ Admin'}
            </Button>
          </div>
        </div>

        {/* 1. Bộ Icon trích xuất từ Figma MCP */}
        <div className="bg-white p-6 rounded-xl border border-card-border shadow-sm space-y-4">
          <div className="border-b border-card-border pb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-secondary">
              1. Bộ Icon Vector SVG Bóc Tách Từ Figma MCP
            </h3>
            <span className="text-xs text-neutral">
              100% Asset Fidelity (Không dùng Lucide/FontAwesome)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { name: 'shield.svg (Logo)', src: shieldIcon },
              { name: 'dashboard.svg', src: dashboardIcon },
              { name: 'lock.svg', src: lockIcon },
              { name: 'admin.svg', src: adminIcon },
              { name: 'logout.svg', src: logoutIcon },
              { name: 'refresh.svg', src: refreshIcon },
              { name: 'copy.svg', src: copyIcon },
              { name: 'email.svg', src: emailIcon },
              { name: 'code.svg', src: codeIcon },
              { name: 'user.svg', src: userIcon },
            ].map((icon) => (
              <div
                key={icon.name}
                className="p-3 rounded-lg bg-slate-50 border border-card-border flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-md bg-white border border-slate-200 flex items-center justify-center shrink-0">
                  <img src={icon.src} alt="" className="w-4 h-4" />
                </div>
                <span className="text-xs font-mono text-slate-700 truncate">
                  {icon.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Common Buttons Showcase */}
        <div className="bg-white p-6 rounded-xl border border-card-border shadow-sm space-y-4">
          <div className="border-b border-card-border pb-3">
            <h3 className="text-base font-bold text-secondary">
              2. UI Component: Button (Các biến thể chuẩn)
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Nút Primary (#2563EB)</Button>
            <Button variant="secondary">Nút Secondary</Button>
            <Button variant="danger">Nút Danger (#DC2626)</Button>
            <Button
              variant="danger-outline"
              icon={<img src={logoutIcon} alt="" className="w-3.5 h-3.5" />}
            >
              Nút Danger Outline
            </Button>
            <Button variant="ghost">Nút Ghost</Button>
            <Button variant="primary" loading>
              Đang tải...
            </Button>
          </div>
        </div>

        {/* 3. Common Inputs Showcase */}
        <div className="bg-white p-6 rounded-xl border border-card-border shadow-sm space-y-4">
          <div className="border-b border-card-border pb-3">
            <h3 className="text-base font-bold text-secondary">
              3. UI Component: Input (Hỗ trợ Icon &amp; Toggle Password Edge-Safe)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
            <Input
              label="Địa chỉ Email"
              type="email"
              placeholder="name@example.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              icon={<img src={emailIcon} alt="" className="w-4 h-4 opacity-60" />}
              helperText="Nhập email hợp lệ đã đăng ký"
            />

            <Input
              label="Mật khẩu"
              type="password"
              placeholder="••••••••"
              value={testPassword}
              onChange={(e) => setTestPassword(e.target.value)}
              icon={<img src={lockIcon} alt="" className="w-4 h-4 opacity-60" />}
              helperText="Hỗ trợ nút bật/tắt mắt bảo vệ mật khẩu"
            />
          </div>
        </div>

        {/* 4. Common Badges Showcase */}
        <div className="bg-white p-6 rounded-xl border border-card-border shadow-sm space-y-4">
          <div className="border-b border-card-border pb-3">
            <h3 className="text-base font-bold text-secondary">
              4. UI Component: Badge &amp; Method Tags
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="role-pill" dot dotColor="bg-primary">
              VAI TRÒ: THÀNH VIÊN
            </Badge>
            <Badge variant="role-pill" dot dotColor="bg-emerald-500">
              VAI TRÒ: QUẢN TRỊ VIÊN
            </Badge>
            <Badge variant="method-get">GET</Badge>
            <Badge variant="method-post">POST</Badge>
            <Badge variant="method-put">PUT</Badge>
            <Badge variant="success" dot dotColor="bg-emerald-500">
              Sẵn sàng
            </Badge>
            <Badge variant="danger">Lỗi xác thực</Badge>
            <Badge variant="warning">Cảnh báo phiên</Badge>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Phase2Showcase />
    </BrowserRouter>
  );
}
