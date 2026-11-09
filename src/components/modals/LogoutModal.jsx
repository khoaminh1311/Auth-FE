import { useEffect, useRef } from 'react';
import logoutIcon from '../../assets/icons/logout.svg';

export default function LogoutModal({ isOpen, onClose, onConfirm, loading = false }) {
  const dialogRef = useRef(null);

  // Focus trap & Auto-focus khi mở modal (NEW-A11Y-01)
  useEffect(() => {
    if (!isOpen || !dialogRef.current) return;

    const focusableElements = dialogRef.current.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    firstElement?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, loading]);

  if (!isOpen) return null;

  return (
    <div
      id="logout-modal"
      ref={dialogRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={loading ? undefined : onClose}
      />

      {/* Dialog Surface (Figma standard: max-w-md, p-6, rounded-xl) */}
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl border border-card-border p-6 z-10 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Row */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
            <img src={logoutIcon} alt="" className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 id="logout-modal-title" className="text-lg font-bold text-secondary">
              Xác nhận đăng xuất
            </h3>
            <p className="text-xs text-neutral">
              Chấm dứt phiên làm việc bảo mật
            </p>
          </div>
        </div>

        {/* Warning Description */}
        <p className="text-sm text-slate-600 leading-relaxed">
          Bạn có chắc chắn muốn đăng xuất? Token xác thực JWT hiện tại sẽ bị xóa khỏi trình duyệt và bạn sẽ cần phải đăng nhập lại để tiếp tục sử dụng.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:opacity-50 cursor-pointer"
          >
            Hủy bỏ
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-0.5 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <img src={logoutIcon} alt="" className="w-4 h-4 brightness-0 invert" />
                <span>Đăng xuất</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

