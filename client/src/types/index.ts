export interface User {
  id: number;
  email: string;
  role: 'organizer' | 'student';
}

export interface Event {
  id: number;
  title: string;
  description: string;
  location: string;
  date_time: string;
  goodsProvided: string[];
  tags: string[];
  organizer_id: number;
  organizer_email?: string;
  created_at: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface EventsResponse {
  events: Event[];
}

export interface Notification {
  id: number;
  event_id: number;
  message: string;
  matched_tags: string[];
  is_read: boolean;
  created_at: string;
  event: {
    id: number;
    title: string;
    date_time: string;
    tags: string[];
  };
}

export interface NotificationsResponse {
  notifications: Notification[];
}
