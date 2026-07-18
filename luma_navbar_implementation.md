# Luma Clone Navbar Implementation Guide

This guide details how to implement a unified, highly polished navbar styled exactly like the Luma clone, which adapts dynamically to both **open (unauthenticated)** and **protected (authenticated)** routes.

---

## ✦ Key Features

1. **Dynamic States**: 
   - **Open Routes**: Displays Logo, local timezone clock, "Discover Events" link, and a "Sign In" button.
   - **Protected Routes**: Displays Logo, middle navigation links ("Events", "Calendars", "Discover"), dynamic local clock, "Create Event" button, Search, Notifications, and an interactive User Avatar dropdown menu with a functional sign-out action.
2. **Local Clock & Timezone**: Displays the exact local time and timezone (e.g., `9:29 AM GMT+5:30`) matching the Luma visual aesthetic.
3. **Glassmorphism Design**: Semi-transparent dark plum background (`#2d1b2d/40`) with back-drop blur (`backdrop-blur-md`) and glowing accent borders.
4. **Active Route Styling**: Automatically highlights the active page link (Events, Calendars, Discover) using React Router's `useLocation`.

---

## 🛠️ Step-by-Step Implementation

### Step 1: Create the Unified Navbar Component
Create the file `client/src/components/Navbar.jsx` and add the following code:

```jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Calendar, 
  Compass, 
  Search, 
  Bell, 
  Globe, 
  Sparkles, 
  LogOut, 
  User, 
  Plus,
  ChevronDown
} from 'lucide-react';
import { Button } from './ui/Button';
import { Avatar } from './ui/Avatar';
import { updateToken } from '../redux/authSlice';

// Helper to handle logout by resetting token state
const logoutAction = () => (dispatch) => {
  localStorage.removeItem('token');
  dispatch(updateToken({ token: null }));
};

export default function Navbar() {
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Dynamic Luma-style localized clock
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
    dispatch(logoutAction());
    setShowUserMenu(false);
    navigate('/signin');
  };

  // Close user dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showUserMenu && !e.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showUserMenu]);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="w-full px-6 py-3.5 flex items-center justify-between border-b border-white/[0.04] bg-[#2d1b2d]/40 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
      {/* Left: Star Logo */}
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)] group-hover:scale-105 transition-transform duration-300">
            <svg
              className="w-5 h-5 text-pink-400 group-hover:rotate-12 transition-transform duration-500"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2L12 2Z" />
            </svg>
            <div className="absolute inset-0 rounded-lg bg-pink-500/10 blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white font-sans hidden sm:inline-block">
            luma<span className="text-pink-400 font-medium">*</span>
          </span>
        </Link>
      </div>

      {/* Center: Navigation - Active only for logged-in users */}
      {token ? (
        <div className="hidden md:flex items-center gap-1 bg-white/[0.02] border border-white/[0.06] p-1 rounded-xl">
          <Link
            to="/"
            className={`flex items-center gap-1.5 px-4 py-1.5 text-[13px] font-medium rounded-lg transition-all duration-200 ${
              isActive('/')
                ? 'bg-white/[0.06] text-white shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/[0.02]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Events
          </Link>
          <Link
            to="/calendars"
            className={`flex items-center gap-1.5 px-4 py-1.5 text-[13px] font-medium rounded-lg transition-all duration-200 ${
              isActive('/calendars')
                ? 'bg-white/[0.06] text-white shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/[0.02]'
            }`}
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            Calendars
          </Link>
          <Link
            to="/discover"
            className={`flex items-center gap-1.5 px-4 py-1.5 text-[13px] font-medium rounded-lg transition-all duration-200 ${
              isActive('/discover')
                ? 'bg-white/[0.06] text-white shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/[0.02]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Discover
          </Link>
        </div>
      ) : null}

      {/* Right: Timezone clock and conditional actions */}
      <div className="flex items-center gap-4 text-[13px]">
        <div className="hidden lg:flex items-center gap-1.5 bg-white/[0.03] border border-white/[0.06] rounded-full px-3 py-1 font-sans text-[11px] text-white/70 shadow-inner">
          <Globe className="h-3 w-3 text-pink-400 animate-spin-[20s]" />
          <span>{currentTime}</span>
        </div>

        {token ? (
          /* Protected/Authenticated Actions */
          <>
            <div className="flex items-center gap-3">
              <Link to="/create-event">
                <Button
                  variant="ghost"
                  size="sm"
                  className="font-semibold text-white/80 hover:text-white flex items-center gap-1 hover:bg-white/[0.04] rounded-lg transition-all"
                >
                  <Plus className="w-3.5 h-3.5 text-pink-400" />
                  Create Event
                </Button>
              </Link>
              <button className="p-2 text-white/60 hover:text-white hover:bg-white/[0.04] rounded-lg transition-colors cursor-pointer">
                <Search className="w-4.5 h-4.5" />
              </button>
              <button className="p-2 text-white/60 hover:text-white hover:bg-white/[0.04] rounded-lg transition-colors cursor-pointer relative">
                <Bell className="w-4.5 h-4.5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-pink-500 rounded-full ring-2 ring-[#2d1b2d]" />
              </button>
            </div>

            {/* Dropdown Container */}
            <div className="relative user-menu-container">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-1.5 p-1 rounded-full hover:bg-white/[0.04] transition-colors cursor-pointer"
              >
                <Avatar 
                  className="h-8 w-8 ring-2 ring-pink-500/20" 
                  src="https://cdn.lu.ma/avatars-default/avatar_9.png" 
                  fallback="U" 
                />
                <ChevronDown className="w-3.5 h-3.5 text-white/40" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-[#1a121a]/95 border border-white/[0.08] rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-md p-1.5 z-50 animate-fade-in">
                  <div className="px-3 py-2 border-b border-white/[0.04] mb-1">
                    <p className="text-xs text-white/40">Logged in as</p>
                    <p className="text-xs font-semibold text-white truncate">User</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-medium text-white/80 hover:text-white hover:bg-white/[0.04] rounded-lg transition-colors cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-pink-400" />
                    My Profile
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
          <>
            <a
              href="#"
              className="hover:text-white text-white/60 transition-colors flex items-center gap-1 font-medium mr-1"
            >
              <Sparkles className="h-3.5 w-3.5 text-pink-400" />
              Discover Events
            </a>
            <Link to="/signin">
              <Button
                variant="secondary"
                size="sm"
                className="h-[32px] rounded-lg px-3.5 bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.08] hover:border-white/20 text-white font-semibold transition-all"
              >
                Sign In
              </Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
```

---

### Step 2: Render Navbar Globally in `App.jsx`
Open `client/src/App.jsx` and replace the content to render `<Navbar />` inside the router wrapper:

```jsx
import * as React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SignIn } from './components/SignIn';
import HomePage from './pages/HomePage';
import ProtectedRoutes from './components/ProtectedRoutes';
import Navbar from './components/Navbar';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-luma-bg text-luma-text-primary">
        <Navbar />
        <main className="flex-1 flex flex-col">
          <Routes>
            {/* Sign In Route */}
            <Route path="/signin" element={<SignIn />} />

            <Route element={<ProtectedRoutes />}>
              <Route path="/" element={<HomePage />} />
            </Route>

            {/* login k badd hoga acess token milne k baad */}
            {/* Redirect any other route to /signin by default */}
            <Route path="*" element={<Navigate to="/signin" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
```

---

### Step 3: Remove Redundant Header in `SignIn.jsx`
Open `client/src/components/SignIn.jsx` and remove the old hardcoded header to prevent double navigation headers on the Sign In page:

```diff
@@ -273,36 +273,6 @@
-      {/* Luma Header */}
-      <header className="w-full px-6 py-4 flex items-center justify-between z-10 relative">
-        <div className="flex items-center gap-3">
-          <span className="font-bold text-[22px] tracking-tight text-luma-white cursor-pointer hover:opacity-90 flex items-center gap-1">
-            nexus
-            <span className="text-luma-blue font-medium animate-pulse">*</span>
-          </span>
-        </div>
-
-        <div className="flex items-center gap-4 sm:gap-6 text-[13px] text-luma-text-muted">
-          <div className="hidden md:flex items-center gap-1.5 bg-white/[0.03] border border-white/[0.06] rounded-full px-3 py-1 font-sans text-[11px] text-luma-text-light-gray shadow-inner">
-            <Globe className="h-3 w-3 text-luma-blue animate-spin-[20s]" />
-            <span>{currentTime}</span>
-          </div>
-          <a
-            href="#"
-            className="hover:text-luma-text-primary transition-colors flex items-center gap-1 font-medium"
-          >
-            <Sparkles className="h-3.5 w-3.5 text-luma-yellow" />
-            Discover Events
-          </a>
-          <Button
-            variant="secondary"
-            size="xs"
-            className="h-[32px] rounded-lg px-3.5 bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.08] hover:border-white/20 text-luma-white font-semibold transition-all"
-          >
-            Sign In
-          </Button>
-        </div>
-      </header>
 
       {/* Centered Sign In Content */}
```
