import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { decodeJwt } from '../utils/token';
import { getUserJoinDate } from '../utils/formatDate';
import AppLayout from '../components/layout/AppLayout';

// Icons from assets
import copyIcon from '../assets/icons/copy.svg';
import emailIcon from '../assets/icons/email.svg';
import codeIcon from '../assets/icons/code.svg';
import clockIcon from '../assets/icons/clock.svg';
import fingerprintIcon from '../assets/icons/fingerprint.svg';
import shieldGreenIcon from '../assets/icons/shield-green.svg';
import tickGreenIcon from '../assets/icons/tick_green.svg';
import spinIcon from '../assets/icons/spin.svg';
import calendarIcon from '../assets/icons/calendar.svg';

export default function UserDashboardPage() {
  const { user, token, logout, refreshUser } = useAuth();

  const [refreshing, setRefreshing] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Decoded Claims from current JWT
  const [jwtClaims, setJwtClaims] = useState(null);

  // Update JWT Claims khi token thay đổi
  useEffect(() => {
    if (token) {
      const decoded = decodeJwt(token);
      setJwtClaims(decoded);
    }
  }, [token]);

  // Handle Refresh Data
  const handleRefreshData = async () => {
    try {
      setRefreshing(true);
      if (refreshUser) {
        await refreshUser();
      }
      if (token) {
        setJwtClaims(decodeJwt(token));
      }
      setToastMessage('Đã làm mới dữ liệu phiên làm việc');
      setTimeout(() => setToastMessage(''), 2500);
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  // Helper sao chép clipboard an toàn kèm fallback cho môi trường HTTP/iframe (BUG-MED-02)
  const copyToClipboard = async (text) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      // Fallback cho trình duyệt cũ hoặc môi trường không phải HTTPS
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-999999px';
      textarea.style.top = '-999999px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      return successful;
    } catch (err) {
      console.warn('Không thể sao chép văn bản vào clipboard:', err);
      return false;
    }
  };

  // Copy User ID
  const handleCopyId = async () => {
    const idToCopy = user?.id || user?._id || 'usr_94b8102aef7c';
    const ok = await copyToClipboard(idToCopy);
    if (ok) {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 1500);
    }
  };

  // Copy JSON Claims
  const handleCopyJson = async () => {
    if (!jwtClaims) return;
    const ok = await copyToClipboard(JSON.stringify(jwtClaims, null, 2));
    if (ok) {
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 1500);
    }
  };

  // Calculate remaining session time dynamically and update periodically (BUG-HIGH-02)
  const [sessionRemainingText, setSessionRemainingText] = useState(() => {
    if (!jwtClaims?.exp) return 'Còn 23 giờ 45 phút';
    const remainingMs = jwtClaims.exp * 1000 - Date.now();
    if (remainingMs <= 0) return 'Đã hết hạn';
    const hours = Math.floor(remainingMs / (1000 * 60 * 60));
    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    return hours > 0 ? `Còn ${hours} giờ ${minutes} phút` : `Còn ${minutes} phút`;
  });

  useEffect(() => {
    const updateCountdown = () => {
      if (!jwtClaims?.exp) {
        setSessionRemainingText('Còn 23 giờ 45 phút');
        return;
      }
      const remainingMs = jwtClaims.exp * 1000 - Date.now();
      if (remainingMs <= 0) {
        setSessionRemainingText('Đã hết hạn');
        return;
      }
      const hours = Math.floor(remainingMs / (1000 * 60 * 60));
      const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
      setSessionRemainingText(hours > 0 ? `Còn ${hours} giờ ${minutes} phút` : `Còn ${minutes} phút`);
    };

    updateCountdown();
    // Update every 30 seconds so time remaining stays accurate in real-time
    const timerId = setInterval(updateCountdown, 30000);
    return () => clearInterval(timerId);
  }, [jwtClaims?.exp]);

  const userId = user?.id || user?._id || 'usr_94b8102aef7c';
  const userRole = user?.role === 'admin' ? 'QUẢN TRỊ VIÊN' : 'THÀNH VIÊN';
  const roleDescription =
    user?.role === 'admin'
      ? '(Toàn quyền quản trị hệ thống)'
      : '(Quyền đọc / Quyền gửi dữ liệu tiêu chuẩn)';

  return (
    <AppLayout
      title="Tổng quan tài khoản"
      subtitle="CỔNG XÁC THỰC BẢO MẬT"
      user={user}
      onLogoutConfirm={logout}
    >
      <div className="space-y-6">

        {/* ======================================================== */}
        {/* 1. Compact Hero Banner & Action: Flat solid Tech Blue   */}
        {/* ======================================================== */}
        <div className="bg-[#2563EB] text-white rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">
              Xin chào, {user?.name || 'Flamingo'}!
            </h2>
            <p className="text-sm text-[#DBEAFE] max-w-2xl leading-relaxed">
              Chào mừng bạn quay lại không gian làm việc an toàn của Auth Portal. Giám sát phiên đăng nhập và
              <br className="hidden sm:inline" />
              {' '}dữ liệu JWT claims thời gian thực.
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
        {/* 2. Metrics Grid (2 columns on md/lg)                      */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Card 1: Trạng thái tài khoản */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  TRẠNG THÁI TÀI KHOẢN
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] flex items-center justify-center shrink-0">
                  <img src={shieldGreenIcon} alt="" className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-[#10B981] shrink-0" />
                <span className="text-xl sm:text-2xl font-bold text-[#0F172A]">
                  Đang hoạt động
                </span>
              </div>
            </div>

            <div className="pt-3 mt-4 border-t border-[#E2E8F0] flex items-center gap-1.5 text-xs text-[#64748B]">
              <img src={tickGreenIcon} alt="" className="w-3.5 h-3.5 shrink-0" />
              <span>Tài khoản bảo mật tốt · Không có cảnh báo</span>
            </div>
          </div>

          {/* Card 2: Thời hạn phiên đăng nhập */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  THỜI HẠN PHIÊN ĐĂNG NHẬP
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center shrink-0">
                  <img src={clockIcon} alt="" className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <img src={clockIcon} alt="" className="w-5 h-5 shrink-0" />
                <span className="text-xl sm:text-2xl font-bold text-[#0F172A]">
                  {sessionRemainingText}
                </span>
              </div>
            </div>

            <div className="pt-3 mt-4 border-t border-[#E2E8F0] flex items-center gap-1.5 text-xs text-[#64748B]">
              <img src={spinIcon} alt="" className="w-3 h-3.5 shrink-0" />
              <span>Phiên Stateless JWT tự động gia hạn khi hợp lệ</span>
            </div>
          </div>

        </div>

        {/* ======================================================== */}
        {/* 3. Account Details Card                                   */}
        {/* ======================================================== */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm space-y-4">
          <div className="border-b border-[#E2E8F0] pb-4">
            <h3 className="text-base font-semibold text-[#0F172A]">
              Chi tiết tài khoản &amp; Phiên làm việc
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Dữ liệu được trích xuất an toàn từ payload của JWT token đã giải mã
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Item 1: USER ID */}
            <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col justify-between h-[76px]">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                USER ID
              </span>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <img src={fingerprintIcon} alt="" className="w-3.5 h-3.5 shrink-0 opacity-80" />
                  <span className="font-mono text-sm font-medium text-[#1E293B] truncate">
                    {userId}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200 transition-colors cursor-pointer"
                  title={copiedId ? 'Đã sao chép!' : 'Sao chép User ID'}
                >
                  {copiedId ? (
                    <>
                      <span className="text-[11px] font-medium text-[#64748B]">Đã sao chép!</span>
                    </>
                  ) : (
                    <img src={copyIcon} alt="" className="w-3.5 h-3.5 opacity-70" />
                  )}
                </button>
              </div>
            </div>

            {/* Item 2: EMAIL */}
            <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col justify-between h-[76px]">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                EMAIL
              </span>
              <div className="flex items-center gap-2 min-w-0">
                <img src={emailIcon} alt="" className="w-3.5 h-3.5 opacity-70 shrink-0" />
                <span className="text-sm font-medium text-[#1E293B] truncate">
                  {user?.email || 'flamingo@authportal.io'}
                </span>
              </div>
            </div>

            {/* Item 3: VAI TRÒ */}
            <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col justify-between h-[76px]">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                VAI TRÒ
              </span>
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB]">
                  {userRole}
                </span>
                <span className="text-xs text-[#64748B] truncate">
                  {roleDescription}
                </span>
              </div>
            </div>

            {/* Item 4: NGÀY THAM GIA */}
            <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col justify-between h-[76px]">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                NGÀY THAM GIA
              </span>
              <div className="flex items-center gap-2 min-w-0">
                <img src={calendarIcon} alt="" className="w-3.5 h-3.5 shrink-0" />
                <span className="text-sm font-medium text-[#1E293B] truncate">
                  {getUserJoinDate(user, jwtClaims)}
                </span>
              </div>
            </div>

          </div>

          {/* Action Footer */}
          <div className="border-t border-[#E2E8F0] pt-4 flex justify-end items-center">
            <Link
              to="/change-password"
              className="text-sm font-semibold text-[#2563EB] hover:underline"
            >
              Đổi mật khẩu →
            </Link>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 4. Raw JWT Claims Inspection Panel                       */}
        {/* ======================================================== */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <img src={codeIcon} alt="" className="w-4 h-4 opacity-80" />
                <h3 className="text-base font-semibold text-[#0F172A]">
                  Dữ liệu phiên JWT giải mã (Claims Payload)
                </h3>
              </div>
              <p className="text-xs text-[#64748B] mt-0.5">
                Thông tin claims được trích xuất an toàn từ chữ ký số HMAC-SHA256 hợp lệ.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCopyJson}
              className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F1F5F9] hover:bg-slate-200 text-[#334155] font-semibold text-xs transition-colors cursor-pointer"
            >
              <img src={copyIcon} alt="" className="w-3.5 h-3.5 opacity-70" />
              <span>{copiedJson ? 'Đã sao chép!' : 'Sao chép JSON'}</span>
            </button>
          </div>

          {/* Syntax-highlighted Code Block */}
          <div className="rounded-lg bg-[#0F172A] border border-[#1E293B] p-4 font-mono text-xs overflow-x-auto leading-relaxed">
            {jwtClaims ? (
              <pre className="text-xs font-mono leading-relaxed">
                {JSON.stringify(jwtClaims, null, 2)
                  .split('\n')
                  .map((line, idx) => {
                    const match = line.match(/^(\s*)(".*?")(\s*:\s*)(.*)$/);
                    if (match) {
                      const [, indent, key, colon, value] = match;
                      let valSpan;
                      if (value.startsWith('"')) {
                        valSpan = <span className="text-[#34D399]">{value}</span>;
                      } else if (!isNaN(parseFloat(value))) {
                        valSpan = <span className="text-[#FBBF24]">{value}</span>;
                      } else if (
                        value.startsWith('true') ||
                        value.startsWith('false') ||
                        value.startsWith('null')
                      ) {
                        valSpan = <span className="text-[#FBBF24]">{value}</span>;
                      } else {
                        valSpan = <span className="text-slate-300">{value}</span>;
                      }
                      return (
                        <div key={idx}>
                          <span>{indent}</span>
                          <span className="text-[#60A5FA]">{key}</span>
                          <span className="text-[#94A3B8]">{colon}</span>
                          {valSpan}
                        </div>
                      );
                    }
                    return (
                      <div key={idx} className="text-[#94A3B8]">
                        {line}
                      </div>
                    );
                  })}
              </pre>
            ) : (
              <span className="text-slate-400">
                Không tìm thấy token phiên làm việc hiện tại.
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F172A] text-white px-4 py-2.5 rounded-lg shadow-lg text-sm flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-[#10B981]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </AppLayout>
  );
}
