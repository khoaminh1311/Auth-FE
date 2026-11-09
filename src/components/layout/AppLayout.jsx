import { useState } from 'react';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import MobileDrawer from './MobileDrawer';
import LogoutModal from '../modals/LogoutModal';

export default function AppLayout({
  children,
  title = 'Tổng quan tài khoản',
  subtitle = 'CỔNG XÁC THỰC BẢO MẬT',
  user = { name: 'Người dùng', email: '—', role: 'user' },
  onLogoutConfirm = () => {},
  loadingLogout = false,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const handleLogout = async () => {
    await onLogoutConfirm();
    setLogoutModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-app-bg text-secondary flex flex-col font-sans">
      
      {/* Desktop Fixed Sidebar */}
      <div className="hidden lg:flex fixed inset-y-0 left-0 w-[260px] z-20">
        <Sidebar
          user={user}
          onOpenLogout={() => setLogoutModalOpen(true)}
        />
      </div>

      {/* Mobile Drawer (Backdrop + Slide-over) */}
      <MobileDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        user={user}
        onOpenLogout={() => setLogoutModalOpen(true)}
      />

      {/* Topbar Header */}
      <Topbar
        title={title}
        subtitle={subtitle}
        user={user}
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
      />

      {/* Main Content Workspace Container (Figma spec: pt-24 pb-12 px-4 sm:px-8 max-w-7xl mx-auto) */}
      <main className="lg:pl-[260px] flex-1 flex flex-col">
        <div className="pt-24 pb-12 px-4 sm:px-8 max-w-7xl w-full mx-auto flex-1">
          {children}
        </div>
      </main>

      {/* Standard Logout Confirmation Dialog (#logout-modal) */}
      <LogoutModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleLogout}
        loading={loadingLogout}
      />

    </div>
  );
}

