import React, { useState } from 'react';
import { eventsAPI } from '../../utils/api';
import { Event } from '../../types';

interface EditEventFormProps {
  event: Event;
  onEventUpdated: (updatedEvent: Event) => void;
  onCancel: () => void;
}

const EditEventForm: React.FC<EditEventFormProps> = ({ event, onEventUpdated, onCancel }) => {
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

  const [title, setTitle] = useState(event.title || '');
  const [description, setDescription] = useState(event.description || '');
  const [location, setLocation] = useState(event.location || '');
  const [dateTime, setDateTime] = useState(formatDateTimeForInput(event.date_time));
  const [goodsProvided, setGoodsProvided] = useState<string[]>(event.goodsProvided ? [...event.goodsProvided] : ['']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addGoodField = () => {
    setGoodsProvided([...goodsProvided, '']);
  };

  const removeGoodField = (index: number) => {
    setGoodsProvided(goodsProvided.filter((_, i) => i !== index));
  };

  const updateGoodField = (index: number, value: string) => {
    const updatedGoods = [...goodsProvided];
    updatedGoods[index] = value;
    setGoodsProvided(updatedGoods);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Filter out empty goods
    const filteredGoods = goodsProvided.filter(good => good.trim() !== '');

    if (filteredGoods.length === 0) {
      setError('Please add at least one item to "Goods Provided"');
      setLoading(false);
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

      onEventUpdated(response.event);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Your session has expired. Please login again.');
        // The interceptor will handle the redirect
        return;
      }
      setError(err.response?.data?.message || 'Failed to update event');
      console.error('Error updating event:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get minimum date (today)
  const today = new Date();
  const minDate = today.toISOString().slice(0, 16);

  return (
    <div className="edit-event-form">
      <h3>Edit Event</h3>
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
            disabled={loading}
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
            disabled={loading}
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
            disabled={loading}
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
            disabled={loading}
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
                disabled={loading}
              />
              {goodsProvided.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeGoodField(index)}
                  className="remove-good-button"
                  disabled={loading}
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
            disabled={loading}
          >
            Add Another Item
          </button>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Updating Event...' : 'Update Event'}
          </button>
          <button type="button" onClick={onCancel} disabled={loading} className="cancel-button">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEventForm;
