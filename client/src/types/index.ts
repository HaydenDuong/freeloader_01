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
