import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-app-bg flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-blue-200 border-t-primary rounded-full animate-spin mb-3" />
        <span className="text-xs font-semibold text-neutral uppercase tracking-wider animate-pulse">
          Đang xác thực phiên làm việc...
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    const search = location.search || '';
    return <Navigate to={`/login${search}`} state={{ from: location }} replace />;
  }

  if (requiredRole === 'admin' && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

