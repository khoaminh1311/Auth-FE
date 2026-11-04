import { useAuth } from '../contexts/AuthContext';
import AppLayout from '../components/layout/AppLayout';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

export default function UserDashboardPage() {
  const { user, logout } = useAuth();

  return (
    <AppLayout
      title="Tổng quan tài khoản"
      subtitle="CỔNG XÁC THỰC BẢO MẬT"
      user={user}
      onLogoutConfirm={logout}
    >
      <div className="space-y-6">
        {/* Hero Card */}
        <div className="bg-primary text-white p-6 rounded-xl shadow-sm space-y-2">
          <Badge variant="primary" className="bg-white/20 text-white border-none text-xs">
            Phiên Đăng Nhập Hoạt Động
          </Badge>
          <h2 className="text-2xl font-bold">
            Xin chào, {user?.name || 'Flamingo'}!
          </h2>
          <p className="text-sm text-blue-100 max-w-2xl">
            Chào mừng bạn quay lại không gian làm việc an toàn của Auth Portal. Đăng nhập thành công với Stateless JWT.
          </p>
        </div>

        {/* User Profile Card */}
        <div className="bg-white p-6 rounded-xl border border-card-border shadow-sm space-y-4">
          <h3 className="text-base font-bold text-secondary">
            Thông tin tài khoản xác thực
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="p-4 rounded-lg bg-slate-50 border border-card-border">
              <span className="text-xs text-neutral uppercase font-semibold block mb-1">
                Họ và tên
              </span>
              <span className="font-medium text-secondary">{user?.name}</span>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 border border-card-border">
              <span className="text-xs text-neutral uppercase font-semibold block mb-1">
                Email
              </span>
              <span className="font-medium text-secondary">{user?.email}</span>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 border border-card-border">
              <span className="text-xs text-neutral uppercase font-semibold block mb-1">
                Vai trò hệ thống (RBAC)
              </span>
              <span className="font-medium text-secondary uppercase">
                {user?.role === 'admin' ? 'Quản trị viên (Admin)' : 'Thành viên (User)'}
              </span>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 border border-card-border">
              <span className="text-xs text-neutral uppercase font-semibold block mb-1">
                User ID
              </span>
              <span className="font-mono text-xs text-secondary">{user?.id || user?._id}</span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

