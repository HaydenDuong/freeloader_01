import React, { useState } from 'react';
import { Event } from '../../types';

interface EventCalendarProps {
  events: Event[];
  rsvpEvents: Set<number>;
  onEventClick?: (event: Event) => void;
}

const EventCalendar: React.FC<EventCalendarProps> = ({ events, rsvpEvents, onEventClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Show all events instead of filtering by RSVP
  const allEvents = events;

  // Get first day of the month and total days
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const totalDays = lastDayOfMonth.getDate();

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get events for a specific date (all events)
  const getEventsForDate = (date: number) => {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), date);
    return allEvents.filter(event => {
      const eventDate = new Date(event.date_time);
      return (
        eventDate.getDate() === targetDate.getDate() &&
        eventDate.getMonth() === targetDate.getMonth() &&
        eventDate.getFullYear() === targetDate.getFullYear()
      );
    });
  };

  // Check if date is today
  const isToday = (date: number) => {
    const today = new Date();
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), date);
    return (
      targetDate.getDate() === today.getDate() &&
      targetDate.getMonth() === today.getMonth() &&
      targetDate.getFullYear() === today.getFullYear()
    );
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayWeekday; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Days of the month
    for (let date = 1; date <= totalDays; date++) {
      const dayEvents = getEventsForDate(date);
      const hasEvents = dayEvents.length > 0;
      const todayClass = isToday(date) ? 'today' : '';
      const eventsClass = hasEvents ? 'has-events' : '';

      days.push(
        <div
          key={date}
          className={`calendar-day ${todayClass} ${eventsClass}`}
          onClick={() => {
            if (hasEvents && dayEvents[0]) {
              setSelectedEvent(dayEvents[0]);
              onEventClick?.(dayEvents[0]);
            }
          }}
        >
          <span className="day-number">{date}</span>
          {hasEvents && (
            <div className="event-indicators">
              {dayEvents.slice(0, 3).map((event, index) => (
                <div
                  key={event.id}
                  className={`event-dot ${rsvpEvents.has(event.id) ? 'rsvp-event' : 'regular-event'}`}
                  title={event.title}
                  style={{ animationDelay: `${index * 0.1}s` }}
                />
              ))}
              {dayEvents.length > 3 && (
                <span className="more-events">+{dayEvents.length - 3}</span>
              )}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="event-calendar">
      {/* Calendar Title */}
      <div className="calendar-title">
        <h3>📅 Event Calendar</h3>
        <p className="calendar-subtitle">
          {allEvents.length === 0
            ? "No events available at the moment"
            : `Showing ${allEvents.length} upcoming event${allEvents.length === 1 ? '' : 's'}`
          }
        </p>
      </div>

      {/* Calendar Header */}
      <div className="calendar-header">
        <button className="nav-button" onClick={goToPreviousMonth} title="Previous Month">
          ‹
        </button>
        <div className="month-year">
          <h3>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
        </div>
        <button className="nav-button" onClick={goToNextMonth} title="Next Month">
          ›
        </button>
      </div>

      {/* Today Button */}
      <div className="calendar-controls">
        <button className="today-button" onClick={goToToday}>
          Today
        </button>
      </div>

      {/* Week Days Header */}
      <div className="calendar-weekdays">
        {weekDays.map(day => (
          <div key={day} className="weekday-header">{day}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="calendar-grid">
        {generateCalendarDays()}
      </div>

      {/* Event Details Popup */}
      {selectedEvent && (
        <div className="event-popup">
          <div className="event-popup-content">
            <div className="event-popup-header">
              <h4>{selectedEvent.title}</h4>
              {rsvpEvents.has(selectedEvent.id) && (
                <span className="interest-badge">✓ I'm Interested</span>
              )}
              <button
                className="close-popup"
                onClick={() => setSelectedEvent(null)}
                title="Close"
              >
                ×
              </button>
            </div>
            <div className="event-popup-body">
              <p className="event-popup-description">{selectedEvent.description}</p>
              <div className="event-popup-details">
                <div className="popup-detail-row">
                  <span className="popup-icon">📍</span>
                  <span><strong>Location:</strong> {selectedEvent.location}</span>
                </div>
                <div className="popup-detail-row">
                  <span className="popup-icon">🕒</span>
                  <span><strong>Time:</strong> {new Date(selectedEvent.date_time).toLocaleString()}</span>
                </div>
                <div className="popup-detail-row">
                  <span className="popup-icon">👤</span>
                  <span><strong>Organizer:</strong> {selectedEvent.organizer_email}</span>
                </div>
                <div className="popup-detail-row">
                  <span className="popup-icon">🎁</span>
                  <div>
                    <strong>Free Stuff:</strong>
                    <div className="popup-goods">
                      {selectedEvent.goodsProvided.map((good, index) => (
                        <span key={index} className="popup-good-tag">{good}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventCalendar;
