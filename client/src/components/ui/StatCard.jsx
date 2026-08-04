import * as React from 'react';
import { cn } from '../../lib/utils';

export function StatCard({ label, value, icon: Icon, accent = 'blue', hint, className }) {
  const accentClasses = {
    blue: 'text-luma-blue bg-luma-blue/10 border-luma-blue/20',
    yellow: 'text-luma-yellow bg-luma-green-bg/25 border-luma-green/20',
    red: 'text-luma-red bg-luma-red/10 border-luma-red/20',
    gray: 'text-luma-text-light-gray bg-white/[0.04] border-white/[0.08]',
  };

  return (
    <div
      className={cn(
        'rounded-[20px] border border-white/[0.08] bg-[#121315]/45 p-5 flex items-center gap-4 backdrop-blur-sm',
        className
      )}
    >
      {Icon && (
        <div className={cn('h-11 w-11 shrink-0 rounded-2xl flex items-center justify-center border', accentClasses[accent])}>
          <Icon className="w-5 h-5" />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-luma-text-dimmed">{label}</p>
        <p className="text-2xl font-extrabold text-white tracking-tight mt-0.5 truncate">{value}</p>
        {hint && <p className="text-[11px] text-luma-text-muted mt-0.5">{hint}</p>}
      </div>
    </div>
  );
}
