
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventsAPI, engagementAPI } from '../../utils/api';
import { Event } from '../../types';
import './Student.css';
import StudentEventList from './StudentEventList';

const SavedEvents: React.FC = () => {
  const [savedEvents, setSavedEvents] = useState<Event[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rsvpEvents, setRsvpEvents] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchAllEvents = async () => {
      try {
        const response = await eventsAPI.getAllEvents();
        setAllEvents(response.events);
      } catch (err: any) {
        setError('Failed to fetch events');
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllEvents();
  }, []);

  useEffect(() => {
    if (allEvents.length > 0) {
      const savedRsvps = localStorage.getItem('student_rsvps');
      if (savedRsvps) {
        try {
          const rsvpArray: number[] = JSON.parse(savedRsvps);
          const filteredEvents = allEvents.filter(event => rsvpArray.includes(event.id));
          setSavedEvents(filteredEvents);
          setRsvpEvents(new Set(rsvpArray));
        } catch (error) {
          console.error('Error loading RSVPs:', error);
        }
      }
    }
  }, [allEvents]);

  const handleRsvpToggle = async (eventId: number) => {
    const isCurrentlyRsvped = rsvpEvents.has(eventId);
    const newRsvpEvents = new Set(rsvpEvents);
    
    try {
      if (isCurrentlyRsvped) {
        // Remove save
        await engagementAPI.removeSave(eventId);
        newRsvpEvents.delete(eventId);
      } else {
        // Add save
        await engagementAPI.trackSave(eventId);
        newRsvpEvents.add(eventId);
      }
      
      setRsvpEvents(newRsvpEvents);
      const newSavedEvents = allEvents.filter(event => newRsvpEvents.has(event.id));
      setSavedEvents(newSavedEvents);
      // Keep localStorage in sync for immediate UI feedback
      localStorage.setItem('student_rsvps', JSON.stringify(Array.from(newRsvpEvents)));
    } catch (error) {
      console.error('Failed to update RSVP:', error);
      // Show user-friendly error or revert the change
    }
  };

  return (
    <div className="student-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Saved Events</h1>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="toolbar">
          <Link to="/student" className="back-to-dashboard-button">
            &larr; Back to Dashboard
          </Link>
        </div>
        {loading ? (
          <div className="loading">Loading saved events...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : savedEvents.length === 0 ? (
          <div className="no-events">
            <h2>No Saved Events</h2>
            <p>You haven't saved any events yet. Explore the dashboard to find events!</p>
          </div>
        ) : (
          <div className="events-sections">
            <div className="events-section">
              <StudentEventList 
                events={savedEvents} 
                rsvpEvents={rsvpEvents}
                onRsvpToggle={handleRsvpToggle}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SavedEvents;
