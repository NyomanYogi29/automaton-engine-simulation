import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant = 'accepted' | 'rejected' | 'dead' | 'active' | 'neutral';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  accepted: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60 shadow-[0_0_8px_rgba(16,185,129,0.2)]',
  rejected: 'bg-rose-950/80 text-rose-300 border-rose-700/60 shadow-[0_0_8px_rgba(244,63,94,0.2)]',
  dead: 'bg-amber-950/80 text-amber-300 border-amber-700/60 shadow-[0_0_8px_rgba(245,158,11,0.2)]',
  active: 'bg-cyan-950/80 text-cyan-200 border-cyan-500/70 shadow-[0_0_10px_rgba(6,182,212,0.35)]',
  neutral: 'bg-slate-800 text-slate-300 border-slate-700',
};

export function Badge({ variant = 'neutral', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-medium border select-none',
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
