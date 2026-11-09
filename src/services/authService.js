import apiClient from './api';

/**
 * 1. Đăng ký tài khoản người dùng mới
 * Endpoint: POST /api/auth/register
 */
export async function registerUser({ name, email, password }) {
  const response = await apiClient.post('/auth/register', {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
  });
  return response.data;
}

/**
 * 2. Đăng nhập và nhận JWT
 * Endpoint: POST /api/auth/login
 */
export async function loginUser({ email, password }) {
  const response = await apiClient.post('/auth/login', {
    email: email.trim().toLowerCase(),
    password,
  });
  return response.data;
}

/**
 * 3. Lấy thông tin tài khoản hiện tại
 * Endpoint: GET /api/auth/me
 */
export async function getCurrentUser() {
  const response = await apiClient.get('/auth/me');
  return response.data;
}

/**
 * 4. Đổi mật khẩu
 * Endpoint: PUT /api/auth/change-password
 */
export async function changePassword({ currentPassword, newPassword }) {
  const response = await apiClient.put('/auth/change-password', {
    currentPassword,
    newPassword,
  });
  return response.data;
}

/**
 * 5. Đăng xuất
 * Endpoint: POST /api/auth/logout
 * Chụp lại token cũ để gửi lên server với timeout riêng 5s, không phụ thuộc vào trạng thái client (Issue #14)
 */
export async function logoutUser(oldToken) {
  try {
    const config = {
      timeout: 5000, // Timeout giới hạn 5s cho request logout
    };
    if (oldToken) {
      config.headers = {
        Authorization: `Bearer ${oldToken}`,
      };
    }
    const response = await apiClient.post('/auth/logout', null, config);
    return response.data;
  } catch (err) {
    // Vẫn cho phép hoàn tất logout ở client ngay cả khi mạng lỗi hoặc server timeout
    console.warn('Lỗi gọi API logout (server side):', err?.message || err);
    return { success: true };
  }
}

