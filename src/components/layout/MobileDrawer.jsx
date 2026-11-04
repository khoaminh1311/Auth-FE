import { useEffect } from 'react';
import closeIcon from '../../assets/icons/close.svg';
import Sidebar from './Sidebar';

export default function MobileDrawer({
  isOpen,
  onClose,
  user,
  onOpenLogout,
}) {
  // Chặn scroll body khi drawer đang mở
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Phím Escape để đóng drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <div className="lg:hidden">
      {/* Backdrop mờ #sidebar-backdrop */}
      <div
        id="sidebar-backdrop"
        onClick={onClose}
        className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* Drawer trượt từ cạnh trái */}
      <div
        className={`fixed inset-y-0 left-0 w-[260px] bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Nút đóng nhanh Drawer ở góc trên */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 z-10 cursor-pointer"
          aria-label="Đóng menu"
        >
          <img src={closeIcon} alt="" className="w-5 h-5" />
        </button>

        {/* Nội dung Sidebar chuẩn */}
        <Sidebar
          user={user}
          onOpenLogout={() => {
            onClose();
            onOpenLogout();
          }}
          onItemClick={onClose}
        />
      </div>
    </div>
  );
}

