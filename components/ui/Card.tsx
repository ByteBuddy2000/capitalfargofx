import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'flat' | 'elevated' | 'glass' | 'dark';
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  noPadding = false,
  className = '',
  ...props
}) => {
  const variantStyles = {
    default: 'bg-white border border-[#E2E8F0] shadow-xs rounded-2xl',
    flat: 'bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl',
    elevated: 'bg-white border border-[#E2E8F0] shadow-md shadow-slate-900/5 rounded-2xl',
    glass: 'bg-white/80 backdrop-blur-md border border-white/40 shadow-xs rounded-2xl',
    dark: 'bg-[#0B172A] border border-[#E2E8F0]/10 text-white rounded-2xl shadow-md',
  };

  return (
    <div
      className={`${variantStyles[variant]} ${noPadding ? '' : 'p-6'} transition-all ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
