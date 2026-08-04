import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Calendar,
  Compass,
  Search,
  Globe,
  Sparkles,
  LogOut,
  User,
  Plus,
  ChevronDown,
  LayoutDashboard,
} from 'lucide-react';
import { Button } from './ui/Button';
import { Avatar } from './ui/Avatar';
import { NotificationsDropdown } from './NotificationsDropdown';
import { logout } from '../redux/authSlice';

const DASHBOARD_ROUTE = {
  admin: '/admin',
  organizer: '/organizer',
  attendee: '/dashboard',
};

export default function Navbar() {
  const { token, role, name, avatarUrl } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      const offsetMinutes = -now.getTimezoneOffset();
      const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60);
      const offsetRemaining = Math.abs(offsetMinutes) % 60;
      const offsetSign = offsetMinutes >= 0 ? '+' : '-';
      const timezoneStr = `GMT${offsetSign}${offsetHours}:${offsetRemaining
        .toString()
        .padStart(2, '0')}`;

      setCurrentTime(`${timeStr} ${timezoneStr}`);
    };

    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    setShowUserMenu(false);
    navigate('/signin');
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showUserMenu && !e.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
      if (showNotifications && !e.target.closest('.notifications-container')) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showUserMenu, showNotifications]);

  const isActive = (path) => location.pathname === path;
  const dashboardRoute = DASHBOARD_ROUTE[role] || '/dashboard';

  return (
    <nav className="w-full px-6 py-3.5 flex items-center justify-between sticky top-0 z-50 bg-luma-bg/95 backdrop-blur-md border-b border-white/[0.05] text-luma-text-primary transition-all duration-300">
      {/* Left: Star Logo */}
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg group-hover:scale-105 transition-transform duration-300">
            <svg
              className="w-5 h-5 text-luma-blue group-hover:rotate-12 transition-transform duration-500"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2L12 2Z" />
            </svg>
          </div>
          <span className="font-bold text-[22px] tracking-tight text-luma-text-primary cursor-pointer hover:opacity-90 flex items-center gap-1">
            nexus
            <span className="text-luma-blue font-medium animate-pulse">*</span>
          </span>
        </Link>
      </div>

      {/* Center: Navigation - Active only for logged-in users */}
      {token ? (
        <div className="hidden md:flex items-center gap-1 border border-white/[0.06] p-1 rounded-xl">
          <Link
            to="/"
            className={`flex items-center gap-1.5 px-4 py-1.5 text-[13px] font-medium rounded-lg transition-all duration-200 ${
              isActive('/')
                ? 'bg-white/[0.06] text-luma-text-primary shadow-sm'
                : 'text-luma-text-primary/60 hover:text-luma-text-primary hover:bg-white/[0.02]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Events
          </Link>
          <Link
            to="/discover"
            className={`flex items-center gap-1.5 px-4 py-1.5 text-[13px] font-medium rounded-lg transition-all duration-200 ${
              isActive('/discover')
                ? 'bg-white/[0.06] text-luma-text-primary shadow-sm'
                : 'text-luma-text-primary/60 hover:text-luma-text-primary hover:bg-white/[0.02]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Discover
          </Link>
          <Link
            to={dashboardRoute}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-[13px] font-medium rounded-lg transition-all duration-200 ${
              location.pathname.startsWith(dashboardRoute)
                ? 'bg-white/[0.06] text-luma-text-primary shadow-sm'
                : 'text-luma-text-primary/60 hover:text-luma-text-primary hover:bg-white/[0.02]'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Dashboard
          </Link>
        </div>
      ) : null}

      {/* Right: Timezone clock and conditional actions */}
      <div className="flex items-center gap-4 text-[13px]">
        {token ? (
          /* Protected/Authenticated Actions */
          <>
            <div className="flex items-center gap-3">
              <Link to="/register/event">
                <Button
                  variant="ghost"
                  size="sm"
                  className="font-semibold text-luma-text-primary/80 hover:text-luma-text-primary flex items-center gap-1 hover:bg-white/[0.04] rounded-lg transition-all"
                >
                  <Plus className="w-3.5 h-3.5 text-luma-blue" />
                  Create Event
                </Button>
              </Link>
              <Link to="/discover" className="p-2 text-luma-text-primary/60 hover:text-luma-text-primary hover:bg-white/[0.04] rounded-lg transition-colors cursor-pointer md:hidden">
                <Search className="w-4.5 h-4.5" />
              </Link>
              <div className="relative notifications-container">
                <span onClick={() => setShowNotifications((v) => !v)}>
                  <NotificationsDropdown isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
                </span>
              </div>
            </div>

            {/* Dropdown Container */}
            <div className="relative user-menu-container">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-1.5 p-1 rounded-full hover:bg-white/[0.04] transition-colors cursor-pointer"
              >
                <Avatar
                  className="h-8 w-8 ring-2 ring-luma-blue/20"
                  src={avatarUrl || 'https://cdn.lu.ma/avatars-default/avatar_9.png'}
                  fallback={name?.[0] || 'U'}
                />
                <ChevronDown className="w-3.5 h-3.5 text-white/40" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-[#121315]/95 border border-white/[0.08] rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-md p-1.5 z-50 animate-fade-in">
                  <div className="px-3 py-2 border-b border-white/[0.04] mb-1">
                    <p className="text-xs text-luma-text-primary/40">Signed in as</p>
                    <p className="text-xs font-semibold text-luma-text-primary truncate">{name || 'Nexus User'}</p>
                    <p className="text-[10px] text-luma-blue font-semibold capitalize mt-0.5">{role}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/dashboard/settings');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-medium text-luma-text-primary/80 hover:text-luma-text-primary hover:bg-white/[0.04] rounded-lg transition-colors cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-luma-blue" />
                    Profile Settings
                  </button>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate(dashboardRoute);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-medium text-luma-text-primary/80 hover:text-luma-text-primary hover:bg-white/[0.04] rounded-lg transition-colors cursor-pointer"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-luma-blue" />
                    Dashboard
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Open/Unauthenticated Actions */
          <div className="flex items-center gap-4 sm:gap-6 text-[13px] text-luma-text-muted">
            <div className="hidden md:flex items-center gap-1.5 bg-white/[0.03] border border-white/[0.06] rounded-full px-3 py-1 font-sans text-[11px] text-luma-text-primary/60 shadow-inner">
              <Globe className="h-3 w-3 text-luma-blue animate-spin-[20s]" />
              <span>{currentTime}</span>
            </div>
            <Link
              to="/discover"
              className="hover:text-luma-text-primary transition-colors flex items-center gap-1 font-medium"
            >
              <Sparkles className="h-3.5 w-3.5 text-luma-yellow" />
              Discover Events
            </Link>

            {location.pathname !== '/signin' && (
              <Link to="/signin">
                <Button
                  variant="secondary"
                  size="xs"
                  className="h-[32px] rounded-lg px-3.5 bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.08] hover:border-white/20 text-luma-text-primary font-semibold transition-all"
                >
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
