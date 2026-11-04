import axios from 'axios';

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
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Hàm kiểm tra trạng thái hoạt động của Backend Server (/health)
export const checkHealth = async () => {
  const serverBaseUrl = API_URL.replace(/\/api\/?$/, '');
  const response = await axios.get(`${serverBaseUrl}/health`);
  return response.data;
};

export default apiClient;

