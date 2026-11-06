import axios from 'axios';
import { getToken, removeToken } from '../utils/token';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Khởi tạo instance Axios dùng chung
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Tự động đính kèm Bearer token từ localStorage (nếu có)
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
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
      // Không can thiệp chuyển hướng nếu là thao tác đăng nhập/đăng ký sai thông tin
      const isAuthAttempt = url.includes('/auth/login') || url.includes('/auth/register');

      if (!isAuthAttempt) {
        removeToken();
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login?expired=true';
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
