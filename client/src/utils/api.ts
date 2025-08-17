import axios from 'axios';
import { AuthResponse, EventsResponse, Event, NotificationsResponse, Notification } from '../types';

// Token validation utilities
export const tokenUtils = {
  // Check if token is expired or will expire soon
  isTokenExpiringSoon: (token: string, thresholdMinutes: number = 30): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      const timeUntilExpiry = payload.exp - currentTime;
      const thresholdSeconds = thresholdMinutes * 60;

      return timeUntilExpiry <= thresholdSeconds;
    } catch (error) {
      console.error('Error parsing token:', error);
      return true; // Assume expired if we can't parse
    }
  },

  // Get token expiration time
  getTokenExpiration: (token: string): Date | null => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return new Date(payload.exp * 1000);
    } catch (error) {
      console.error('Error parsing token:', error);
      return null;
    }
  }
};

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle authentication errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Check if this is the first 401 error (not a retry)
      const originalRequest = error.config;

      if (!originalRequest._retry) {
        originalRequest._retry = true;

        // Try to refresh the token by getting user to login again
        // For now, we'll redirect to login, but this could be enhanced
        // with a refresh token endpoint

        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Show a more user-friendly message
        console.log('Session expired. Redirecting to login...');

        // Give user a moment to see any error messages before redirect
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);

        return Promise.reject(new Error('Session expired. Please login again.'));
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (email: string, password: string, role: 'organizer' | 'student'): Promise<AuthResponse> =>
    api.post('/auth/register', { email, password, role }).then(res => res.data),

  login: (email: string, password: string, userType: 'organizer' | 'student'): Promise<AuthResponse> =>
    api.post('/auth/login', { email, password, userType }).then(res => res.data),
};

// Events API
export const eventsAPI = {
  createEvent: (eventData: {
    title: string;
    description: string;
    location: string;
    dateTime: string;
    goodsProvided: string[];
    tags: string[];
  }): Promise<{ message: string; event: Event }> =>
    api.post('/events', eventData).then(res => res.data),

  updateEvent: (eventId: number, eventData: {
    title: string;
    description: string;
    location: string;
    dateTime: string;
    goodsProvided: string[];
    tags: string[];
  }): Promise<{ message: string; event: Event }> =>
    api.put(`/events/${eventId}`, eventData).then(res => res.data),

  deleteEvent: (eventId: number): Promise<{ message: string; deletedEventId: number }> =>
    api.delete(`/events/${eventId}`).then(res => res.data),

  getAllEvents: (): Promise<EventsResponse> =>
    api.get('/events').then(res => res.data),

  getMyEvents: (): Promise<EventsResponse> =>
    api.get('/events/my-events').then(res => res.data),
};

export const userAPI = {
  getInterests: async () => {
    const response = await api.get('/user/interests');
    return response.data;
  },
  updateInterests: async (interests: string[]) => {
    const response = await api.put('/user/interests', { interests });
    return response.data;
  },
};

// Engagement API
export const engagementAPI = {
  trackView: (eventId: number): Promise<{ message: string; isNewView: boolean }> =>
    api.post(`/engagement/view/${eventId}`).then(res => res.data),

  trackSave: (eventId: number): Promise<{ message: string; saved: boolean }> =>
    api.post(`/engagement/save/${eventId}`).then(res => res.data),

  removeSave: (eventId: number): Promise<{ message: string; saved: boolean }> =>
    api.delete(`/engagement/save/${eventId}`).then(res => res.data),

  getMetrics: (eventId: number): Promise<{
    eventId: number;
    metrics: {
      totalViews: number;
      totalSaves: number;
      recentViews: number;
      recentSaves: number;
    }
  }> =>
    api.get(`/engagement/metrics/${eventId}`).then(res => res.data),
};

// Notifications API
export const notificationsAPI = {
  getNotifications: (): Promise<NotificationsResponse> =>
    api.get('/notifications').then(res => res.data),
  markAllRead: (): Promise<{ message: string; updated: number }> =>
    api.post('/notifications/mark-read', {}).then(res => res.data),
  markRead: (ids: number[]): Promise<{ message: string; updated: number }> =>
    api.post('/notifications/mark-read', { ids }).then(res => res.data),
  getUnreadCount: (): Promise<{ count: number }> =>
    api.get('/notifications/unread-count').then(res => res.data),
};

export default api;
