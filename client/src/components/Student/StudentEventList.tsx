import React, { useEffect } from 'react';
import { Event } from '../../types';
import { eventsAPI } from '../../utils/api';

interface StudentEventListProps {
  events: Event[];
  rsvpEvents: Set<number>;
  onRsvpToggle: (eventId: number) => void;
  isPast?: boolean;
}

const StudentEventList: React.FC<StudentEventListProps> = ({ 
  events, 
  rsvpEvents, 
  onRsvpToggle, 
  isPast = false 
}) => {
  // Track event views when component mounts
  useEffect(() => {
    events.forEach(event => {
      eventsAPI.trackEventView(event.id).catch(err => {
        console.error('Error tracking view for event', event.id, err);
      });
    });
  }, [events]);

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

  const isEventSoon = (dateString: string) => {
    const eventDate = new Date(dateString);
    const now = new Date();
    const timeDiff = eventDate.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);
    return hoursDiff <= 24 && hoursDiff > 0; // Within 24 hours
  };

  return (
    <div className="student-event-grid">
      {events.map((event) => {
        const isRsvped = rsvpEvents.has(event.id);
        return (
          <div 
            key={event.id} 
            className={`student-event-card-modern ${isPast ? 'past-event' : ''} ${isEventSoon(event.date_time) ? 'event-soon' : ''} ${isRsvped ? 'rsvped' : ''}`}
          >
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
              
              {/* Badges Overlay */}
              <div className="event-badges">
                {isEventSoon(event.date_time) && !isPast && (
                  <span className="event-badge soon">Starting Soon!</span>
                )}
                {isPast && <span className="event-badge past">Past Event</span>}
                {isRsvped && !isPast && (
                  <span className="event-badge rsvp">Going!</span>
                )}
              </div>
              
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
                    <span className="info-icon">👤</span>
                    <span>{event.organizer_email}</span>
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
                
                {/* RSVP Button */}
                {!isPast && (
                  <div className="event-actions">
                    <button
                      className={`rsvp-button ${isRsvped ? 'rsvped' : ''}`}
                      onClick={() => onRsvpToggle(event.id)}
                    >
                      {isRsvped ? '✓ Going!' : '+ I\'m Interested'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StudentEventList;
