const express = require('express');
const { db } = require('../database/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get student interests
router.get('/interests', authenticateToken, requireRole('student'), (req, res) => {
    const userId = req.user.id;

    db.all('SELECT tag FROM student_interests WHERE user_id = ?', [userId], (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Error fetching interests' });
        }
        const tags = rows.map(row => row.tag);
        res.json({ interests: tags });
    });
});


// Update student interests
router.put('/interests', authenticateToken, requireRole('student'), (req, res) => {
    const userId = req.user.id;
    const { interests } = req.body; // Expecting an array of strings

    if (!Array.isArray(interests)) {
        return res.status(400).json({ message: 'Interests must be an array' });
    }

    db.serialize(() => {
        // Begin a transaction
        db.run('BEGIN TRANSACTION');

        // Delete old interests
        db.run('DELETE FROM student_interests WHERE user_id = ?', [userId], function(err) {
            if (err) {
                db.run('ROLLBACK');
                console.error('Database error on delete:', err);
                return res.status(500).json({ message: 'Error updating interests' });
            }

            // Insert new interests
            const stmt = db.prepare('INSERT INTO student_interests (user_id, tag) VALUES (?, ?)');
            let completedInserts = 0;
            let insertError = null;

            if (interests.length === 0) {
                // If interests is empty, just commit the deletion
                db.run('COMMIT', (commitErr) => {
                    if (commitErr) {
                        console.error('Database error on commit:', commitErr);
                        return res.status(500).json({ message: 'Error updating interests' });
                    }
                    return res.status(200).json({ message: 'Interests updated successfully' });
                });
                return;
            }

            interests.forEach(tag => {
                stmt.run(userId, tag, function(err) {
                    if (err) {
                        insertError = err;
                    }
                    completedInserts++;

                    if (completedInserts === interests.length) {
                        stmt.finalize();
                        if (insertError) {
                            db.run('ROLLBACK');
                            console.error('Database error on insert:', insertError);
                            return res.status(500).json({ message: 'Error updating interests' });
                        } else {
                            db.run('COMMIT', (commitErr) => {
                                if (commitErr) {
                                    console.error('Database error on commit:', commitErr);
                                    return res.status(500).json({ message: 'Error updating interests' });
                                }
                                res.status(200).json({ message: 'Interests updated successfully' });
                            });
                        }
                    }
                });
            });
        });
    });
});

module.exports = router;
