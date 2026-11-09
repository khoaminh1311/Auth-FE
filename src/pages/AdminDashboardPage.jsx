import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AppLayout from '../components/layout/AppLayout';
import { checkHealth as getBackendHealth } from '../services/api';

import serverIcon from '../assets/icons/server.svg';
import adminActiveIcon from '../assets/icons/admin-active.svg';
import shieldQuarterIcon from '../assets/icons/shield-quarter.svg';
import spinIcon from '../assets/icons/spin.svg';

const ENDPOINTS = [
  {
    method: 'GET',
    methodColor: 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]',
    path: '/health',
    permission: 'Public',
    permissionColor: 'text-[#64748B]',
    description: 'Kiểm tra trạng thái hoạt động của server và database.',
  },
  {
    method: 'POST',
    methodColor: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]',
    path: '/api/auth/register',
    permission: 'Public',
    permissionColor: 'text-[#64748B]',
    description: 'Đăng ký tài khoản mới (mặc định role user).',
  },
  {
    method: 'POST',
    methodColor: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]',
    path: '/api/auth/login',
    permission: 'Public',
    permissionColor: 'text-[#64748B]',
    description: 'Đăng nhập bằng email/mật khẩu, nhận chuỗi JWT token.',
  },
  {
    method: 'GET',
    methodColor: 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]',
    path: '/api/auth/me',
    permission: 'Protected (Token)',
    permissionColor: 'text-[#4F46E5]',
    description: 'Lấy thông tin hồ sơ của tài khoản đang đăng nhập.',
  },
  {
    method: 'PUT',
    methodColor: 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]',
    path: '/api/auth/change-password',
    permission: 'Protected (Token)',
    permissionColor: 'text-[#4F46E5]',
    description: 'Đổi mật khẩu, vô hiệu hóa token cũ.',
  },
  {
    method: 'POST',
    methodColor: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]',
    path: '/api/auth/logout',
    permission: 'Protected (Token)',
    permissionColor: 'text-[#4F46E5]',
    description: 'Đăng xuất (Stateless - hướng dẫn client xóa token).',
  },
];

