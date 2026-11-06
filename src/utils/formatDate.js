/**
 * Định dạng ngày giờ chuẩn Việt Nam (vi-VN)
 * Ví dụ: 24/10/2026, 14:30 hoặc 24 tháng 10, 2026
 */
export function formatDate(dateString) {
  if (!dateString) return 'Chưa cập nhật';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Ngày không hợp lệ';

    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(date);
  } catch (err) {
    console.error('Lỗi định dạng ngày:', err);
    return String(dateString);
  }
}

/**
 * Định dạng ngày ngắn gọn (DD/MM/YYYY)
 */
export function formatShortDate(dateString) {
  if (!dateString) return 'Chưa cập nhật';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Ngày không hợp lệ';

    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  } catch {
    return String(dateString);
  }
}

/**
 * Trích xuất ngày tạo tài khoản từ MongoDB ObjectId
 * (4 byte đầu tiên của ObjectId là Unix timestamp tính bằng giây của thời điểm tạo document)
 */
export function getDateFromObjectId(id) {
  if (!id || typeof id !== 'string') return null;
  // MongoDB ObjectId gồm đúng 24 ký tự hex
  if (id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)) {
    try {
      const timestamp = parseInt(id.substring(0, 8), 16) * 1000;
      const date = new Date(timestamp);
      if (!isNaN(date.getTime())) {
        return date;
      }
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Lấy ngày tham gia chính xác của người dùng:
 * 1. Ưu tiên user.createdAt (nếu backend trả về)
 * 2. Trích xuất thời điểm tạo thật từ MongoDB ObjectId (user.id / user._id)
 * 3. Fallback theo JWT iat timestamp
 * 4. Fallback ngày mẫu Figma (12/01/2024)
 */
export function getUserJoinDate(user, jwtClaims) {
  if (user?.createdAt) {
    const formatted = formatShortDate(user.createdAt);
    if (formatted !== 'Chưa cập nhật' && formatted !== 'Ngày không hợp lệ') {
      return formatted;
    }
  }

  const id = user?.id || user?._id;
  const dateFromId = getDateFromObjectId(id);
  if (dateFromId) {
    return formatShortDate(dateFromId);
  }

  if (jwtClaims?.iat) {
    return formatShortDate(new Date(jwtClaims.iat * 1000));
  }

  return '12/01/2024';
}
