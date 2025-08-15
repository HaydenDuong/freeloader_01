import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { eventsAPI } from '../../utils/api';
import { Event } from '../../types';
import CreateEventForm from './CreateEventForm';
import EventList from './EventList';
import './Organizer.css';

const OrganizerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      const response = await eventsAPI.getMyEvents();
      setEvents(response.events);
    } catch (err: any) {
      setError('Failed to fetch events');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEventCreated = (newEvent: Event) => {
    setEvents([...events, newEvent]);
    setShowCreateForm(false);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="organizer-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Organizer Dashboard</h1>
          <div className="header-actions">
            <span className="user-email">Welcome, {user?.email}</span>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-content">
          <div className="dashboard-actions">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="create-event-button"
            >
              {showCreateForm ? 'Cancel' : 'Create New Event'}
            </button>
          </div>

          {showCreateForm && (
            <CreateEventForm
              onEventCreated={handleEventCreated}
              onCancel={() => setShowCreateForm(false)}
            />
          )}

          <div className="events-section">
            <h2>My Events ({events.length})</h2>
            {loading ? (
              <div className="loading">Loading events...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : events.length === 0 ? (
              <div className="no-events">
                <p>You haven't created any events yet.</p>
                <p>Click "Create New Event" to get started!</p>
              </div>
            ) : (
              <EventList events={events} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrganizerDashboard;
