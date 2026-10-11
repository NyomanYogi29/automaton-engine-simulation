import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export function Card({ className, header, footer, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl bg-slate-900/90 border border-slate-800 backdrop-blur-sm text-slate-200 overflow-hidden shadow-lg',
        className,
      )}
      {...props}
    >
      {header && (
        <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/40 font-medium text-sm text-slate-300">
          {header}
        </div>
      )}
      <div className="p-4">{children}</div>
      {footer && (
        <div className="px-4 py-3 border-t border-slate-800 bg-slate-950/40 text-xs text-slate-400">
          {footer}
        </div>
      )}
    </div>
  );
}
