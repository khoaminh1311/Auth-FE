import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthPage from '../pages/AuthPage';
import UserDashboardPage from '../pages/UserDashboardPage';
import ChangePasswordPage from '../pages/ChangePasswordPage';
import ProtectedRoute from './ProtectedRoute';

export default function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  return (
    <Routes>
      {/* Route Đăng nhập / Đăng ký (Public) */}
      <Route
        path="/login"
        element={
          !loading && isAuthenticated ? (
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

      {/* Placeholder Route Quản trị hệ thống (Phase 5) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <UserDashboardPage />
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