export default function AdminDashboardPage() {
  const { user, logout, refreshUser } = useAuth();
  const [serverStatus, setServerStatus] = useState('200 OK');
  const [serverReadiness, setServerReadiness] = useState('Sẵn sàng');
  const [rateLimitText] = useState('20 req / 15m');
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' }); // 'success' | 'warning' | 'error' (Issue #16)

  // Theo dõi unmount & dọn dẹp timer (NEW-AUTH-07)
  const mountedRef = useRef(true);
  const timersRef = useRef([]);

  const safeSetTimeout = (callback, delay) => {
    const id = setTimeout(() => {
      if (mountedRef.current) {
        callback();
      }
    }, delay);
    timersRef.current.push(id);
    return id;
  };

  const showToast = (message, type = 'success') => {
    if (!mountedRef.current) return;
    setToast({ message, type });
    safeSetTimeout(() => setToast({ message: '', type: 'success' }), 2500);
  };

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, []);

  // Kiểm tra sức khỏe hệ thống từ endpoint thật (/health)
  const checkHealth = async () => {
    try {
      const data = await getBackendHealth();
      if (!mountedRef.current) return data;
      if (data && data.status === 'ok') {
        setServerStatus('200 OK');
        setServerReadiness('Sẵn sàng');
      } else {
        setServerStatus('200 OK');
        setServerReadiness('Đang phản hồi');
      }
      return data;
    } catch (err) {
      if (mountedRef.current) {
        setServerStatus('Offline');
        setServerReadiness('Không phản hồi');
      }
      throw err;
    }
  };

  useEffect(() => {
    getBackendHealth()
      .then((data) => {
        if (mountedRef.current) {
          if (data && data.status === 'ok') {
            setServerStatus('200 OK');
            setServerReadiness('Sẵn sàng');
          } else {
            setServerStatus('200 OK');
            setServerReadiness('Đang phản hồi');
          }
        }
      })
      .catch(() => {
        if (mountedRef.current) {
          setServerStatus('Offline');
          setServerReadiness('Không phản hồi');
        }
      });
  }, []);

  // Làm mới dữ liệu hệ thống (Issue #16: phân loại toàn bộ thành công, một phần thành công, toàn bộ thất bại)
  const handleRefreshData = async () => {
    setRefreshing(true);
    try {
      // Thực sự gọi làm mới dữ liệu từ cả 2 endpoint thật (/health và /api/auth/me)
      const [healthResult, profileResult] = await Promise.allSettled([
        checkHealth(),
        typeof refreshUser === 'function' ? refreshUser() : Promise.resolve(),
      ]);

      const isHealthOk = healthResult.status === 'fulfilled';
      const isProfileOk = profileResult.status === 'fulfilled';

      if (isHealthOk && isProfileOk) {
        showToast('Đã làm mới dữ liệu hệ thống', 'success');
      } else if (isHealthOk && !isProfileOk) {
        showToast('Đã cập nhật trạng thái server, nhưng không thể làm mới profile', 'warning');
      } else if (!isHealthOk && isProfileOk) {
        showToast('Đã làm mới profile, nhưng không thể kết nối server health', 'warning');
      } else {
        showToast('Làm mới dữ liệu thất bại. Không thể kết nối đến máy chủ', 'error');
      }
    } finally {
      safeSetTimeout(() => {
        setRefreshing(false);
      }, 500);
    }
  };

  return (
    <AppLayout
      title="Quản trị hệ thống & Phân quyền RBAC"
      subtitle="CỔNG XÁC THỰC BẢO MẬT"
      user={user}
      onLogoutConfirm={logout}
    >
      <div className="space-y-6">

        {/* ======================================================== */}
        {/* 1. Admin Hero Banner: Solid Tech Blue #2563EB             */}
        {/* ======================================================== */}
        <div className="bg-[#2563EB] text-white rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">
              Trung tâm Quản trị Xác thực &amp; Phân quyền RBAC
            </h2>
            <p className="text-sm text-[#DBEAFE] max-w-2xl leading-relaxed">
              Giám sát cấu trúc bảo vệ tài nguyên, kiểm soát phân quyền truy cập endpoint và theo
              <br className="hidden sm:inline" />
              {' '}dõi trạng thái hoạt động của hệ thống.
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
            {/* Endpoint Tag */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono bg-white/15 text-white select-none">
              <span className="font-bold text-[#BFDBFE]">[GET]</span>
              <span>/api/auth/me</span>
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={handleRefreshData}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-[#2563EB] hover:bg-blue-50 font-medium text-sm rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-75"
            >
              <img
                src={spinIcon}
                alt=""
                className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`}
              />
              <span>{refreshing ? 'Đang làm mới...' : 'Làm mới dữ liệu'}</span>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. 3 Metrics Cards (Server Status, RBAC, Rate Limit)     */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Card 1: TRẠNG THÁI SERVER */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  TRẠNG THÁI SERVER
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center shrink-0">
                  <img src={serverIcon} alt="" className="w-4 h-4" />
                </div>
              </div>

              <div className="text-2xl font-bold text-[#0F172A] tracking-tight">
                {serverStatus}
              </div>
            </div>

            <div className="pt-3 mt-4 border-t border-[#E2E8F0] flex items-center gap-2 text-xs font-medium text-[#059669]">
              <span className="w-2 h-2 rounded-full bg-[#10B981] shrink-0 animate-pulse" />
              <span>{serverReadiness}</span>
            </div>
          </div>

          {/* Card 2: CƠ CHẾ PHÂN QUYỀN */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  CƠ CHẾ PHÂN QUYỀN
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center shrink-0">
                  <img src={adminActiveIcon} alt="" className="w-4 h-4" />
                </div>
              </div>

              <div className="text-2xl font-bold text-[#0F172A] tracking-tight">
                2 Cấp độ
              </div>
            </div>

            <div className="pt-3 mt-4 border-t border-[#E2E8F0] text-xs font-medium text-[#64748B]">
              ADMIN (Toàn quyền) &amp; USER (Thành viên)
            </div>
          </div>

          {/* Card 3: GIỚI HẠN TẦN SUẤT API */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  GIỚI HẠN TẦN SUẤT API
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center shrink-0">
                  <img src={shieldQuarterIcon} alt="" className="w-3.5 h-4" />
                </div>
              </div>

              <div className="text-2xl font-bold text-[#0F172A] tracking-tight">
                {rateLimitText}
              </div>
            </div>

            <div className="pt-3 mt-4 border-t border-[#E2E8F0] flex items-center gap-2 text-xs font-medium text-[#059669]">
              <span className="w-2 h-2 rounded-full bg-[#10B981] shrink-0" />
              <span>Bảo vệ Brute-Force &amp; DoS: Hoạt động</span>
            </div>
          </div>

        </div>

        {/* ======================================================== */}
        {/* 3. RBAC Matrix Table (Ma trận Phân quyền Endpoint API)   */}
        {/* ======================================================== */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">

          {/* Section Header */}
          <div className="p-6 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-[#0F172A]">
                Ma trận Phân quyền Endpoint API (RBAC)
              </h3>
              <p className="text-sm text-[#64748B] mt-0.5">
                Cấu hình kiểm soát truy cập và middleware bảo vệ tài nguyên hệ thống.
              </p>
            </div>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE] self-start sm:self-auto shrink-0 select-none">
              6 Tuyến đường Hoạt động
            </div>
          </div>

          {/* Responsive Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  <th className="py-3.5 px-6 w-36">PHƯƠNG THỨC</th>
                  <th className="py-3.5 px-6 w-64">TUYẾN ĐƯỜNG</th>
                  <th className="py-3.5 px-6 w-44">QUYỀN HẠN</th>
                  <th className="py-3.5 px-6">MÔ TẢ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-sm">
                {ENDPOINTS.map((ep) => (
                  <tr key={ep.path + ep.method} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 align-middle">
                      <span className={`inline-block px-2.5 py-1 text-xs font-mono font-bold rounded-md border ${ep.methodColor}`}>
                        {ep.method}
                      </span>
                    </td>
                    <td className="py-4 px-6 align-middle font-mono font-semibold text-[#0F172A]">
                      {ep.path}
                    </td>
                    <td className={`py-4 px-6 align-middle text-xs font-medium ${ep.permissionColor}`}>
                      {ep.permission}
                    </td>
                    <td className="py-4 px-6 align-middle text-[#334155] leading-relaxed">
                      {ep.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

      </div>

      {/* Toast Notification */}
      {toast.message && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F172A] text-white px-4 py-2.5 rounded-lg shadow-lg text-sm flex items-center gap-2 animate-bounce">
          <span
            className={`w-2 h-2 rounded-full ${
              toast.type === 'error'
                ? 'bg-red-500'
                : toast.type === 'warning'
                  ? 'bg-amber-400'
                  : 'bg-[#10B981]'
            }`}
          />
          <span>{toast.message}</span>
        </div>
      )}
    </AppLayout>
  );
}

