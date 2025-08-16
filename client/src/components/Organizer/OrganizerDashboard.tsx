import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { eventsAPI } from '../../utils/api';
import { Event } from '../../types';
import CreateEventForm from './CreateEventForm';
import EditEventForm from './EditEventForm';
import EventList from './EventList';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import './Organizer.css';

const OrganizerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  const handleEventUpdated = (updatedEvent: Event) => {
    setEvents(events.map(event => 
      event.id === updatedEvent.id ? updatedEvent : event
    ));
    setEditingEvent(null);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setShowCreateForm(false); // Hide create form if open
  };

  const handleDeleteEvent = (event: Event) => {
    setDeletingEvent(event);
  };

  const confirmDeleteEvent = async () => {
    if (!deletingEvent) return;
    
    setDeleteLoading(true);
    try {
      await eventsAPI.deleteEvent(deletingEvent.id);
      setEvents(events.filter(event => event.id !== deletingEvent.id));
      setDeletingEvent(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete event');
    } finally {
      setDeleteLoading(false);
    }
  };

  const cancelDelete = () => {
    setDeletingEvent(null);
  };

  const cancelEdit = () => {
    setEditingEvent(null);
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
              onClick={() => {
                setShowCreateForm(!showCreateForm);
                setEditingEvent(null); // Hide edit form if open
              }}
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

          {editingEvent && (
            <EditEventForm
              event={editingEvent}
              onEventUpdated={handleEventUpdated}
              onCancel={cancelEdit}
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
              <EventList 
                events={events} 
                onEditEvent={handleEditEvent}
                onDeleteEvent={handleDeleteEvent}
              />
            )}
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deletingEvent && (
        <DeleteConfirmationModal
          event={deletingEvent}
          onConfirm={confirmDeleteEvent}
          onCancel={cancelDelete}
          isDeleting={deleteLoading}
        />
      )}
    </div>
  );
};

export default OrganizerDashboard;
