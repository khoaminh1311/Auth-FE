import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { evaluatePassword, checkPasswordMatch } from '../utils/passwordValidator';
import Button from '../components/common/Button';

// SVG Icons from Figma
import shieldIcon from '../assets/icons/shield.svg';
import lockIcon from '../assets/icons/lock.svg';
import emailIcon from '../assets/icons/email.svg';
import userIcon from '../assets/icons/user.svg';
import eyeIcon from '../assets/icons/eye.svg';
import eyeOffIcon from '../assets/icons/eye-off.svg';

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  // Tab State: 'login' | 'register'
  const [activeTab, setActiveTab] = useState('login');

  // Form States
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Password visibility states
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // Status & Error States
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Password strength & matching evaluation
  const passwordStrength = evaluatePassword(registerForm.password);
  const passwordMatch = checkPasswordMatch(
    registerForm.password,
    registerForm.confirmPassword
  );

  // Switch tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setErrorMessage('');
    setSuccessMessage('');
  };

  // Handle Login Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!loginForm.email.trim() || !loginForm.password) {
      setErrorMessage('Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }

    try {
      setLoading(true);
      await login(loginForm.email, loginForm.password);
      navigate('/dashboard');
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) {
        setErrorMessage('Email hoặc mật khẩu không chính xác. Vui lòng thử lại.');
      } else if (status === 429) {
        setErrorMessage('Quá nhiều lần thử đăng nhập không thành công. Vui lòng chờ 15 phút.');
      } else {
        setErrorMessage(
          err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại kết nối.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Register Submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Validation
    if (!registerForm.name.trim() || registerForm.name.trim().length < 2) {
      setErrorMessage('Họ và tên bắt buộc và phải có ít nhất 2 ký tự');
      return;
    }
    if (!registerForm.email.trim()) {
      setErrorMessage('Vui lòng cung cấp địa chỉ email hợp lệ');
      return;
    }
    if (registerForm.password.length < 8) {
      setErrorMessage('Mật khẩu phải có độ dài tối thiểu 8 ký tự');
      return;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không trùng khớp');
      return;
    }

    try {
      setLoading(true);
      await register(registerForm.name, registerForm.email, registerForm.password);
      setSuccessMessage('Đăng ký tài khoản thành công! Đang chuyển sang màn hình đăng nhập...');

      // Tự động điền email vào form đăng nhập và chuyển tab sau 1.2s
      setLoginForm((prev) => ({ ...prev, email: registerForm.email }));
      setTimeout(() => {
        setActiveTab('login');
        setSuccessMessage('Vui lòng đăng nhập với thông tin vừa tạo.');
      }, 1200);
    } catch (err) {
      const status = err.response?.status;
      if (status === 409) {
        setErrorMessage(
          'Email này đã được sử dụng trong hệ thống. Vui lòng đăng nhập hoặc sử dụng email khác.'
        );
      } else {
        setErrorMessage(
          err.response?.data?.message || 'Đăng ký không thành công. Vui lòng thử lại.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2 bg-app-bg font-sans">

      {/* ======================================================== */}
      {/* LEFT PANEL: Flat Solid Tech Blue #2563EB (Desktop only) */}
      {/* ======================================================== */}
      <div className="hidden lg:flex flex-col justify-between p-12 xl:p-16 bg-primary text-white select-none lg:sticky lg:top-0 lg:h-screen overflow-hidden">

        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0">
            <img src={shieldIcon} alt="Auth Portal" className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white leading-none">
              Auth Portal
            </h2>
            <p className="text-xs font-medium text-blue-200 mt-1">
              Secure Access Gateway
            </p>
          </div>
        </div>

        {/* Center Main Body (Cố định vị trí từ trên xuống mt-10 lg:mt-14 mb-auto, triệt tiêu hiện tượng nhảy vị trí khi form đổi độ cao) */}
        <div className="mt-10 lg:mt-14 mb-auto max-w-lg space-y-6">
          {/* Security Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-700/60 border border-blue-400/30 text-xs font-semibold uppercase tracking-wider text-white">
            <img src={lockIcon} alt="" className="w-3.5 h-3.5 brightness-0 invert" />
            <span>HỆ THỐNG XÁC THỰC STATELESS JWT</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl xl:text-4xl font-bold tracking-tight leading-tight text-white">
            Xác thực an toàn, <br />
            quản lý rõ ràng.
          </h1>

          {/* Subtitle */}
          <p className="text-blue-100 text-sm xl:text-base leading-relaxed">
            Bảo vệ route với Stateless JWT và phân quyền RBAC chuẩn Enterprise. Kiểm soát phiên truy cập chặt chẽ với tốc độ xử lý tối ưu.
          </p>

          {/* Checklist */}
          <div className="space-y-3.5 pt-2">
            {[
              'Token tự hết hạn an toàn sau 1 ngày',
              'Mật khẩu được băm an toàn với Bcrypt Salt rounds',
              'Hệ thống phân quyền Role-Based (User / Admin)',
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/40 border border-blue-300/40 flex items-center justify-center shrink-0">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-white/95">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Left Footer */}
        <div className="text-xs text-blue-200 font-mono tracking-wide">
          JWT Authentication API · Project
        </div>

      </div>

      {/* ======================================================== */}
      {/* RIGHT PANEL: Slate-50 #F8FAFC with Authentication Card */}
      {/* ======================================================== */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12 min-h-screen">

        {/* Mobile-only Brand Header */}
        <div className="lg:hidden mb-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-xl bg-primary shadow-sm flex items-center justify-center mb-2">
            <img src={shieldIcon} alt="Auth Portal" className="w-6 h-6 brightness-0 invert" />
          </div>
          <h2 className="text-xl font-bold text-secondary">Auth Portal</h2>
          <p className="text-xs text-neutral">Secure Access Gateway</p>
        </div>

        {/* Authentication Card (Figma max-w-[440px]) */}
        <div className="w-full max-w-[440px] space-y-6">

          {/* Card Header Text */}
          <div>
            <h2 className="text-2xl font-bold text-secondary tracking-tight">
              {activeTab === 'login' ? 'Chào mừng trở lại' : 'Tạo tài khoản mới'}
            </h2>
            <p className="text-sm text-neutral mt-1">
              {activeTab === 'login'
                ? 'Đăng nhập để truy cập không gian làm việc bảo mật.'
                : 'Đăng ký tài khoản để truy cập hệ thống quản trị.'}
            </p>
          </div>

          {/* 50/50 Segmented Tab Switcher */}
          <div className="bg-slate-200/70 p-1 rounded-xl flex gap-1 select-none">
            <button
              type="button"
              onClick={() => handleTabChange('login')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${activeTab === 'login'
                  ? 'bg-white text-secondary font-semibold shadow-sm'
                  : 'text-slate-600 hover:text-secondary'
                }`}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('register')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${activeTab === 'register'
                  ? 'bg-white text-secondary font-semibold shadow-sm'
                  : 'text-slate-600 hover:text-secondary'
                }`}
            >
              Đăng ký
            </button>
          </div>

          {/* Main White Card Surface */}
          <div className="bg-white rounded-xl border border-card-border shadow-sm p-6 sm:p-7 space-y-5">

            {/* Error Callout */}
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3.5 flex items-start gap-3 text-xs text-red-600 font-medium">
                <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* Success Callout */}
            {successMessage && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3.5 flex items-start gap-3 text-xs text-emerald-700 font-medium">
                <svg className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="leading-relaxed">{successMessage}</span>
              </div>
            )}

            {/* FORM 1: ĐĂNG NHẬP (Sign In) */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4" noValidate>
                {/* Email Input */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    EMAIL CÔNG VIỆC
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <img src={emailIcon} alt="" className="w-4 h-4 opacity-50" />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={loginForm.email}
                      onChange={(e) =>
                        setLoginForm((prev) => ({ ...prev, email: e.target.value }))
                      }
                      className="block w-full pl-9 pr-3 py-2.5 rounded-lg border border-card-border text-sm text-secondary placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    MẬT KHẨU
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <img src={lockIcon} alt="" className="w-4 h-4 opacity-50" />
                    </div>
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={loginForm.password}
                      onChange={(e) =>
                        setLoginForm((prev) => ({ ...prev, password: e.target.value }))
                      }
                      className="block w-full pl-9 pr-10 py-2.5 rounded-lg border border-card-border text-sm text-secondary placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowLoginPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                      title={showLoginPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      <img
                        src={showLoginPassword ? eyeIcon : eyeOffIcon}
                        alt=""
                        className="w-4 h-4 opacity-70 hover:opacity-100 transition-opacity"
                      />
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox (STRICTLY NO FORGOT PASSWORD LINK) */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={loginForm.rememberMe}
                      onChange={(e) =>
                        setLoginForm((prev) => ({ ...prev, rememberMe: e.target.checked }))
                      }
                      className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/30"
                    />
                    <span className="text-xs text-slate-600">Ghi nhớ đăng nhập</span>
                  </label>
                </div>

                {/* CTA Button */}
                <Button
                  type="submit"
                  variant="primary"
                  loading={loading}
                  className="w-full py-2.5 mt-2"
                >
                  <span>Đăng nhập</span>
                  <span className="ml-1">→</span>
                </Button>

                {/* Switch to Register link */}
                <div className="text-center pt-2">
                  <span className="text-xs text-neutral">Chưa có tài khoản? </span>
                  <button
                    type="button"
                    onClick={() => handleTabChange('register')}
                    className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                  >
                    Đăng ký ngay
                  </button>
                </div>
              </form>
            )}

            {/* FORM 2: ĐĂNG KÝ (Sign Up) */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4" noValidate>
                {/* Full Name Input */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    HỌ VÀ TÊN
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <img src={userIcon} alt="" className="w-4 h-4 opacity-50" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Nguyễn Văn A"
                      value={registerForm.name}
                      onChange={(e) =>
                        setRegisterForm((prev) => ({ ...prev, name: e.target.value }))
                      }
                      className="block w-full pl-9 pr-3 py-2.5 rounded-lg border border-card-border text-sm text-secondary placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    EMAIL CÔNG VIỆC
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <img src={emailIcon} alt="" className="w-4 h-4 opacity-50" />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={registerForm.email}
                      onChange={(e) =>
                        setRegisterForm((prev) => ({ ...prev, email: e.target.value }))
                      }
                      className="block w-full pl-9 pr-3 py-2.5 rounded-lg border border-card-border text-sm text-secondary placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                {/* Password Input + 3 Strength Bars */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    MẬT KHẨU
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <img src={lockIcon} alt="" className="w-4 h-4 opacity-50" />
                    </div>
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={registerForm.password}
                      onChange={(e) =>
                        setRegisterForm((prev) => ({ ...prev, password: e.target.value }))
                      }
                      className="block w-full pl-9 pr-10 py-2.5 rounded-lg border border-card-border text-sm text-secondary placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowRegPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                      title={showRegPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      <img
                        src={showRegPassword ? eyeIcon : eyeOffIcon}
                        alt=""
                        className="w-4 h-4 opacity-70 hover:opacity-100 transition-opacity"
                      />
                    </button>
                  </div>

                  {/* 3-Segment Strength Bars (Figma standard) */}
                  <div className="pt-1 space-y-1">
                    <div className="flex items-center gap-1.5">
                      {passwordStrength.bars.map((barColor, idx) => (
                        <div
                          key={idx}
                          className={`h-1.5 flex-1 rounded-full transition-colors duration-200 ${barColor}`}
                        />
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-neutral">
                      <span>Tối thiểu 8 ký tự (chữ hoa, số &amp; ký tự đặc biệt)</span>
                      {passwordStrength.label !== 'Chưa nhập' && (
                        <span
                          className={`font-semibold ${passwordStrength.level === 'weak'
                              ? 'text-red-500'
                              : passwordStrength.level === 'medium'
                                ? 'text-amber-500'
                                : 'text-emerald-600'
                            }`}
                        >
                          {passwordStrength.label}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Confirm Password Input + Realtime Match Badge */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                      XÁC NHẬN MẬT KHẨU
                    </label>
                    {passwordMatch.checked && (
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full font-medium border ${passwordMatch.isMatch
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                          }`}
                      >
                        {passwordMatch.label}
                      </span>
                    )}
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <img src={lockIcon} alt="" className="w-4 h-4 opacity-50" />
                    </div>
                    <input
                      type={showRegConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={registerForm.confirmPassword}
                      onChange={(e) =>
                        setRegisterForm((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      className={`block w-full pl-9 pr-10 py-2.5 rounded-lg border text-sm text-secondary placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors ${passwordMatch.checked && !passwordMatch.isMatch
                          ? 'border-red-400 focus:ring-red-200 focus:border-red-500'
                          : 'border-card-border focus:ring-primary/20 focus:border-primary'
                        }`}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowRegConfirmPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                      title={showRegConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      <img
                        src={showRegConfirmPassword ? eyeIcon : eyeOffIcon}
                        alt=""
                        className="w-4 h-4 opacity-70 hover:opacity-100 transition-opacity"
                      />
                    </button>
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  type="submit"
                  variant="primary"
                  loading={loading}
                  className="w-full py-2.5 mt-2"
                >
                  <span>Tạo tài khoản</span>
                  <span className="ml-1">→</span>
                </Button>

                {/* Switch to Login link */}
                <div className="text-center pt-2">
                  <span className="text-xs text-neutral">Đã có tài khoản? </span>
                  <button
                    type="button"
                    onClick={() => handleTabChange('login')}
                    className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                  >
                    Đăng nhập ngay
                  </button>
                </div>
              </form>
            )}

          </div>

          {/* Security Footnote */}
          <p className="text-xs text-neutral text-center leading-relaxed">
            Được bảo mật theo tiêu chuẩn OWASP &amp; RFC 7519 (JSON Web Token)
          </p>

        </div>

      </div>

    </div>
  );
}

