
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Event } from '../../types';
import { eventsAPI } from '../../utils/api';
import './Student.css';

const StudentEventDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [rsvpEvents, setRsvpEvents] = useState<Set<number>>(new Set());

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const res = await eventsAPI.getAllEvents();
                const found = res.events.find(e => e.id === Number(id));
                setEvent(found || null);
                if (!found) setError('Event not found.');
            } catch (err) {
                setError('Failed to fetch event.');
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
        loadRsvpData();
    }, [id]);

    // Load RSVP data from localStorage
    const loadRsvpData = () => {
        const savedRsvps = localStorage.getItem('student_rsvps');
        if (savedRsvps) {
            try {
                const rsvpArray = JSON.parse(savedRsvps);
                setRsvpEvents(new Set(rsvpArray));
            } catch (error) {
                console.error('Error loading RSVPs:', error);
            }
        }
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

    const isEventSoon = (dateString: string) => {
        const eventDate = new Date(dateString);
        const now = new Date();
        const timeDiff = eventDate.getTime() - now.getTime();
        const hoursDiff = timeDiff / (1000 * 3600);
        return hoursDiff <= 24 && hoursDiff > 0; // Within 24 hours
    };

    const isPastEvent = (dateString: string) => {
        const eventDate = new Date(dateString);
        const now = new Date();
        return eventDate.getTime() <= now.getTime();
    };

    const handleRsvpToggle = (eventId: number) => {
        const newRsvpEvents = new Set(rsvpEvents);
        if (newRsvpEvents.has(eventId)) {
            newRsvpEvents.delete(eventId);
        } else {
            newRsvpEvents.add(eventId);
        }
        setRsvpEvents(newRsvpEvents);

        // Save to localStorage
        localStorage.setItem('student_rsvps', JSON.stringify(Array.from(newRsvpEvents)));
    };

    if (loading) return (
        <div className="student-dashboard">
            <div className="loading">Loading event details...</div>
        </div>
    );

    if (error) return (
        <div className="student-dashboard">
            <div className="error-message">{error}</div>
        </div>
    );

    if (!event) return null;

    const isPast = isPastEvent(event.date_time);
    const isRsvped = rsvpEvents.has(event.id);

    return (
        <div className="student-dashboard">

            <header className="dashboard-header">
                <div className="header-content">
                    <h1>Event Details</h1>
                    <div className="toolbar">
                        <button
                            onClick={() => navigate('/student')}
                            className="back-to-dashboard-button"
                        >
                            &larr; Back to Dashboard
                        </button>
                    </div>
                </div>

            </header>

            <main className="dashboard-main">


                <div style={{
                    maxWidth: '75vw',
                    minHeight: '100vh',
                    backgroundColor: '#f8f9fa',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    margin: '-1rem auto 0 auto',
                    padding: '0',
                }}>
                    {/* Hero Banner */}
                    <div style={{
                        height: '300px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        position: 'relative',
                        overflow: 'hidden',
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0,0,0,0.3)'
                        }}></div>
                        <div style={{
                            position: 'absolute',
                            bottom: '2rem',
                            left: '2rem',
                            color: 'white',
                            zIndex: 2
                        }}>
                            <h2 style={{
                                fontSize: '0.9rem',
                                fontWeight: '500',
                                margin: '0 0 0.5rem 0',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                opacity: '0.9'
                            }}>
                                Free Student Event
                            </h2>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div style={{
                        maxWidth: '900px',
                        margin: '0 auto',
                        padding: '2rem 2rem 0 2rem',
                        position: 'relative',
                        zIndex: 1
                    }}>
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                            overflow: 'hidden'
                        }}>
                            {/* Event Header */}
                            <div style={{
                                padding: '2rem 2rem 1.5rem 2rem',
                                borderBottom: '1px solid #e9ecef'
                            }}>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr auto',
                                    gap: '2rem',
                                    alignItems: 'start'
                                }}>
                                    <div>
                                        <h1 style={{
                                            fontSize: '2.25rem',
                                            fontWeight: '700',
                                            color: '#2c3e50',
                                            margin: '0 0 1rem 0',
                                            lineHeight: '1.2'
                                        }}>
                                            {event.title}
                                        </h1>

                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            marginBottom: '1rem'
                                        }}>
                                            <span style={{
                                                fontSize: '1.1rem',
                                                fontWeight: '600',
                                                color: '#495057'
                                            }}>
                                                {formatDate(event.date_time)}
                                            </span>

                                            {isEventSoon(event.date_time) && !isPast && (
                                                <span style={{
                                                    background: '#28a745',
                                                    color: 'white',
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '4px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600',
                                                    textTransform: 'uppercase'
                                                }}>
                                                    Starting Soon
                                                </span>
                                            )}

                                            {isPast && (
                                                <span style={{
                                                    background: '#6c757d',
                                                    color: 'white',
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '4px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600',
                                                    textTransform: 'uppercase'
                                                }}>
                                                    Past Event
                                                </span>
                                            )}
                                        </div>

                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            color: '#6c757d'
                                        }}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                            </svg>
                                            <span style={{ fontSize: '1rem' }}>
                                                {event.location}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '1rem',
                                        alignItems: 'flex-end'
                                    }}>
                                        {!isPast && (
                                            <button
                                                onClick={() => handleRsvpToggle(event.id)}
                                                style={{
                                                    background: isRsvped ? '#28a745' : '#dc3545',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '1rem 2rem',
                                                    borderRadius: '6px',
                                                    fontSize: '1rem',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    minWidth: '160px',
                                                    textAlign: 'center',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                onMouseOver={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                                                }}
                                                onMouseOut={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.boxShadow = 'none';
                                                }}
                                            >
                                                {isRsvped ? 'Registered' : 'Select tickets'}
                                            </button>
                                        )}

                                        <div style={{
                                            textAlign: 'right',
                                            fontSize: '0.9rem',
                                            color: '#6c757d'
                                        }}>
                                            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                                                NEED HELP?
                                            </div>
                                            <button style={{
                                                background: 'none',
                                                border: '1px solid #007bff',
                                                color: '#007bff',
                                                padding: '0.5rem 1rem',
                                                borderRadius: '4px',
                                                fontSize: '0.85rem',
                                                cursor: 'pointer'
                                            }}>
                                                Contact organizer
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Event Details */}
                            <div style={{
                                padding: '2rem',
                                display: 'grid',
                                gridTemplateColumns: '2fr 1fr',
                                gap: '3rem'
                            }}>
                                {/* Left Column - Description */}
                                <div>
                                    <div style={{
                                        fontSize: '1rem',
                                        lineHeight: '1.6',
                                        color: '#495057',
                                        marginBottom: '2rem'
                                    }}>
                                        {event.description}
                                    </div>

                                    {/* What's Included */}
                                    {event.goodsProvided && event.goodsProvided.length > 0 && (
                                        <div style={{ marginBottom: '2rem' }}>
                                            <h3 style={{
                                                fontSize: '1.1rem',
                                                fontWeight: '600',
                                                color: '#2c3e50',
                                                marginBottom: '1rem'
                                            }}>
                                                What's Included
                                            </h3>
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                                gap: '0.75rem'
                                            }}>
                                                {event.goodsProvided.map((good, index) => (
                                                    <div
                                                        key={index}
                                                        style={{
                                                            background: '#f8f9fa',
                                                            padding: '0.75rem 1rem',
                                                            borderRadius: '6px',
                                                            border: '1px solid #e9ecef',
                                                            fontSize: '0.9rem',
                                                            color: '#495057'
                                                        }}
                                                    >
                                                        &bull; {good}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div style={{
                                        fontSize: '0.85rem',
                                        color: '#6c757d',
                                        fontStyle: 'italic',
                                        borderTop: '1px solid #e9ecef',
                                        paddingTop: '1rem'
                                    }}>
                                        All events are free and open to students. Please bring your student ID for verification.
                                    </div>
                                </div>

                                {/* Right Column - Location & Details */}
                                <div>
                                    <div style={{
                                        background: '#f8f9fa',
                                        padding: '1.5rem',
                                        borderRadius: '8px',
                                        marginBottom: '1.5rem'
                                    }}>
                                        <h3 style={{
                                            fontSize: '1rem',
                                            fontWeight: '600',
                                            color: '#2c3e50',
                                            marginBottom: '1rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>
                                            Location
                                        </h3>
                                        <div style={{
                                            fontSize: '0.95rem',
                                            color: '#495057',
                                            lineHeight: '1.5'
                                        }}>
                                            {event.location}
                                        </div>
                                    </div>

                                    <div style={{
                                        background: '#f8f9fa',
                                        padding: '1.5rem',
                                        borderRadius: '8px'
                                    }}>
                                        <h3 style={{
                                            fontSize: '1rem',
                                            fontWeight: '600',
                                            color: '#2c3e50',
                                            marginBottom: '1rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>
                                            Organizer
                                        </h3>
                                        <div style={{
                                            fontSize: '0.95rem',
                                            color: '#495057'
                                        }}>
                                            {event.organizer_email}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default StudentEventDetails;
