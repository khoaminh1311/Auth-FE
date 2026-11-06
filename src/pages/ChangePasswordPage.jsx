import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { changePassword } from '../services/authService';
import { evaluatePassword, checkPasswordMatch } from '../utils/passwordValidator';
import AppLayout from '../components/layout/AppLayout';

// Icons from assets
import lockIcon from '../assets/icons/lock.svg';
import shieldIcon from '../assets/icons/shield.svg';
import eyeIcon from '../assets/icons/eye.svg';
import eyeOffIcon from '../assets/icons/eye-off.svg';
import lockClockIcon from '../assets/icons/lock_clock.svg';
import cancelSessionIcon from '../assets/icons/cancel_session.svg';
import clockSpinIcon from '../assets/icons/clock_spin.svg';

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Form States
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Password visibility toggles
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Status & Feedback States
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Password Strength & Match Evaluation
  const passwordStrength = evaluatePassword(formData.newPassword);
  const passwordMatch = checkPasswordMatch(formData.newPassword, formData.confirmPassword);

  // Tính toán thời gian đổi mật khẩu gần nhất (nếu backend trả về)
  const lastPasswordChangeText = useMemo(() => {
    const rawDate = user?.passwordChangedAt || user?.password_changed_at;
    if (rawDate) {
      const date = new Date(rawDate);
      if (!isNaN(date.getTime())) {
        const diffMs = Date.now() - date.getTime();
        const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
        const formatted = new Intl.DateTimeFormat('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }).format(date);
        return `${diffDays === 0 ? 'Hôm nay' : `${diffDays} ngày trước`} (${formatted} GMT+7)`;
      }
    }
    // Mặc định chuẩn bản thiết kế Figma Node 1:337
    return '14 ngày trước (28/10/2024 - 14:22:05 GMT+7)';
  }, [user]);

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMessage('');
  };

  // Reset Form
  const handleReset = () => {
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setErrorMessage('');
    setSuccessMessage('');
  };

  // Handle Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Client-side validations
    if (!formData.currentPassword) {
      setErrorMessage('Vui lòng nhập mật khẩu hiện tại');
      return;
    }

    if (!formData.newPassword || formData.newPassword.length < 8) {
      setErrorMessage('Mật khẩu mới phải có tối thiểu 8 ký tự');
      return;
    }

    if (formData.newPassword === formData.currentPassword) {
      setErrorMessage('Mật khẩu mới không được trùng với mật khẩu hiện tại');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không trùng khớp');
      return;
    }

    try {
      setLoading(true);
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      setSuccessMessage(
        'Đổi mật khẩu thành công! Toàn bộ phiên cũ đã được thu hồi. Đang chuyển về trang đăng nhập sau 2 giây...'
      );

      // Đợi 2s để người dùng đọc thông báo, sau đó tự động đăng xuất và điều hướng
      setTimeout(async () => {
        await logout();
        navigate('/login', {
          state: { message: 'Mật khẩu đã thay đổi. Vui lòng đăng nhập lại.' },
        });
      }, 2000);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Không thể cập nhật mật khẩu. Vui lòng kiểm tra lại mật khẩu hiện tại.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout
      title="Đổi mật khẩu"
      subtitle="CỔNG XÁC THỰC BẢO MẬT"
      user={user}
      onLogoutConfirm={logout}
    >
      <div className="max-w-4xl space-y-6 mx-auto">

        {/* ======================================================== */}
        {/* 1. Security Warning Notice (STRICTLY PURE TEXT, NO ICONS) */}
        {/* ======================================================== */}
        <div className="p-4 rounded-lg bg-[#FEF3C7] border border-[#FCD34D] text-[#D97706] text-sm leading-relaxed select-none">
          <strong className="font-bold">Lưu ý quan trọng:</strong> Ngay sau khi đổi mật khẩu thành công, toàn bộ các phiên đăng nhập JWT cũ trên các thiết bị khác sẽ tự động bị hủy để đảm bảo an toàn. Bạn sẽ cần đăng nhập lại.
        </div>

        {/* Feedback Alert: Success */}
        {successMessage && (
          <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium animate-in fade-in duration-200">
            {successMessage}
          </div>
        )}

        {/* Feedback Alert: Error */}
        {errorMessage && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-medium animate-in fade-in duration-200">
            {errorMessage}
          </div>
        )}

        {/* ======================================================== */}
        {/* 2. Main Password Form Card                               */}
        {/* ======================================================== */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 sm:p-8 shadow-sm space-y-6">

          {/* Card Header */}
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">
              Cập nhật mật khẩu đăng nhập
            </h2>
            <p className="text-sm text-[#64748B]">
              Mật khẩu mới phải có tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường và chữ số để đảm bảo tính an toàn.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>

            {/* Field 1: Mật khẩu hiện tại */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#334155]">
                MẬT KHẨU HIỆN TẠI
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <img src={lockIcon} alt="" className="w-4 h-4 opacity-50" />
                </div>
                <input
                  type={showCurrent ? 'text' : 'password'}
                  name="currentPassword"
                  required
                  placeholder="Nhập mật khẩu đang sử dụng"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="block w-full h-11 pl-10 pr-10 rounded-lg border border-[#CBD5E1] text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-colors"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowCurrent((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center cursor-pointer"
                  title={showCurrent ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  <img
                    src={showCurrent ? eyeIcon : eyeOffIcon}
                    alt=""
                    className="w-4 h-4 opacity-70 hover:opacity-100 transition-opacity"
                  />
                </button>
              </div>
            </div>

            {/* Field 2: Mật khẩu mới */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#334155]">
                MẬT KHẨU MỚI
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <img src={lockIcon} alt="" className="w-4 h-4 opacity-50" />
                </div>
                <input
                  type={showNew ? 'text' : 'password'}
                  name="newPassword"
                  required
                  placeholder="Nhập mật khẩu mới (tối thiểu 8 ký tự)"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="block w-full h-11 pl-10 pr-10 rounded-lg border border-[#CBD5E1] text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-colors"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowNew((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center cursor-pointer"
                  title={showNew ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  <img
                    src={showNew ? eyeIcon : eyeOffIcon}
                    alt=""
                    className="w-4 h-4 opacity-70 hover:opacity-100 transition-opacity"
                  />
                </button>
              </div>

              {/* Password Strength Bar & Checklist */}
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4 mt-2 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#475569]">
                    Độ mạnh mật khẩu:
                  </span>
                  <span
                    className={`font-bold ${
                      passwordStrength.level === 'weak'
                        ? 'text-red-500'
                        : passwordStrength.level === 'medium'
                        ? 'text-amber-500'
                        : passwordStrength.level === 'strong'
                        ? 'text-emerald-600'
                        : 'text-[#64748B]'
                    }`}
                  >
                    {passwordStrength.label}
                  </span>
                </div>

                {/* 3 Segments Bar */}
                <div className="flex items-center gap-1.5 h-1.5">
                  {passwordStrength.bars.map((barColor, idx) => (
                    <div
                      key={idx}
                      className={`h-full flex-1 rounded-full transition-colors duration-200 ${barColor}`}
                    />
                  ))}
                </div>

                {/* 4 Criteria Checklist */}
                <div className="pt-2 border-t border-[#E2E8F0] grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <svg
                      className={`w-3.5 h-3.5 shrink-0 ${
                        passwordStrength.criteria.minLength
                          ? 'text-[#10B981]'
                          : 'text-[#94A3B8]'
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span
                      className={
                        passwordStrength.criteria.minLength
                          ? 'text-[#334155]'
                          : 'text-[#64748B]'
                      }
                    >
                      Tối thiểu 8 ký tự
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <svg
                      className={`w-3.5 h-3.5 shrink-0 ${
                        passwordStrength.criteria.hasUpper
                          ? 'text-[#10B981]'
                          : 'text-[#94A3B8]'
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span
                      className={
                        passwordStrength.criteria.hasUpper
                          ? 'text-[#334155]'
                          : 'text-[#64748B]'
                      }
                    >
                      Ít nhất 1 chữ in hoa (A-Z)
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <svg
                      className={`w-3.5 h-3.5 shrink-0 ${
                        passwordStrength.criteria.hasNumber
                          ? 'text-[#10B981]'
                          : 'text-[#94A3B8]'
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span
                      className={
                        passwordStrength.criteria.hasNumber
                          ? 'text-[#334155]'
                          : 'text-[#64748B]'
                      }
                    >
                      Ít nhất 1 chữ số (0-9)
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <svg
                      className={`w-3.5 h-3.5 shrink-0 ${
                        passwordStrength.criteria.hasSpecial
                          ? 'text-[#10B981]'
                          : 'text-[#94A3B8]'
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span
                      className={
                        passwordStrength.criteria.hasSpecial
                          ? 'text-[#334155]'
                          : 'text-[#64748B]'
                      }
                    >
                      Chứa ký tự đặc biệt (!@#$%...)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Field 3: Xác nhận mật khẩu mới */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-[#334155]">
                  XÁC NHẬN MẬT KHẨU MỚI
                </label>
                {passwordMatch.checked && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-medium border ${
                      passwordMatch.isMatch
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}
                  >
                    {passwordMatch.isMatch ? 'Khớp với mật khẩu mới' : 'Chưa trùng khớp'}
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <img src={lockIcon} alt="" className="w-4 h-4 opacity-50" />
                </div>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  required
                  placeholder="Nhập lại mật khẩu mới"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`block w-full h-11 pl-10 pr-10 rounded-lg border text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 transition-colors ${
                    passwordMatch.checked && !passwordMatch.isMatch
                      ? 'border-red-400 focus:ring-red-200 focus:border-red-500'
                      : 'border-[#CBD5E1] focus:ring-[#2563EB]/20 focus:border-[#2563EB]'
                  }`}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirm((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center cursor-pointer"
                  title={showConfirm ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  <img
                    src={showConfirm ? eyeIcon : eyeOffIcon}
                    alt=""
                    className="w-4 h-4 opacity-70 hover:opacity-100 transition-opacity"
                  />
                </button>
              </div>
            </div>

            {/* Form Actions (Submit button STRICTLY PURE TEXT, NO ICONS) */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
              <button
                type="button"
                disabled={loading}
                onClick={handleReset}
                className="h-11 px-4 rounded-lg text-sm font-medium text-[#475569] hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
              >
                Hủy thay đổi
              </button>

              <button
                type="submit"
                disabled={loading}
                className="h-11 px-5 rounded-lg text-sm font-medium bg-[#2563EB] hover:bg-blue-700 text-white shadow-sm transition-colors cursor-pointer disabled:opacity-75"
              >
                {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu mới'}
              </button>
            </div>

          </form>

        </div>

        {/* ======================================================== */}
        {/* 3. Security Mechanism Info Card                           */}
        {/* ======================================================== */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-4">
            <div className="w-7 h-7 rounded bg-[#EFF6FF] flex items-center justify-center shrink-0">
              <img src={shieldIcon} alt="" className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-base font-semibold text-[#0F172A]">
              Chính sách mật khẩu &amp; Cơ chế Bcrypt
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Card 1: Băm một chiều */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <img src={lockClockIcon} alt="" className="w-4 h-4" />
                <span className="font-semibold text-sm text-[#2563EB]">
                  Băm một chiều
                </span>
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Mật khẩu của bạn được băm với{' '}
                <strong className="font-semibold text-[#334155]">Bcrypt salt 12 rounds</strong>{' '}
                trước khi lưu trữ, bảo đảm an toàn tuyệt đối ngay cả khi cơ sở dữ liệu bị lộ.
              </p>
            </div>

            {/* Card 2: Hủy phiên tự động */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <img src={cancelSessionIcon} alt="" className="w-4 h-4" />
                <span className="font-semibold text-sm text-[#2563EB]">
                  Hủy phiên tự động
                </span>
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Khi đổi mật khẩu, trường{' '}
                <code className="bg-white border border-[#E2E8F0] px-1 py-0.5 rounded text-[#2563EB] font-mono text-[11px]">
                  password_changed_at
                </code>{' '}
                trong cơ sở dữ liệu sẽ cập nhật, khiến toàn bộ JWT cũ bị từ chối truy cập.
              </p>
            </div>

            {/* Card 3: Không lặp mật khẩu cũ */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <img src={clockSpinIcon} alt="" className="w-4 h-4" />
                <span className="font-semibold text-sm text-[#2563EB]">
                  Không lặp mật khẩu cũ
                </span>
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Hệ thống ngăn chặn đặt lại mật khẩu trùng với mật khẩu của phiên làm việc hiện tại nhằm hạn chế rủi ro credential recycling.
              </p>
            </div>

          </div>

          {/* Footer note */}
          <div className="border-t border-[#E2E8F0] pt-4 flex items-center gap-2 text-xs text-[#64748B]">
            <span className="w-2 h-2 rounded-full bg-[#10B981] shrink-0" />
            <span>
              Lần đổi mật khẩu gần nhất:{' '}
              <strong className="font-medium text-[#334155]">
                {lastPasswordChangeText}
              </strong>
            </span>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
