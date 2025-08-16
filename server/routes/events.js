const express = require('express');
const { db } = require('../database/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Create event (organizers only)
router.post('/', authenticateToken, requireRole('organizer'), (req, res) => {
  try {
    const { title, description, location, dateTime, goodsProvided, imageUrl } = req.body;

    // Validate input
    if (!title || !description || !location || !dateTime || !goodsProvided) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Convert goodsProvided array to JSON string for storage
    const goodsProvidedJson = JSON.stringify(goodsProvided);

    // Create event
    db.run(
      'INSERT INTO events (title, description, location, date_time, goods_provided, image_url, organizer_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, description, location, dateTime, goodsProvidedJson, imageUrl || null, req.user.id],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Error creating event' });
        }

        res.status(201).json({
          message: 'Event created successfully',
          event: {
            id: this.lastID,
            title,
            description,
            location,
            date_time: dateTime,
            goodsProvided,
            image_url: imageUrl || null,
            organizer_id: req.user.id,
            created_at: new Date().toISOString()
          }
        });
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all events (students only)
router.get('/', authenticateToken, requireRole('student'), (req, res) => {
  try {
    db.all(
      `SELECT e.*, u.email as organizer_email 
       FROM events e 
       JOIN users u ON e.organizer_id = u.id 
       ORDER BY e.date_time ASC`,
      [],
      (err, events) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Error fetching events' });
        }

        // Parse goods_provided JSON for each event
        const parsedEvents = events.map(event => ({
          ...event,
          goodsProvided: JSON.parse(event.goods_provided),
          image_url: event.image_url
        }));

        res.json({ events: parsedEvents });
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get events created by organizer (organizers only)
router.get('/my-events', authenticateToken, requireRole('organizer'), (req, res) => {
  try {
    db.all(
      'SELECT * FROM events WHERE organizer_id = ? ORDER BY date_time ASC',
      [req.user.id],
      (err, events) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Error fetching events' });
        }

        // Parse goods_provided JSON for each event
        const parsedEvents = events.map(event => ({
          ...event,
          goodsProvided: JSON.parse(event.goods_provided),
          image_url: event.image_url
        }));

        res.json({ events: parsedEvents });
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update event (organizers only - can only edit their own events)
router.put('/:id', authenticateToken, requireRole('organizer'), (req, res) => {
  try {
    const eventId = req.params.id;
    const { title, description, location, dateTime, goodsProvided, imageUrl } = req.body;

    // Validate input
    if (!title || !description || !location || !dateTime || !goodsProvided) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // First, check if the event exists and belongs to the organizer
    db.get(
      'SELECT * FROM events WHERE id = ? AND organizer_id = ?',
      [eventId, req.user.id],
      (err, event) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Error checking event ownership' });
        }

        if (!event) {
          return res.status(404).json({ message: 'Event not found or you do not have permission to edit it' });
        }

        // Convert goodsProvided array to JSON string for storage
        const goodsProvidedJson = JSON.stringify(goodsProvided);

        // Update the event
        db.run(
          'UPDATE events SET title = ?, description = ?, location = ?, date_time = ?, goods_provided = ?, image_url = ? WHERE id = ? AND organizer_id = ?',
          [title, description, location, dateTime, goodsProvidedJson, imageUrl || null, eventId, req.user.id],
          function(err) {
            if (err) {
              console.error('Database error:', err);
              return res.status(500).json({ message: 'Error updating event' });
            }

            if (this.changes === 0) {
              return res.status(404).json({ message: 'Event not found or no changes made' });
            }

            res.json({
              message: 'Event updated successfully',
              event: {
                id: parseInt(eventId),
                title,
                description,
                location,
                date_time: dateTime,
                goodsProvided,
                image_url: imageUrl || null,
                organizer_id: req.user.id,
                created_at: new Date().toISOString()
              }
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete event (organizers only - can only delete their own events)
router.delete('/:id', authenticateToken, requireRole('organizer'), (req, res) => {
  try {
    const eventId = req.params.id;

    // First, check if the event exists and belongs to the organizer
    db.get(
      'SELECT * FROM events WHERE id = ? AND organizer_id = ?',
      [eventId, req.user.id],
      (err, event) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Error checking event ownership' });
        }

        if (!event) {
          return res.status(404).json({ message: 'Event not found or you do not have permission to delete it' });
        }

        // Delete the event
        db.run(
          'DELETE FROM events WHERE id = ? AND organizer_id = ?',
          [eventId, req.user.id],
          function(err) {
            if (err) {
              console.error('Database error:', err);
              return res.status(500).json({ message: 'Error deleting event' });
            }

            if (this.changes === 0) {
              return res.status(404).json({ message: 'Event not found' });
            }

            res.json({
              message: 'Event deleted successfully',
              deletedEventId: parseInt(eventId)
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Track event view (students only)
router.post('/:id/view', authenticateToken, requireRole('student'), (req, res) => {
  try {
    const eventId = req.params.id;
    const studentId = req.user.id;

    // Insert or ignore if already viewed
    db.run(
      'INSERT OR IGNORE INTO event_views (event_id, student_id) VALUES (?, ?)',
      [eventId, studentId],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Error tracking view' });
        }

        res.json({ message: 'View tracked successfully' });
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle RSVP for event (students only)
router.post('/:id/rsvp', authenticateToken, requireRole('student'), (req, res) => {
  try {
    const eventId = req.params.id;
    const studentId = req.user.id;
    const { action } = req.body; // 'add' or 'remove'

    if (action === 'add') {
      // Add RSVP
      db.run(
        'INSERT OR REPLACE INTO event_rsvps (event_id, student_id, rsvp_status, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
        [eventId, studentId, 'interested'],
        function(err) {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Error adding RSVP' });
          }

          res.json({ message: 'RSVP added successfully', rsvp: true });
        }
      );
    } else if (action === 'remove') {
      // Remove RSVP
      db.run(
        'DELETE FROM event_rsvps WHERE event_id = ? AND student_id = ?',
        [eventId, studentId],
        function(err) {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Error removing RSVP' });
          }

          res.json({ message: 'RSVP removed successfully', rsvp: false });
        }
      );
    } else {
      res.status(400).json({ message: 'Invalid action. Use "add" or "remove"' });
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student's RSVPs (students only)
router.get('/my-rsvps', authenticateToken, requireRole('student'), (req, res) => {
  try {
    db.all(
      'SELECT event_id FROM event_rsvps WHERE student_id = ?',
      [req.user.id],
      (err, rsvps) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Error fetching RSVPs' });
        }

        const rsvpEventIds = rsvps.map(rsvp => rsvp.event_id);
        res.json({ rsvpEventIds });
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get engagement metrics for organizer's events (organizers only)
router.get('/metrics', authenticateToken, requireRole('organizer'), (req, res) => {
  try {
    const organizerId = req.user.id;

    // Get all events with their metrics
    db.all(`
      SELECT 
        e.id,
        e.title,
        e.date_time,
        e.created_at,
        COALESCE(v.unique_views, 0) as unique_views,
        COALESCE(r.rsvp_count, 0) as rsvp_count
      FROM events e
      LEFT JOIN (
        SELECT event_id, COUNT(DISTINCT student_id) as unique_views
        FROM event_views 
        GROUP BY event_id
      ) v ON e.id = v.event_id
      LEFT JOIN (
        SELECT event_id, COUNT(DISTINCT student_id) as rsvp_count
        FROM event_rsvps 
        GROUP BY event_id
      ) r ON e.id = r.event_id
      WHERE e.organizer_id = ?
      ORDER BY e.created_at DESC
    `, [organizerId], (err, events) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Error fetching metrics' });
      }

      // Calculate totals
      const totalEvents = events.length;
      const totalViews = events.reduce((sum, event) => sum + event.unique_views, 0);
      const totalRsvps = events.reduce((sum, event) => sum + event.rsvp_count, 0);
      const avgViewsPerEvent = totalEvents > 0 ? (totalViews / totalEvents).toFixed(1) : 0;
      const avgRsvpsPerEvent = totalEvents > 0 ? (totalRsvps / totalEvents).toFixed(1) : 0;

      res.json({
        events,
        summary: {
          totalEvents,
          totalViews,
          totalRsvps,
          avgViewsPerEvent: parseFloat(avgViewsPerEvent),
          avgRsvpsPerEvent: parseFloat(avgRsvpsPerEvent)
        }
      });
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
