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
  // Compact mode forced ON. If you want to re-enable the toggle, replace the next line with:
  // const [compact, setCompact] = useState(true);
  const compact = true; // always compact

  // Get the start of the current week (Sunday)
  const getStartOfWeek = (date: Date) => {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay());
    start.setHours(0, 0, 0, 0);
    return start;
  };

  // Get the end of the current week (Saturday)
  const getEndOfWeek = (date: Date) => {
    const end = new Date(date);
    end.setDate(date.getDate() - date.getDay() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
  };

  const startOfWeek = getStartOfWeek(currentDate);

  // Navigation functions
  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Generate time slots (full day or compact range around events)
  const generateTimeSlots = () => {
    let startHour = 6;
    let endHour = 23;

    if (compact) {
      // Events within current week
      const weekEnd = new Date(startOfWeek);
      weekEnd.setDate(startOfWeek.getDate() + 7);
      const weekEvents = allEvents.filter(e => {
        const d = new Date(e.date_time);
        return d >= startOfWeek && d < weekEnd;
      });
      if (weekEvents.length > 0) {
        const hours = weekEvents.map(e => new Date(e.date_time).getHours());
        const min = Math.min(...hours);
        const max = Math.max(...hours);
        startHour = Math.max(6, min - 1); // buffer
        endHour = Math.min(23, max + 1);
        if (endHour - startHour < 6) {
          // ensure reasonable height
          endHour = Math.min(23, startHour + 6);
        }
      } else {
        // default typical daytime window
        startHour = 8;
        endHour = 18;
      }
    }
    const slots = [] as { hour: number; display: string; fullHour: number; }[];
    for (let hour = startHour; hour <= endHour; hour++) {
      const time12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 12 ? 12 : time12;
      slots.push({ hour, display: `${displayHour} ${ampm}`, fullHour: hour });
    }
    return slots;
  };

  // Get events for a specific date and hour
  const getEventsForDateTime = (date: Date, hour: number) => {
    return allEvents.filter(event => {
      const eventDate = new Date(event.date_time);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getHours() === hour
      );
    });
  };

  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Generate week days (7 columns)
  const generateWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(startOfWeek);
      currentDay.setDate(startOfWeek.getDate() + i);
      days.push(currentDay);
    }
    return days;
  };

  // Format week range for display
  const getWeekRange = () => {
    const start = startOfWeek;
    const end = new Date(startOfWeek);
    end.setDate(startOfWeek.getDate() + 6);

    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    if (start.getMonth() === end.getMonth()) {
      return `${monthNames[start.getMonth()]} ${start.getDate()}-${end.getDate()}, ${start.getFullYear()}`;
    } else {
      return `${monthNames[start.getMonth()]} ${start.getDate()} - ${monthNames[end.getMonth()]} ${end.getDate()}, ${start.getFullYear()}`;
    }
  };

  const timeSlots = generateTimeSlots();
  const weekDays = generateWeekDays();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="event-calendar weekly-view compact"> {/* previously dynamic: {`event-calendar weekly-view ${compact ? 'compact' : ''}` } */}
      {/* Calendar Header */}
      <div className="calendar-header">
        <button className="nav-button" onClick={goToPreviousWeek} title="Previous Week">
          ‹
        </button>
        <div className="week-range">
          <h3>{getWeekRange()}</h3>
        </div>
        <button className="nav-button" onClick={goToNextWeek} title="Next Week">
          ›
        </button>
      </div>

      {/* Today Button */}
      <div className="calendar-controls">
        <button className="today-button" onClick={goToToday}>
          This Week
        </button>
        {/* Full / Compact toggle preserved for future use:
        <button className="today-button" onClick={() => setCompact(c => !c)}>
          {compact ? 'Full Day' : 'Compact'}
        </button>
        */}
      </div>

      {/* Weekly Grid */}
      <div className="weekly-grid">
        {/* Header Row with Days */}
        <div className="weekly-header">
          <div className="time-column-header"></div>
          {weekDays.map((day, index) => (
            <div key={index} className={`day-header ${isToday(day) ? 'today' : ''}`}>
              <div className="day-name">{dayNames[index]}</div>
              <div className="day-date">{day.getDate()}</div>
            </div>
          ))}
        </div>

        {/* Time Grid */}
        <div className="time-grid">
          {timeSlots.map((timeSlot) => (
            <div key={timeSlot.hour} className="time-row">
              {/* Time Label */}
              <div className="time-label">
                {timeSlot.display}
              </div>

              {/* Day Cells */}
              {weekDays.map((day, dayIndex) => {
                const eventsAtTime = getEventsForDateTime(day, timeSlot.hour);

                return (
                  <div key={dayIndex} className="time-cell">
                    {eventsAtTime.map((event) => (
                      <div
                        key={event.id}
                        className={`event-block ${rsvpEvents.has(event.id) ? 'rsvp-event' : 'regular-event'}`}
                        onClick={() => {
                          setSelectedEvent(event);
                          onEventClick?.(event);
                        }}
                        title={`${event.title} - ${event.location}`}
                      >
                        <div className="event-time">
                          {new Date(event.date_time).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <div className="event-title">{event.title}</div>
                        <div className="event-location">{event.location}</div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
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
