import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap active:scale-[0.98] select-none';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5 font-semibold',
  };

  const variantStyles = {
    primary: 'bg-[#2563EB] hover:bg-blue-700 text-white shadow-xs focus:ring-[#2563EB] border border-blue-600/30 font-medium',
    secondary: 'bg-[#F8FAFC] hover:bg-slate-100 text-[#0F172A] focus:ring-slate-400 border border-[#E2E8F0] font-medium',
    outline: 'border border-[#E2E8F0] hover:border-slate-300 bg-white hover:bg-[#F8FAFC] text-[#0F172A] focus:ring-[#2563EB] shadow-xs font-medium',
    ghost: 'hover:bg-slate-100/80 text-[#64748B] hover:text-[#0F172A] focus:ring-slate-300',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs focus:ring-rose-500 font-medium',
    success: 'bg-[#059669] hover:bg-emerald-700 text-white shadow-xs focus:ring-[#059669] font-medium',
    dark: 'bg-[#0B172A] hover:bg-slate-800 text-white shadow-xs focus:ring-slate-700 border border-[#E2E8F0]/10 font-medium',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-current" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
