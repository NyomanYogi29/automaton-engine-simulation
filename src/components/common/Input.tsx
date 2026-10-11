import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function Input({ className, error, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'w-full h-10 px-3 rounded-lg bg-slate-900 border text-slate-100 placeholder:text-slate-500 font-mono text-sm',
        'transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950',
        error
          ? 'border-rose-600 focus:ring-rose-500'
          : 'border-slate-700 hover:border-slate-600 focus:border-cyan-500 focus:ring-cyan-500/50',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        className,
      )}
      {...props}
    />
  );
}
