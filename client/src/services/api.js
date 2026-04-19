import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
    return Promise.reject(err);
  }
);

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);

// Users
export const getMe = () => api.get('/users/me');
export const updateMe = (data) => api.put('/users/me', data);
export const getLeaderboard = () => api.get('/users/leaderboard');
export const getStats = () => api.get('/users/stats');

// Requests
export const getRequests = (params) => api.get('/requests', { params });
export const getRecentRequests = () => api.get('/requests/recent');
export const createRequest = (data) => api.post('/requests', data);
export const getRequest = (id) => api.get(`/requests/${id}`);
export const helpRequest = (id) => api.put(`/requests/${id}/help`);
export const solveRequest = (id) => api.put(`/requests/${id}/solve`);

// Messages
export const getThreads = () => api.get('/messages/threads');
export const getMessages = (requestId) => api.get(`/messages/${requestId}`);
export const sendMessage = (requestId, content) => api.post(`/messages/${requestId}`, { content });

// Notifications
export const getNotifications = () => api.get('/notifications');
export const getUnreadCount = () => api.get('/notifications/unread-count');
export const markAllRead = () => api.put('/notifications/read-all');

export default api;
