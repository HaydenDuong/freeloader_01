const express = require('express');
const { db } = require('../database/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get notifications for logged-in student
router.get('/', authenticateToken, requireRole('student'), (req, res) => {
  const userId = req.user.id;
  db.all(
    `SELECT n.*, e.title as event_title, e.date_time as event_date_time, e.tags as event_tags
     FROM notifications n
     JOIN events e ON n.event_id = e.id
     WHERE n.user_id = ?
     ORDER BY n.created_at DESC
     LIMIT 100`,
    [userId],
    (err, rows) => {
      if (err) {
        console.error('Error fetching notifications:', err);
        return res.status(500).json({ message: 'Error fetching notifications' });
      }
      const notifications = rows.map(r => ({
        id: r.id,
        event_id: r.event_id,
        message: r.message,
        matched_tags: JSON.parse(r.matched_tags || '[]'),
        is_read: !!r.is_read,
        created_at: r.created_at,
        event: {
          id: r.event_id,
          title: r.event_title,
          date_time: r.event_date_time,
          tags: JSON.parse(r.event_tags || '[]'),
        }
      }));
      res.json({ notifications });
    }
  );
});

// Mark notifications as read
router.post('/mark-read', authenticateToken, requireRole('student'), (req, res) => {
  const userId = req.user.id;
  const { ids } = req.body; // optional array of notification ids

  if (ids && !Array.isArray(ids)) {
    return res.status(400).json({ message: 'ids must be an array' });
  }

  const query = ids && ids.length > 0
    ? `UPDATE notifications SET is_read = 1 WHERE user_id = ? AND id IN (${ids.map(() => '?').join(',')})`
    : `UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0`;
  const params = ids && ids.length > 0 ? [userId, ...ids] : [userId];
  db.run(query, params, function(err) {
    if (err) {
      console.error('Error marking notifications read:', err);
      return res.status(500).json({ message: 'Error updating notifications' });
    }
    res.json({ message: 'Notifications updated', updated: this.changes });
  });
});

// Get unread count
router.get('/unread-count', authenticateToken, requireRole('student'), (req, res) => {
  const userId = req.user.id;
  db.get('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0', [userId], (err, row) => {
    if (err) {
      console.error('Error fetching unread count:', err);
      return res.status(500).json({ message: 'Error fetching unread count' });
    }
    res.json({ count: row.count });
  });
});

module.exports = router;
