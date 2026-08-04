import api from './api';

const multipart = { headers: { 'Content-Type': 'multipart/form-data' } };

export const EventsAPI = {
  list: (params) => api.get('/events', { params }),
  discover: (params) => api.get('/events/discover', { params }),
  getById: (id) => api.get(`/events/${id}`),
  create: (formData) => api.post('/events', formData, multipart),
  update: (id, formData) => api.patch(`/events/${id}`, formData, multipart),
  remove: (id) => api.delete(`/events/${id}`),
  setStatus: (id, status) => api.patch(`/events/${id}/status`, { status }),
};

export const TicketsAPI = {
  checkout: (eventId, payload) => api.post(`/tickets/checkout/${eventId}`, payload),
  pay: (id) => api.post(`/tickets/${id}/pay`),
  mine: () => api.get('/tickets/mine'),
  forEvent: (eventId, params) => api.get(`/tickets/event/${eventId}`, { params }),
  approve: (id) => api.patch(`/tickets/${id}/approve`),
  reject: (id) => api.patch(`/tickets/${id}/reject`),
  cancel: (id) => api.delete(`/tickets/${id}`),
  checkIn: (payload) => api.post('/tickets/checkin', payload),
  getQrBlob: (id) => api.get(`/tickets/${id}/qr-code`, { responseType: 'blob' }),
};

export const UsersAPI = {
  me: () => api.get('/users/me'),
  updateMe: (payload) => api.patch('/users/me', payload),
  savedEvents: () => api.get('/users/me/saved'),
  toggleSave: (eventId) => api.post(`/users/me/saved/${eventId}`),
};

export const OrganizerAPI = {
  overview: () => api.get('/organizer/overview'),
  myEvents: (params) => api.get('/organizer/events', { params }),
};

export const AdminAPI = {
  stats: () => api.get('/admin/stats'),
  events: (params) => api.get('/admin/events', { params }),
  users: (params) => api.get('/admin/users', { params }),
  updateRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
  toggleActive: (id) => api.patch(`/admin/users/${id}/deactivate`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
};

export const NotificationsAPI = {
  list: () => api.get('/notifications'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};

export const ChatAPI = {
  history: () => api.get('/chat/history'),
  clear: () => api.delete('/chat/history'),
};
