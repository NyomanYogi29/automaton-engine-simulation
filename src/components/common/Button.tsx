import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  isLoading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400 active:bg-cyan-600 focus-visible:ring-cyan-400 border border-cyan-400/30 shadow-[0_0_12px_rgba(6,182,212,0.35)]',
  secondary:
    'bg-slate-800 text-slate-200 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 focus-visible:ring-slate-400',
  outline:
    'bg-transparent text-slate-200 hover:bg-slate-800/80 border border-slate-700 active:bg-slate-800 focus-visible:ring-slate-400',
  ghost:
    'bg-transparent text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 active:bg-slate-800 focus-visible:ring-slate-400',
  danger:
    'bg-rose-950/60 text-rose-300 hover:bg-rose-900/80 active:bg-rose-950 border border-rose-800/60 focus-visible:ring-rose-400',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-2.5 text-xs rounded-md gap-1.5',
  md: 'h-10 px-3.5 text-sm rounded-lg gap-2',
  lg: 'h-11 px-5 text-base rounded-lg gap-2.5',
};

export function Button({
  variant = 'secondary',
  size = 'md',
  icon,
  isLoading,
  disabled,
  children,
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-colors select-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
        'disabled:pointer-events-none disabled:opacity-45',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : (
        icon
      )}
      {children}
    </button>
  );
}
