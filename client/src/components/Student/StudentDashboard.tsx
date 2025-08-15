import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { eventsAPI } from '../../utils/api';
import { Event } from '../../types';
import StudentEventList from './StudentEventList';
import './Student.css';

const StudentDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAllEvents();
  }, []);

  const fetchAllEvents = async () => {
    try {
      const response = await eventsAPI.getAllEvents();
      setEvents(response.events);
    } catch (err: any) {
      setError('Failed to fetch events');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  // Filter events by upcoming vs past
  const now = new Date();
  const upcomingEvents = events.filter(event => new Date(event.date_time) > now);
  const pastEvents = events.filter(event => new Date(event.date_time) <= now);

  return (
    <div className="student-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Student Dashboard</h1>
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
          <div className="events-overview">
            <div className="overview-stats">
              <div className="stat-card">
                <h3>Total Events</h3>
                <div className="stat-number">{events.length}</div>
              </div>
              <div className="stat-card">
                <h3>Upcoming</h3>
                <div className="stat-number">{upcomingEvents.length}</div>
              </div>
              <div className="stat-card">
                <h3>Past Events</h3>
                <div className="stat-number">{pastEvents.length}</div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="loading">Loading events...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : events.length === 0 ? (
            <div className="no-events">
              <h2>No Events Available</h2>
              <p>Check back later for exciting events with free stuff! 🎉</p>
            </div>
          ) : (
            <div className="events-sections">
              {upcomingEvents.length > 0 && (
                <div className="events-section">
                  <h2>🚀 Upcoming Events ({upcomingEvents.length})</h2>
                  <StudentEventList events={upcomingEvents} />
                </div>
              )}

              {pastEvents.length > 0 && (
                <div className="events-section">
                  <h2>📅 Past Events ({pastEvents.length})</h2>
                  <StudentEventList events={pastEvents} isPast={true} />
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
