import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Event } from '../../types';

interface StudentEventListProps {
  events: Event[];
  rsvpEvents: Set<number>;
  onRsvpToggle: (eventId: number) => Promise<void>;
  isPast?: boolean;
}


const StudentEventList: React.FC<StudentEventListProps> = ({
  events,
  rsvpEvents,
  onRsvpToggle,
  isPast = false
}) => {
  const navigate = useNavigate();

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
    <div className="student-event-list">
      {events.map((event) => {
        const isRsvped = rsvpEvents.has(event.id);
        return (
          <div
            key={event.id}
            className={`student-event-card ${isPast ? 'past-event' : ''} ${isEventSoon(event.date_time) ? 'event-soon' : ''} ${isRsvped ? 'rsvped' : ''}`}
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(`/student/event/${event.id}`)}
          >
            <div className="event-header">
              <h3 className="event-title">{event.title}</h3>
              <div className="event-meta">
                <span className="event-date">{formatDate(event.date_time)}</span>
                {isEventSoon(event.date_time) && !isPast && (
                  <span className="event-badge soon">Starting Soon!</span>
                )}
                {isPast && <span className="event-badge past">Past Event</span>}
                {isRsvped && !isPast && (
                  <span className="event-badge rsvp">Going!</span>
                )}
              </div>
            </div>

            <div className="event-body">
              <p className="event-description">{event.description}</p>

              <div className="event-details">
                <div className="detail-row">
                  <span className="detail-icon">📍</span>
                  <strong>Location:</strong> {event.location}
                </div>

                <div className="detail-row">
                  <span className="detail-icon">👤</span>
                  <strong>Organizer:</strong> {event.organizer_email}
                </div>

                <div className="detail-row">
                  <span className="detail-icon">🎁</span>
                  <strong>Free Stuff:</strong>
                  <div className="goods-grid">
                    {event.goodsProvided.map((good, index) => (
                      <span key={index} className="good-tag">
                        {good}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* RSVP Button */}
              {!isPast && (
                <div className="event-actions" onClick={e => e.stopPropagation()}>
                  <button
                    className={`rsvp-button ${isRsvped ? 'rsvped' : ''}`}
                    onClick={async () => await onRsvpToggle(event.id)}
                  >
                    {isRsvped ? '✓ Going!' : '+ I\'m Interested'}
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StudentEventList;
