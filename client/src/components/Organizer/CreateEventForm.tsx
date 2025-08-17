import React, { useState } from 'react';
import { eventsAPI } from '../../utils/api';
import { Event } from '../../types';
import LocationAutocomplete from '../LocationAutocomplete';
import TagSelector from '../TagSelector';

interface CreateEventFormProps {
  onEventCreated: (event: Event) => void;
  onCancel: () => void;
}

const CreateEventForm: React.FC<CreateEventFormProps> = ({ onEventCreated, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [goodsProvided, setGoodsProvided] = useState<string[]>(['']);
  const [tags, setTags] = useState<string[]>([]);
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
      const response = await eventsAPI.createEvent({
        title,
        description,
        location,
        dateTime,
        goodsProvided: filteredGoods,
        tags,
      });

      onEventCreated(response.event);
      
      // Reset form
      setTitle('');
      setDescription('');
      setLocation('');
      setDateTime('');
      setGoodsProvided(['']);
      setTags([]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  // Get minimum date (today)
  const today = new Date();
  const minDate = today.toISOString().slice(0, 16);

  return (
    <div className="create-event-form">
      <h3>Create New Event</h3>
      <form onSubmit={handleSubmit}>
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="title">Event Title *</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={loading}
            placeholder="Enter event title"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            disabled={loading}
            placeholder="Describe your event"
            rows={4}
          />
        </div>

        <div className="form-group">
          <label htmlFor="location">Location *</label>
          <LocationAutocomplete
            id="location"
            value={location}
            onChange={setLocation}
            placeholder="Search for event location..."
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="dateTime">Date & Time *</label>
          <input
            type="datetime-local"
            id="dateTime"
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

        <div className="form-group">
          <label htmlFor="tags">Tags (Optional)</label>
          <TagSelector
            selectedTags={tags}
            onChange={setTags}
            disabled={loading}
            placeholder="Add tags to help students discover your event..."
          />
          <small className="form-help-text">
            Tags help students find events that match their interests. Select relevant categories from Goods, Topics, Career, and Entertainment.
          </small>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Creating Event...' : 'Create Event'}
          </button>
          <button type="button" onClick={onCancel} disabled={loading} className="cancel-button">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEventForm;
