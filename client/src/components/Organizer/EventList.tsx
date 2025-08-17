import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Event } from '../../types';

interface EventListProps {
  events: Event[];
}

const EventList: React.FC<EventListProps> = ({ events }) => {
  const navigate = useNavigate();

  const handleEventClick = (event: Event) => {
    navigate(`/organizer/event/${event.id}`);
  };

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
    <div className="event-list">
      {events.map((event) => (
        <div 
          key={event.id} 
          className="event-card clickable-card"
          onClick={() => handleEventClick(event)}
        >
          <div className="event-header">
            <h3 className="event-title">{event.title}</h3>
            <span className="event-date">{formatDate(event.date_time)}</span>
          </div>
          
          <div className="event-details">
            <p className="event-description">{event.description}</p>
            
            <div className="event-info">
              <div className="info-item">
                <strong>📍 Location:</strong> {event.location}
              </div>
              
              <div className="info-item">
                <strong>🎁 Goods Provided:</strong>
                <div className="goods-list">
                  {event.goodsProvided.map((good, index) => (
                    <span key={index} className="good-item">
                      {good}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="event-footer">
            <div className="event-meta-info">
              <small>Created on {formatDate(event.created_at)}</small>
            </div>
            <div className="event-click-hint">
              <span className="click-hint">Click to edit →</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventList;
