import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  getToken,
  setToken,
  removeToken,
  decodeJwt,
  isTokenExpired,
  TOKEN_KEY,
  hasSessionToken,
} from '../utils/token';
import { setTokenProvider } from '../services/api';
import {
  loginUser,
  registerUser,
  getCurrentUser,
  logoutUser,
} from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => {
    const stored = getToken();
    return stored && !isTokenExpired(stored) ? stored : null;
  });
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

    // 1. Kiểm tra tính toàn vẹn và hạn sử dụng của token phía client trước (Issue #15)
    if (isTokenExpired(currentToken)) {
      console.warn('Token trong bộ nhớ đã hết hạn hoặc định dạng không hợp lệ, tự động thu hồi phiên');
      removeToken();
      tokenRef.current = null;
      setTokenState(null);
      setUser(null);
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
        // Lỗi mạng hoặc máy chủ không phản hồi (/auth/me failed)
        console.warn('Không thể kết nối đến máy chủ để xác thực token:', err.message);

        // Chỉ cho phép khôi phục phiên offline nếu token thực sự CHƯA hết hạn (Issue #15)
        if (!isTokenExpired(currentToken)) {
          setTokenState(currentToken);
          const decoded = decodeJwt(currentToken);
          if (decoded?.id) {
            setUser((prev) => prev || {
              id: decoded.id,
              role: decoded.role || 'user',
              name: decoded.name || 'Người dùng (Ngoại tuyến)',
              email: decoded.email || 'offline@portal',
              isOffline: true, // Biểu diễn trạng thái phiên chưa được server xác thực chữ ký (Issue #15)
            });
          }
        } else {
          // Token đã hết hạn khi mất mạng -> xóa sạch phiên client, không khôi phục
          removeToken();
          tokenRef.current = null;
          setTokenState(null);
          setUser(null);
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

  // Hành động Đăng xuất (Stateless: xóa token client ngay lập tức, gửi thông báo server độc lập - Issue #14)
  const logout = async () => {
    // 1. Chụp lại snapshot token của phiên cũ trước khi xóa
    const tokenToRevoke = tokenRef.current || getToken();

    // 2. Kết thúc phiên phía client NGAY LẬP TỨC: xóa storage và reset state React
    // Người dùng được rời khỏi trang bảo vệ ngay mà không phải chờ server phản hồi
    removeToken();
    tokenRef.current = null;
    setTokenState(null);
    setUser(null);

    // 3. Gửi request thông báo thu hồi token lên server độc lập (có timeout, không ảnh hưởng client)
    if (tokenToRevoke) {
      try {
        await logoutUser(tokenToRevoke);
      } catch (err) {
        console.warn('Lỗi gọi API logout server-side:', err);
      }
    }
  };

  // Xóa sạch phiên đăng nhập tại client trực tiếp (Issue #13: dùng khi token server đã bị thu hồi như sau khi đổi mật khẩu)
  const clearSession = useCallback(() => {
    removeToken();
    tokenRef.current = null;
    setTokenState(null);
    setUser(null);
  }, []);

  // Làm mới thông tin người dùng (Issue #16: ném lỗi ra ngoài caller khi thất bại để UI phản hồi chính xác)
  const refreshUser = async () => {
    const activeToken = tokenRef.current || getToken();
    if (!activeToken) {
      throw new Error('Không tìm thấy token phiên làm việc');
    }
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
      throw err;
    }
  };

  const isAuth = Boolean(token && user && !isTokenExpired(token));

  const value = {
    user,
    token,
    isAuthenticated: isAuth,
    isOffline: Boolean(user?.isOffline),
    loading,
    login,
    register,
    logout,
    clearSession,
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

