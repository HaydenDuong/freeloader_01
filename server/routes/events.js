const express = require('express');
const { db } = require('../database/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Create event (organizers only)
router.post('/', authenticateToken, requireRole('organizer'), (req, res) => {
  try {
    const { title, description, location, dateTime, goodsProvided } = req.body;

    // Validate input
    if (!title || !description || !location || !dateTime || !goodsProvided) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Convert goodsProvided array to JSON string for storage
    const goodsProvidedJson = JSON.stringify(goodsProvided);

    // Create event
    db.run(
      'INSERT INTO events (title, description, location, date_time, goods_provided, organizer_id) VALUES (?, ?, ?, ?, ?, ?)',
      [title, description, location, dateTime, goodsProvidedJson, req.user.id],
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
          goodsProvided: JSON.parse(event.goods_provided)
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
          goodsProvided: JSON.parse(event.goods_provided)
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
    const { title, description, location, dateTime, goodsProvided } = req.body;

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
          'UPDATE events SET title = ?, description = ?, location = ?, date_time = ?, goods_provided = ? WHERE id = ? AND organizer_id = ?',
          [title, description, location, dateTime, goodsProvidedJson, eventId, req.user.id],
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

module.exports = router;
