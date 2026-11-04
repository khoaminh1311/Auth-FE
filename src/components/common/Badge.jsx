export default function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  dotColor = 'bg-primary',
  className = '',
}) {
  const baseStyles = 'inline-flex items-center font-medium rounded-full';

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  };

  const variantStyles = {
    primary: 'bg-tertiary text-primary border border-blue-200',
    secondary: 'bg-slate-100 text-slate-800 border border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    danger: 'bg-red-50 text-red-700 border border-red-200',
    neutral: 'bg-slate-100 text-slate-700 border border-card-border',

    // HTTP Methods (Mono font, rounded-md)
    'method-get':
      'bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] font-mono font-bold rounded-md px-2.5 py-0.5 text-xs',
    'method-post':
      'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] font-mono font-bold rounded-md px-2.5 py-0.5 text-xs',
    'method-put':
      'bg-[#FEF3C7] text-[#D97706] border border-[#FCD34D] font-mono font-bold rounded-md px-2.5 py-0.5 text-xs',

    // Topbar Role Pill
    'role-pill':
      'bg-tertiary text-primary border border-[#BFDBFE] font-semibold tracking-wide text-xs px-3 py-1 rounded-full uppercase',
  };

  const isMethodVariant = variant.startsWith('method-');

  return (
    <span
      className={`${baseStyles} ${
        isMethodVariant ? '' : sizeStyles[size] || sizeStyles.md
      } ${variantStyles[variant] || variantStyles.neutral} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

