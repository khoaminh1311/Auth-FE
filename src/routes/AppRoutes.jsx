import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthPage from '../pages/AuthPage';
import UserDashboardPage from '../pages/UserDashboardPage';
import ChangePasswordPage from '../pages/ChangePasswordPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import ProtectedRoute from './ProtectedRoute';

export default function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  // Hiển thị màn hình chờ xác thực phiên ban đầu, ngăn chặn flash redirect trên route wildcard (BUG-MED-03)
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-blue-200 border-t-[#2563EB] rounded-full animate-spin mb-3" />
        <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider animate-pulse">
          Đang xác thực phiên làm việc...
        </span>
      </div>
    );
  }

  return (
    <Routes>
      {/* Route Đăng nhập / Đăng ký (Public) */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <AuthPage />
          )
        }
      />

      {/* Route Dashboard Tài khoản (Protected) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <UserDashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Route Đổi mật khẩu (Protected - Screen 3) */}
      <Route
        path="/change-password"
        element={
          <ProtectedRoute>
            <ChangePasswordPage />
          </ProtectedRoute>
        }
      />

      {/* Route Quản trị hệ thống (Protected - Screen 4) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Mặc định điều hướng về /dashboard hoặc /login */}
      <Route
        path="*"
        element={
          <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />
        }
      />
    </Routes>
  );
}

