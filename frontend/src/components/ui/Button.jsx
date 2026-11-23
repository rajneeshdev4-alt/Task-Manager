export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  ...props
}) {
  const variants = {
    primary: 'bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-400',
    secondary: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
    ghost: 'text-slate-600 hover:bg-slate-100',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 disabled:bg-rose-300',
  };
  const sizes = {
    sm: 'h-8 px-2.5 text-sm',
    md: 'h-10 px-3.5 text-sm',
    icon: 'h-8 w-8',
  };

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
