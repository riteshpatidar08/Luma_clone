import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Calendar, Ticket, ShieldAlert } from 'lucide-react';
import { NotificationsAPI } from '../lib/queries';
import { cn } from '../lib/utils';

const ICONS = {
  event_approved: Calendar,
  event_rejected: Calendar,
  new_rsvp: Ticket,
  rsvp_approved: Ticket,
  ticket_confirmed: Ticket,
  event_pending_review: ShieldAlert,
  ticket_refunded: Ticket,
};

const timeAgo = (date) => {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

export function NotificationsDropdown({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    try {
      const res = await NotificationsAPI.list();
      setNotifications(res.data.data);
      setUnreadCount(res.data.unreadCount);
    } catch (error) {
      // silent -- notifications are non-critical
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  const handleClick = async (notification) => {
    if (!notification.read) {
      try {
        await NotificationsAPI.markRead(notification._id);
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch (error) {
        // ignore
      }
    }
    onClose();
    if (notification.link) navigate(notification.link);
  };

  const handleMarkAllRead = async () => {
    setLoading(true);
    try {
      await NotificationsAPI.markAllRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        className="p-2 text-luma-text-primary/60 hover:text-luma-text-primary hover:bg-white/[0.04] rounded-lg transition-colors cursor-pointer relative"
        aria-label="Notifications"
      >
        <Bell className="w-4.5 h-4.5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-luma-red rounded-full ring-2 ring-luma-bg text-[9px] font-bold text-white flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-h-[420px] overflow-y-auto bg-[#121315]/95 border border-white/[0.08] rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-md p-2 z-50 animate-fade-in">
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.05] mb-1">
            <p className="text-xs font-bold text-white">Notifications</p>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={loading}
                className="flex items-center gap-1 text-[10px] font-semibold text-luma-blue hover:text-luma-yellow transition-colors cursor-pointer disabled:opacity-50"
              >
                <CheckCheck className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="py-10 text-center">
              <Bell className="w-6 h-6 text-luma-text-muted mx-auto mb-2 opacity-50" />
              <p className="text-xs text-luma-text-muted">You're all caught up.</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {notifications.map((n) => {
                const Icon = ICONS[n.type] || Bell;
                return (
                  <button
                    key={n._id}
                    onClick={() => handleClick(n)}
                    className={cn(
                      'w-full flex items-start gap-2.5 px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer',
                      n.read ? 'hover:bg-white/[0.03]' : 'bg-luma-blue/[0.06] hover:bg-luma-blue/[0.1]'
                    )}
                  >
                    <Icon className="w-4 h-4 text-luma-blue shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{n.title}</p>
                      <p className="text-[11px] text-luma-text-muted mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-luma-text-dimmed mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-luma-blue shrink-0 mt-1.5" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </>
  );
}
