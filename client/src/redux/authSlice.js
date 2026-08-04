import { createSlice } from '@reduxjs/toolkit';

const storedUser = (() => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
})();

const initialState = {
  id: storedUser?._id || storedUser?.id || null,
  email: storedUser?.email || null,
  name: storedUser?.name || storedUser?.profile?.name || null,
  avatarUrl: storedUser?.avatarUrl || storedUser?.profile?.avatarUrl || null,
  role: localStorage.getItem('role') || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: Boolean(localStorage.getItem('token')),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Payload shape: { token, user: { _id, email, roles, profile: { name, avatarUrl } } }
    updateToken: (state, action) => {
      const { token, user } = action.payload;
      const role = user?.roles || user?.role;
      const name = user?.name || user?.profile?.name;
      const avatarUrl = user?.avatarUrl || user?.profile?.avatarUrl;

      state.token = token || null;
      state.role = role || null;
      state.id = user?._id || user?.id || null;
      state.email = user?.email || null;
      state.name = name || null;
      state.avatarUrl = avatarUrl || null;
      state.isAuthenticated = Boolean(token);

      if (token) localStorage.setItem('token', token);
      else localStorage.removeItem('token');
      if (role) localStorage.setItem('role', role);
      if (user) localStorage.setItem('user', JSON.stringify(user));
    },
    updateProfile: (state, action) => {
      const { name, avatarUrl, role } = action.payload || {};
      if (name !== undefined) state.name = name;
      if (avatarUrl !== undefined) state.avatarUrl = avatarUrl;
      if (role !== undefined) {
        state.role = role;
        localStorage.setItem('role', role);
      }
    },
    logout: (state) => {
      state.token = null;
      state.role = null;
      state.id = null;
      state.email = null;
      state.name = null;
      state.avatarUrl = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('user');
    },
  },
});

export const { updateToken, updateProfile, logout } = authSlice.actions;
export default authSlice.reducer;
