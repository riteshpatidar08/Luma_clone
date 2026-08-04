import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Gate for role-specific dashboards. Any signed-in user passes the auth
// check (handled by ProtectedRoutes upstream in most cases too); this adds
// a role allow-list on top, redirecting unauthorized roles home instead of
// bouncing them to sign-in (they ARE signed in, just not allowed here).
function RoleProtectedRoute({ roles }) {
  const { token, role } = useSelector((state) => state.auth);
  const storedToken = token || localStorage.getItem('token');

  if (!storedToken) {
    return <Navigate to="/signin" replace />;
  }
  if (roles && !roles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default RoleProtectedRoute;
