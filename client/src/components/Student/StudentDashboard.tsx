import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { eventsAPI, engagementAPI } from '../../utils/api';
import { Event } from '../../types';
import StudentEventList from './StudentEventList';
import EventCalendar from './EventCalendar';
import './Student.css';
import NotificationBell from './NotificationBell';

const StudentDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [rsvpEvents, setRsvpEvents] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchAllEvents();
    loadRsvpData();
  }, []);

  // Load RSVP data from localStorage
  const loadRsvpData = () => {
    const savedRsvps = localStorage.getItem('student_rsvps');
    if (savedRsvps) {
      try {
        const rsvpArray = JSON.parse(savedRsvps);
        setRsvpEvents(new Set(rsvpArray));
      } catch (error) {
        console.error('Error loading RSVPs:', error);
      }
    }
  };

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

  const handleCalendarToggle = () => {
    setShowCalendar(!showCalendar);
  };

  // Handle RSVP changes from child components
  const handleRsvpToggle = async (eventId: number) => {
    const isCurrentlyRsvped = rsvpEvents.has(eventId);
    const newRsvpEvents = new Set(rsvpEvents);

    try {
      if (isCurrentlyRsvped) {
        // Remove save
        await engagementAPI.removeSave(eventId);
        newRsvpEvents.delete(eventId);
      } else {
        // Add save
        await engagementAPI.trackSave(eventId);
        newRsvpEvents.add(eventId);
      }

      setRsvpEvents(newRsvpEvents);
      // Keep localStorage in sync for immediate UI feedback
      localStorage.setItem('student_rsvps', JSON.stringify(Array.from(newRsvpEvents)));
    } catch (error) {
      console.error('Failed to update RSVP:', error);
      // Show user-friendly error or revert the change
    }
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
            <NotificationBell />
            <Link to="/student/edit-profile" className="edit-profile-button">
              Edit Profile
            </Link>
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
              <Link to="/student/saved-events" className="stat-card">
                <h3>Saved Events</h3>
                <div className="stat-number">{rsvpEvents.size}</div>
              </Link>
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
              <p>Check back later for exciting events with free stuff!</p>
            </div>
          ) : (
            <div className="events-sections">
              {/* Calendar Section */}
              {showCalendar && (
                <EventCalendar
                  events={events}
                  rsvpEvents={rsvpEvents}
                  onEventClick={(event) => console.log('Event clicked:', event)}
                />
              )}

              {upcomingEvents.length > 0 && (
                <div className="events-section">
                  <div className="section-header">
                    <h2>Upcoming Events ({upcomingEvents.length})</h2>
                    <button
                      className="calendar-toggle-button"
                      onClick={handleCalendarToggle}
                    >
                      {showCalendar ? 'Hide Calendar' : 'Calendar View'}
                    </button>
                  </div>
                  <StudentEventList
                    events={upcomingEvents}
                    rsvpEvents={rsvpEvents}
                    onRsvpToggle={handleRsvpToggle}
                  />
                </div>
              )}

              {pastEvents.length > 0 && (
                <div className="events-section">
                  <h2>Past Events ({pastEvents.length})</h2>
                  <StudentEventList
                    events={pastEvents}
                    rsvpEvents={rsvpEvents}
                    onRsvpToggle={handleRsvpToggle}
                    isPast={true}
                  />
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
