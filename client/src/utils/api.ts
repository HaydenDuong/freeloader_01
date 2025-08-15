import axios from 'axios';
import { AuthResponse, EventsResponse, Event } from '../types';

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

// Auth API
export const authAPI = {
  register: (email: string, password: string, role: 'organizer' | 'student'): Promise<AuthResponse> =>
    api.post('/auth/register', { email, password, role }).then(res => res.data),
  
  login: (email: string, password: string): Promise<AuthResponse> =>
    api.post('/auth/login', { email, password }).then(res => res.data),
};

// Events API
export const eventsAPI = {
  createEvent: (eventData: {
    title: string;
    description: string;
    location: string;
    dateTime: string;
    goodsProvided: string[];
  }): Promise<{ message: string; event: Event }> =>
    api.post('/events', eventData).then(res => res.data),
  
  getAllEvents: (): Promise<EventsResponse> =>
    api.get('/events').then(res => res.data),
  
  getMyEvents: (): Promise<EventsResponse> =>
    api.get('/events/my-events').then(res => res.data),
};

export default api;
