import { NavLink } from 'react-router-dom';
import shieldIcon from '../../assets/icons/shield.svg';
import shieldInactiveIcon from '../../assets/icons/shield-inactive.svg';
import shieldActiveIcon from '../../assets/icons/shield-active.svg';
import dashboardIcon from '../../assets/icons/dashboard.svg';
import dashboardActiveIcon from '../../assets/icons/dashboard-active.svg';
import adminIcon from '../../assets/icons/admin.svg';
import logoutIcon from '../../assets/icons/logout.svg';

export default function Sidebar({
  user = { name: 'Flamingo', email: 'flamingo@authportal.io', role: 'user' },
  onOpenLogout,
  onItemClick,
}) {
  const isAdmin = user?.role === 'admin';

  const navItems = [
    {
      to: '/dashboard',
      label: 'Tổng quan',
      icon: dashboardIcon,
      activeIcon: dashboardActiveIcon,
    },
    {
      to: '/change-password',
      label: 'Đổi mật khẩu',
      icon: shieldInactiveIcon,
      activeIcon: shieldActiveIcon,
    },
    ...(isAdmin
      ? [
          {
            to: '/admin',
            label: 'Quản trị hệ thống',
            icon: adminIcon,
            activeIcon: adminIcon,
          },
        ]
      : []),
  ];

  return (
    <aside className="w-[260px] h-full bg-white border-r border-card-border flex flex-col justify-between shrink-0 select-none">
      {/* Top Part: Brand + Nav Items */}
      <div>
        {/* Brand Header: 64px height */}
        <div className="h-16 px-6 border-b border-card-border flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary shadow-sm flex items-center justify-center shrink-0">
            <img src={shieldIcon} alt="Auth Portal" className="w-5 h-5 brightness-0 invert" />
          </div>
          <span className="font-bold text-base text-secondary tracking-tight">
            Auth Portal
          </span>
        </div>

        {/* Navigation Section */}
        <div className="p-4 space-y-1">
          <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            DANH MỤC LÀM VIỆC
          </p>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onItemClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-tertiary text-primary font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-secondary font-medium'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <img
                      src={isActive ? item.activeIcon : item.icon}
                      alt=""
                      className="w-4 h-4 shrink-0"
                    />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Bottom Part: User Capsule + Logout Button */}
      {/* Cố định gap 12px (space-y-3) theo chuẩn Figma Docs DESIGN.md:L105 */}
      <div className="p-4 border-t border-card-border space-y-3">
        {/* User Profile Capsule */}
        <div className="p-2.5 rounded-lg bg-slate-50 border border-card-border flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-800 truncate">
              {user?.name || 'Người dùng'}
            </p>
            <p className="text-xs text-neutral truncate">
              {user?.email || 'user@authportal.io'}
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={onOpenLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium transition-colors cursor-pointer"
        >
          <img src={logoutIcon} alt="" className="w-3.5 h-3.5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
