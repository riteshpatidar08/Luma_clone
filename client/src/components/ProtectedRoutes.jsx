import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
function ProtectedRoutes() {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/signin" />;
  }

  return (
    <div>
      <Outlet />
    </div>
  );
}

export default ProtectedRoutes;
