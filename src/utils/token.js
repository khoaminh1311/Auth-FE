export const TOKEN_KEY = 'auth_portal_token';

/**
 * Lấy JWT token từ bộ nhớ:
 * Ưu tiên phiên riêng biệt của tab (sessionStorage) trước phiên dùng chung (localStorage).
 */
export function getToken() {
  try {
    const sessionToken = sessionStorage.getItem(TOKEN_KEY);
    if (sessionToken) {
      return sessionToken;
    }
    return localStorage.getItem(TOKEN_KEY);
  } catch (err) {
    console.error('Không thể đọc token từ storage:', err);
    return null;
  }
}

/**
 * Kiểm tra xem tab hiện tại có đang sử dụng phiên riêng biệt trong sessionStorage hay không
 */
export function hasSessionToken() {
  try {
    return Boolean(sessionStorage.getItem(TOKEN_KEY));
  } catch {
    return false;
  }
}

/**
 * Lưu JWT token vào bộ nhớ phù hợp theo lựa chọn "Ghi nhớ đăng nhập"
 * @param {string|null} token 
 * @param {boolean} remember - true: lưu vào localStorage (dài hạn), false: lưu vào sessionStorage (theo phiên tab)
 */
export function setToken(token, remember = true) {
  try {
    if (token) {
      if (remember) {
        localStorage.setItem(TOKEN_KEY, token);
        sessionStorage.removeItem(TOKEN_KEY);
      } else {
        sessionStorage.setItem(TOKEN_KEY, token);
      }
    } else {
      removeToken();
    }
  } catch (err) {
    console.error('Không thể lưu token vào storage:', err);
  }
}

/**
 * Xóa sạch JWT token khỏi cả localStorage và sessionStorage
 */
export function removeToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  } catch (err) {
    console.error('Không thể xóa token khỏi storage:', err);
  }
}

/**
 * Giải mã JWT payload ở Client (Base64URL decode chuẩn RFC 7519 kèm xử lý padding tự động)
 */
export function decodeJwt(token) {
  if (!token || typeof token !== 'string') return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const base64Url = parts[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    // Bổ sung ký tự '=' để độ dài chia hết cho 4 theo chuẩn Base64 (BUG-MED-01)
    const pad = (4 - (base64.length % 4)) % 4;
    base64 += '='.repeat(pad);

    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error('Lỗi khi giải mã payload JWT:', err);
    return null;
  }
}

/**
 * Kiểm tra xem JWT token đã hết hạn hay chưa (hoặc định dạng có hợp lệ không) (Issue #15)
 * @param {string|null} token 
 * @returns {boolean} true nếu token không tồn tại, lỗi định dạng, thiếu exp hoặc đã quá hạn
 */
export function isTokenExpired(token) {
  if (!token || typeof token !== 'string') return true;
  const decoded = decodeJwt(token);
  // Token không decode được hoặc thiếu exp / id thì coi như không hợp lệ / đã hết hạn
  if (!decoded || !decoded.exp || !decoded.id) return true;
  // exp trong JWT chuẩn tính bằng giây, Date.now() tính bằng mili-giây
  return decoded.exp * 1000 <= Date.now();
}
