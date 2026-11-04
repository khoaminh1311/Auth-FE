/**
 * Kiểm tra và đánh giá độ mạnh của mật khẩu theo 4 tiêu chí bảo mật:
 * 1. Độ dài tối thiểu 8 ký tự
 * 2. Có ít nhất một chữ cái in hoa (A-Z)
 * 3. Có ít nhất một chữ số (0-9)
 * 4. Có ít nhất một ký tự đặc biệt (!@#$%^&*...)
 */
export function evaluatePassword(password = '') {
  if (!password) {
    return {
      score: 0,
      level: 'none',
      label: 'Chưa nhập',
      bars: ['bg-slate-200', 'bg-slate-200', 'bg-slate-200'],
      criteria: {
        minLength: false,
        hasUpper: false,
        hasNumber: false,
        hasSpecial: false,
      },
    };
  }

  const minLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const criteriaMet = [minLength, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

  if (criteriaMet <= 2) {
    // Yếu: 1 vạch đỏ (#EF4444), 2 vạch xám
    return {
      score: 1,
      level: 'weak',
      label: 'Yếu',
      bars: ['bg-red-500', 'bg-slate-200', 'bg-slate-200'],
      criteria: { minLength, hasUpper, hasNumber, hasSpecial },
    };
  } else if (criteriaMet === 3) {
    // Trung bình: 2 vạch vàng/hổ phách (#F59E0B), 1 vạch xám
    return {
      score: 2,
      level: 'medium',
      label: 'Trung bình',
      bars: ['bg-amber-500', 'bg-amber-500', 'bg-slate-200'],
      criteria: { minLength, hasUpper, hasNumber, hasSpecial },
    };
  } else {
    // Mạnh: 3 vạch xanh lá (#10B981)
    return {
      score: 3,
      level: 'strong',
      label: 'Mạnh',
      bars: ['bg-emerald-500', 'bg-emerald-500', 'bg-emerald-500'],
      criteria: { minLength, hasUpper, hasNumber, hasSpecial },
    };
  }
}

/**
 * Kiểm tra mật khẩu xác nhận có khớp với mật khẩu chính hay không
 */
export function checkPasswordMatch(password, confirmPassword) {
  if (!password || !confirmPassword) {
    return {
      checked: false,
      isMatch: false,
      label: '',
    };
  }

  const isMatch = password === confirmPassword;
  return {
    checked: true,
    isMatch,
    label: isMatch ? 'Mật khẩu trùng khớp' : 'Mật khẩu không khớp',
  };
}

