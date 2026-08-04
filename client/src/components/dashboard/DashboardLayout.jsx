import React from 'react';
import { Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  Ticket,
  Bookmark,
  Settings,
  ShieldCheck,
  Users,
  ClipboardCheck,
} from 'lucide-react';
import { Sidebar } from './Sidebar';

const NAV_CONFIG = {
  attendee: {
    title: 'My Nexus',
    subtitle: 'Tickets & saved events',
    items: [
      { to: '/dashboard', label: 'My Tickets', icon: Ticket, end: true },
      { to: '/dashboard/saved', label: 'Saved Events', icon: Bookmark },
      { to: '/dashboard/settings', label: 'Profile Settings', icon: Settings },
    ],
  },
  organizer: {
    title: 'Organizer Studio',
    subtitle: 'Manage your events',
    items: [
      { to: '/organizer', label: 'Overview', icon: LayoutDashboard, end: true },
      { to: '/organizer/events', label: 'My Events', icon: CalendarDays },
    ],
  },
  admin: {
    title: 'Admin Console',
    subtitle: 'Platform oversight',
    items: [
      { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
      { to: '/admin/moderation', label: 'Moderation', icon: ClipboardCheck },
      { to: '/admin/users', label: 'Users', icon: Users },
    ],
  },
};

export default function DashboardLayout({ section }) {
  const config = NAV_CONFIG[section] || NAV_CONFIG.attendee;

  return (
    <div className="min-h-screen bg-luma-bg text-luma-text-primary font-sans relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] left-[10%] w-[380px] h-[380px] rounded-full bg-luma-blue/10 blur-[130px] animate-float-1" />
        <div className="absolute bottom-[15%] right-[10%] w-[420px] h-[420px] rounded-full bg-luma-indigo/10 blur-[130px] animate-float-2" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        {section === 'admin' && (
          <div className="mb-6 flex items-center gap-2 text-luma-red text-xs font-semibold uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4" />
            <span>Administrator Access</span>
          </div>
        )}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <Sidebar title={config.title} subtitle={config.subtitle} navItems={config.items} />
          <main className="flex-1 min-w-0 w-full">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
