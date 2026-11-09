import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getToken, setToken, removeToken, decodeJwt, TOKEN_KEY, hasSessionToken } from '../utils/token';
import { setTokenProvider } from '../services/api';
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

  // Giữ ref đồng bộ để Axios interceptor luôn đọc được token mới nhất của tab hiện tại
  const tokenRef = useRef(token);
  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  // Đăng ký provider cung cấp token cho Axios client
  useEffect(() => {
    setTokenProvider(() => tokenRef.current || getToken());
  }, []);

  // Khởi tạo: kiểm tra token hiện có và tải thông tin người dùng (/api/auth/me)
  const initializeAuth = useCallback(async () => {
    const currentToken = getToken();
    if (!currentToken) {
      setUser(null);
      setTokenState(null);
      setLoading(false);
      return;
    }

    try {
      tokenRef.current = currentToken;
      setTokenState(currentToken);
      const data = await getCurrentUser();
      setUser(data.user);
    } catch (err) {
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        console.warn('Token không hợp lệ hoặc đã hết hạn, tự động thu hồi phiên:', err);
        removeToken();
        tokenRef.current = null;
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

  // Đồng bộ trạng thái đa tab qua Storage Event (Issue #11)
  useEffect(() => {
    const handleStorageChange = (e) => {
      // Chỉ xử lý các thay đổi liên quan đến auth_portal_token từ các tab khác
      if (e.key !== TOKEN_KEY) return;

      // Nếu tab hiện tại đang dùng phiên riêng biệt (sessionStorage), bỏ qua thay đổi của localStorage
      if (hasSessionToken()) return;

      if (!e.newValue) {
        // Tab khác dùng chung localStorage đã đăng xuất -> đồng bộ đăng xuất ở tab này
        tokenRef.current = null;
        setTokenState(null);
        setUser(null);
      } else if (e.newValue !== tokenRef.current) {
        // Tab khác dùng chung localStorage đã đăng nhập tài khoản khác -> đồng bộ sang phiên mới
        tokenRef.current = e.newValue;
        setTokenState(e.newValue);
        initializeAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [initializeAuth]);

  // Hành động Đăng nhập (hỗ trợ rememberMe: true -> localStorage, false -> sessionStorage)
  const login = async (email, password, rememberMe = true) => {
    const data = await loginUser({ email, password });
    if (data.token) {
      setToken(data.token, rememberMe);
      tokenRef.current = data.token;
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
      tokenRef.current = null;
      setTokenState(null);
      setUser(null);
    }
  };

  // Làm mới thông tin người dùng
  const refreshUser = async () => {
    const activeToken = tokenRef.current || getToken();
    if (!activeToken) return null;
    try {
      tokenRef.current = activeToken;
      setTokenState(activeToken);
      const data = await getCurrentUser();
      setUser(data.user);
      return data.user;
    } catch (err) {
      console.error('Không thể làm mới profile:', err);
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        removeToken();
        tokenRef.current = null;
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

