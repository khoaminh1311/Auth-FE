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
  } catch (err) {
    return String(dateString);
  }
}

