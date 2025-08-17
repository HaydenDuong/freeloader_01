const express = require('express');
const { db } = require('../database/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Track event view (students only)
router.post('/view/:eventId', authenticateToken, requireRole('student'), (req, res) => {
  try {
    const eventId = req.params.eventId;
    const studentId = req.user.id;

    // Insert or ignore (handles duplicate views from same student)
    db.run(
      'INSERT OR IGNORE INTO event_views (event_id, student_id) VALUES (?, ?)',
      [eventId, studentId],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Error tracking view' });
        }

        res.json({ 
          message: 'View tracked successfully',
          isNewView: this.changes > 0 
        });
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Track event save/RSVP (students only)
router.post('/save/:eventId', authenticateToken, requireRole('student'), (req, res) => {
  try {
    const eventId = req.params.eventId;
    const studentId = req.user.id;

    // Insert or replace to handle toggle behavior
    db.run(
      'INSERT OR REPLACE INTO event_saves (event_id, student_id) VALUES (?, ?)',
      [eventId, studentId],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Error tracking save' });
        }

        res.json({ 
          message: 'Save tracked successfully',
          saved: true
        });
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove event save/RSVP (students only)
router.delete('/save/:eventId', authenticateToken, requireRole('student'), (req, res) => {
  try {
    const eventId = req.params.eventId;
    const studentId = req.user.id;

    db.run(
      'DELETE FROM event_saves WHERE event_id = ? AND student_id = ?',
      [eventId, studentId],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Error removing save' });
        }

        res.json({ 
          message: 'Save removed successfully',
          saved: false
        });
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get event engagement metrics (organizers only)
router.get('/metrics/:eventId', authenticateToken, requireRole('organizer'), (req, res) => {
  try {
    const eventId = req.params.eventId;
    
    // First verify the event belongs to this organizer
    db.get(
      'SELECT id FROM events WHERE id = ? AND organizer_id = ?',
      [eventId, req.user.id],
      (err, event) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Error verifying event ownership' });
        }

        if (!event) {
          return res.status(404).json({ message: 'Event not found or access denied' });
        }

        // Get view count
        db.get(
          'SELECT COUNT(*) as view_count FROM event_views WHERE event_id = ?',
          [eventId],
          (err, viewResult) => {
            if (err) {
              console.error('Database error:', err);
              return res.status(500).json({ message: 'Error fetching view metrics' });
            }

            // Get save count
            db.get(
              'SELECT COUNT(*) as save_count FROM event_saves WHERE event_id = ?',
              [eventId],
              (err, saveResult) => {
                if (err) {
                  console.error('Database error:', err);
                  return res.status(500).json({ message: 'Error fetching save metrics' });
                }

                // Get recent activity (last 7 days)
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                
                db.get(
                  'SELECT COUNT(*) as recent_views FROM event_views WHERE event_id = ? AND viewed_at >= ?',
                  [eventId, weekAgo.toISOString()],
                  (err, recentViewResult) => {
                    if (err) {
                      console.error('Database error:', err);
                      return res.status(500).json({ message: 'Error fetching recent metrics' });
                    }

                    db.get(
                      'SELECT COUNT(*) as recent_saves FROM event_saves WHERE event_id = ? AND saved_at >= ?',
                      [eventId, weekAgo.toISOString()],
                      (err, recentSaveResult) => {
                        if (err) {
                          console.error('Database error:', err);
                          return res.status(500).json({ message: 'Error fetching recent save metrics' });
                        }

                        res.json({
                          eventId: parseInt(eventId),
                          metrics: {
                            totalViews: viewResult.view_count || 0,
                            totalSaves: saveResult.save_count || 0,
                            recentViews: recentViewResult.recent_views || 0,
                            recentSaves: recentSaveResult.recent_saves || 0
                          }
                        });
                      }
                    );
                  }
                );
              }
            );
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
