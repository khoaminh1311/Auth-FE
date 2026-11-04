import menuIcon from '../../assets/icons/menu.svg';
import userIcon from '../../assets/icons/user.svg';

export default function Topbar({
  title = 'Tổng quan tài khoản',
  subtitle = 'CỔNG XÁC THỰC BẢO MẬT',
  user = { name: 'Flamingo', role: 'user' },
  onOpenMobileMenu,
}) {
  const isAdmin = user?.role === 'admin';
  const roleLabel = isAdmin ? 'VAI TRÒ: QUẢN TRỊ VIÊN' : 'VAI TRÒ: THÀNH VIÊN';

  return (
    <header className="h-16 fixed top-0 right-0 left-0 lg:left-[260px] z-30 bg-white/90 backdrop-blur-md border-b border-card-border px-4 sm:px-8 flex items-center justify-between transition-[left] duration-200">
      
      {/* Left Block: Hamburger button (mobile) + Titles */}
      <div className="flex items-center min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 -ml-2 mr-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Mở menu danh mục"
        >
          <img src={menuIcon} alt="" className="w-5 h-5" />
        </button>

        <div className="flex flex-col justify-center min-w-0">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral leading-none mb-1 truncate">
            {subtitle}
          </span>
          <h1 className="text-lg sm:text-xl font-bold text-secondary tracking-tight leading-tight truncate">
            {title}
          </h1>
        </div>
      </div>

      {/* Right Block: Role Pill Badge + User Mini Capsule */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        {/* Role Pill Badge (Figma Standard: #EFF6FF bg, #BFDBFE border, #2563EB text + dot) */}
        <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-tertiary text-primary border border-blue-200">
          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 animate-pulse" />
          <span>{roleLabel}</span>
        </div>

        {/* Divider */}
        <div className="h-6 w-[1px] bg-card-border" />

        {/* User Capsule */}
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-semibold text-slate-800 hidden md:inline truncate max-w-[120px]">
            {user?.name || 'Người dùng'}
          </span>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shrink-0 shadow-sm">
            <img src={userIcon} alt="" className="w-3.5 h-3.5 brightness-0 invert" />
          </div>
        </div>
      </div>

    </header>
  );
}

