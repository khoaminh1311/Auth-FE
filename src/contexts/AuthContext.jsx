import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getToken, setToken, removeToken, decodeJwt } from '../utils/token';
import {
  loginUser,
  registerUser,
  getCurrentUser,
  logoutUser,
} from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => getToken());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Khởi tạo: kiểm tra token hiện có và tải thông tin người dùng (/api/auth/me)
  const initializeAuth = useCallback(async () => {
    const currentToken = getToken();
    if (!currentToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const data = await getCurrentUser();
      setUser(data.user);
      setTokenState(currentToken);
    } catch (err) {
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        console.warn('Token không hợp lệ hoặc đã hết hạn, tự động thu hồi phiên:', err);
        removeToken();
        setTokenState(null);
        setUser(null);
      } else {
        // Lỗi mạng hoặc máy chủ không phản hồi: bảo toàn token, không xóa phiên
        console.warn('Không thể kết nối đến máy chủ để xác thực token:', err.message);
        setTokenState(currentToken);
        const decoded = decodeJwt(currentToken);
        if (decoded?.id) {
          setUser((prev) => prev || { id: decoded.id, role: 'user' });
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Hành động Đăng nhập (hỗ trợ rememberMe: true -> localStorage, false -> sessionStorage)
  const login = async (email, password, rememberMe = true) => {
    const data = await loginUser({ email, password });
    if (data.token) {
      setToken(data.token, rememberMe);
      setTokenState(data.token);
      setUser(data.user);
    }
    return data;
  };

  // Hành động Đăng ký
  const register = async (name, email, password) => {
    const data = await registerUser({ name, email, password });
    return data;
  };

  // Hành động Đăng xuất (Stateless: xóa token client)
  const logout = async () => {
    try {
      await logoutUser();
    } finally {
      removeToken();
      setTokenState(null);
      setUser(null);
    }
  };

  // Làm mới thông tin người dùng
  const refreshUser = async () => {
    if (!getToken()) return null;
    try {
      const data = await getCurrentUser();
      setUser(data.user);
      return data.user;
    } catch (err) {
      console.error('Không thể làm mới profile:', err);
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        removeToken();
        setTokenState(null);
        setUser(null);
      }
      return null;
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    loading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider');
  }
  return context;
}

