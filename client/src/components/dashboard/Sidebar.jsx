import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';

export function Sidebar({ title, subtitle, navItems }) {
  return (
    <aside className="lg:w-64 shrink-0 lg:sticky lg:top-[88px] lg:h-[calc(100vh-104px)]">
      <div className="mb-5 px-1">
        <h2 className="text-lg font-extrabold text-white tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-luma-text-muted mt-0.5">{subtitle}</p>}
      </div>
      <nav className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-none">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all border',
                isActive
                  ? 'bg-white/[0.08] text-white border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.3)]'
                  : 'text-luma-text-muted hover:text-white hover:bg-white/[0.03] border-transparent'
              )
            }
          >
            {item.icon && <item.icon className="w-4 h-4 shrink-0" />}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
