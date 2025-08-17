import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { eventsAPI } from '../../utils/api';
import { Event } from '../../types';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import './Organizer.css';

const OrganizerEventEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [goodsProvided, setGoodsProvided] = useState<string[]>(['']);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    if (!id) {
      setError('Invalid event ID');
      setLoading(false);
      return;
    }

    try {
      // Get all organizer events and find the specific one
      const response = await eventsAPI.getMyEvents();
      const foundEvent = response.events.find(e => e.id === parseInt(id));
      
      if (!foundEvent) {
        setError('Event not found or you do not have permission to edit it');
        setLoading(false);
        return;
      }

      setEvent(foundEvent);
      populateForm(foundEvent);
    } catch (err: any) {
      if (err.response?.status === 401) {
        // Token expired, user will be redirected by interceptor
        return;
      }
      setError(err.response?.data?.message || 'Failed to fetch event');
      console.error('Error fetching event:', err);
    } finally {
      setLoading(false);
    }
  };

  const populateForm = (eventData: Event) => {
    setTitle(eventData.title || '');
    setDescription(eventData.description || '');
    setLocation(eventData.location || '');
    setDateTime(formatDateTimeForInput(eventData.date_time));
    setGoodsProvided(eventData.goodsProvided && eventData.goodsProvided.length > 0 ? [...eventData.goodsProvided] : ['']);
  };

  // Helper function to format date for datetime-local input
  const formatDateTimeForInput = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      // Format as YYYY-MM-DDTHH:MM for datetime-local input
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const addGoodField = () => {
    setGoodsProvided([...goodsProvided, '']);
  };

  const removeGoodField = (index: number) => {
    if (goodsProvided.length > 1) {
      setGoodsProvided(goodsProvided.filter((_, i) => i !== index));
    }
  };

  const updateGoodField = (index: number, value: string) => {
    const updatedGoods = [...goodsProvided];
    updatedGoods[index] = value;
    setGoodsProvided(updatedGoods);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    setSaving(true);
    setError('');

    // Filter out empty goods
    const filteredGoods = goodsProvided.filter(good => good.trim() !== '');

    if (filteredGoods.length === 0) {
      setError('Please add at least one item to "Goods Provided"');
      setSaving(false);
      return;
    }

    try {
      const response = await eventsAPI.updateEvent(event.id, {
        title,
        description,
        location,
        dateTime,
        goodsProvided: filteredGoods,
      });

      setEvent(response.event);
      setError('');
      
      // Show success message briefly then redirect
      alert('Event updated successfully!');
      navigate('/organizer');
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Your session has expired. Please login again.');
        return;
      }
      setError(err.response?.data?.message || 'Failed to update event');
      console.error('Error updating event:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!event) return;
    
    setDeleteLoading(true);
    try {
      await eventsAPI.deleteEvent(event.id);
      setShowDeleteModal(false);
      alert('Event deleted successfully!');
      navigate('/organizer');
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(err.response?.data?.message || 'Failed to delete event');
      console.error('Error deleting event:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const goBack = () => {
    navigate('/organizer');
  };

  // Get minimum date (today)
  const today = new Date();
  const minDate = today.toISOString().slice(0, 16);

  if (loading) {
    return (
      <div className="organizer-dashboard">
        <header className="dashboard-header">
          <div className="header-content">
            <h1>Edit Event</h1>
            <div className="header-actions">
              <span className="user-email">Welcome, {user?.email}</span>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </div>
          </div>
        </header>
        <main className="dashboard-main">
          <div className="loading">Loading event...</div>
        </main>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="organizer-dashboard">
        <header className="dashboard-header">
          <div className="header-content">
            <h1>Edit Event</h1>
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
            <div className="error-message">{error}</div>
            <button onClick={goBack} className="cancel-button">
              Back to Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="organizer-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Edit Event</h1>
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
            <button onClick={goBack} className="cancel-button">
              ← Back to Dashboard
            </button>
          </div>

          <div className="edit-event-form">
            <div className="edit-event-header">
              <h3>✏️ Edit Event</h3>
              <button 
                onClick={() => setShowDeleteModal(true)}
                className="delete-button"
                type="button"
              >
                🗑️ Delete Event
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {error && <div className="error-message">{error}</div>}

              <div className="form-group">
                <label htmlFor="edit-title">Event Title *</label>
                <input
                  type="text"
                  id="edit-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  disabled={saving}
                  placeholder="Enter event title"
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-description">Description *</label>
                <textarea
                  id="edit-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  disabled={saving}
                  placeholder="Describe your event"
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-location">Location *</label>
                <input
                  type="text"
                  id="edit-location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  disabled={saving}
                  placeholder="Event location"
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-dateTime">Date & Time *</label>
                <input
                  type="datetime-local"
                  id="edit-dateTime"
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  required
                  disabled={saving}
                  min={minDate}
                />
              </div>

              <div className="form-group">
                <label>Goods Provided *</label>
                {goodsProvided.map((good, index) => (
                  <div key={index} className="goods-input-row">
                    <input
                      type="text"
                      value={good}
                      onChange={(e) => updateGoodField(index, e.target.value)}
                      placeholder="e.g., Free Pizza, T-shirts"
                      disabled={saving}
                    />
                    {goodsProvided.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeGoodField(index)}
                        className="remove-good-button"
                        disabled={saving}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addGoodField}
                  className="add-good-button"
                  disabled={saving}
                >
                  Add Another Item
                </button>
              </div>

              <div className="form-actions">
                <button type="submit" disabled={saving} className="submit-button">
                  {saving ? 'Updating Event...' : 'Update Event'}
                </button>
                <button type="button" onClick={goBack} disabled={saving} className="cancel-button">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && event && (
        <DeleteConfirmationModal
          event={event}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
          isDeleting={deleteLoading}
        />
      )}
    </div>
  );
};

export default OrganizerEventEdit;
