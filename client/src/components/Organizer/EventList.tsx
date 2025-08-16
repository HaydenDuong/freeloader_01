import React from 'react';
import { Event } from '../../types';

interface EventListProps {
  events: Event[];
  onEditEvent: (event: Event) => void;
  onDeleteEvent: (event: Event) => void;
}

const EventList: React.FC<EventListProps> = ({ events, onEditEvent, onDeleteEvent }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="event-grid">
      {events.map((event) => (
        <div key={event.id} className="event-card-modern">
          {/* Event Image */}
          <div className="event-image-container">
            {event.image_url ? (
              <img 
                src={event.image_url} 
                alt={event.title}
                className="event-image"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://via.placeholder.com/400x200/667eea/ffffff?text=Event+Image';
                }}
              />
            ) : (
              <div className="event-image-placeholder">
                <span className="placeholder-icon">🎉</span>
                <span className="placeholder-text">Event Image</span>
              </div>
            )}
            <div className="event-date-overlay">
              {formatDate(event.date_time)}
            </div>
          </div>
          
          {/* Event Content */}
          <div className="event-content">
            <div className="event-header">
              <h3 className="event-title">{event.title}</h3>
            </div>
            
            <div className="event-details">
              <p className="event-description">{event.description}</p>
              
              <div className="event-info">
                <div className="info-item">
                  <span className="info-icon">📍</span>
                  <span>{event.location}</span>
                </div>
                
                <div className="info-item">
                  <span className="info-icon">🎁</span>
                  <div className="goods-list">
                    {event.goodsProvided.slice(0, 3).map((good, index) => (
                      <span key={index} className="good-tag-small">
                        {good}
                      </span>
                    ))}
                    {event.goodsProvided.length > 3 && (
                      <span className="more-goods">+{event.goodsProvided.length - 3} more</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="event-footer">
              <div className="event-meta-info">
                <small>Created {formatDate(event.created_at)}</small>
              </div>
              <div className="event-actions">
                <button 
                  className="edit-button"
                  onClick={() => onEditEvent(event)}
                  title="Edit Event"
                >
                  ✏️ Edit
                </button>
                <button 
                  className="delete-button"
                  onClick={() => onDeleteEvent(event)}
                  title="Delete Event"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventList;
