import axios from 'axios';
import { getToken, removeToken } from '../utils/token';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/$/, '');

// Quản lý getter cung cấp token hiện hành từ React context (đảm bảo request luôn đồng bộ với tab context)
let activeTokenGetter = null;

export function setTokenProvider(getter) {
  activeTokenGetter = getter;
}

// Khởi tạo instance Axios dùng chung
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Tự động đính kèm Bearer token từ provider của context hoặc storage
apiClient.interceptors.request.use(
  (config) => {
    const token = (typeof activeTokenGetter === 'function' ? activeTokenGetter() : null) || getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: xử lý 401 Unauthorized tự động nếu token hết hạn / phiên bị thu hồi
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      const responseMessage = (error.response?.data?.message || '').toLowerCase();

      // 1. Không can thiệp nếu là thao tác đăng nhập/đăng ký sai thông tin
      const isAuthAttempt = url.includes('/auth/login') || url.includes('/auth/register');

      // 2. Không can thiệp nếu là thao tác đổi mật khẩu nhưng nhập sai mật khẩu hiện tại (Issue #12)
      // Phân biệt lỗi nghiệp vụ kiểm tra mật khẩu cũ với lỗi JWT hết hạn/không hợp lệ
      const isWrongCurrentPassword =
        url.includes('/auth/change-password') &&
        (responseMessage.includes('mật khẩu hiện tại') || responseMessage.includes('current password'));

      // 3. Không chuyển hướng cứng nếu là thao tác đăng xuất (Issue #13)
      // Khi logout bị 401 (token server đã hết hạn/bị thu hồi trước đó), chỉ xóa token client mà không ghi đè URL
      const isLogoutAttempt = url.includes('/auth/logout');

      if (isLogoutAttempt) {
        removeToken();
        return Promise.reject(error);
      }

      if (!isAuthAttempt && !isWrongCurrentPassword) {
        removeToken();
        if (!window.location.pathname.includes('/login')) {
          const basePath = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
          window.location.href = `${basePath}/login?expired=true`;
        }
      }
    }
    return Promise.reject(error);
  }
);

// Hàm kiểm tra trạng thái hoạt động của Backend Server (/health)
export const checkHealth = async () => {
  const serverBaseUrl = API_URL.replace(/\/api\/?$/, '');
  const response = await axios.get(`${serverBaseUrl}/health`);
  return response.data;
};

export default apiClient;
