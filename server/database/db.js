const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

// Initialize database with tables
const initializeDatabase = () => {
  // Create users table
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('organizer', 'student')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Create events table
    db.run(`CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      location TEXT NOT NULL,
      date_time DATETIME NOT NULL,
      goods_provided TEXT NOT NULL,
      organizer_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (organizer_id) REFERENCES users (id)
    )`);

    // Create event_views table for tracking unique views
    db.run(`CREATE TABLE IF NOT EXISTS event_views (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL,
      viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES events (id),
      FOREIGN KEY (student_id) REFERENCES users (id),
      UNIQUE(event_id, student_id)
    )`);

    // Create event_rsvps table for tracking saves/interests
    db.run(`CREATE TABLE IF NOT EXISTS event_rsvps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL,
      rsvp_status TEXT DEFAULT 'interested',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES events (id),
      FOREIGN KEY (student_id) REFERENCES users (id),
      UNIQUE(event_id, student_id)
    )`);

    // Add image_url column if it doesn't exist
    db.run(`PRAGMA foreign_keys=off;`);
    db.run(`BEGIN TRANSACTION;`);
    
    // Check if image_url column exists
    db.get(`PRAGMA table_info(events)`, (err, row) => {
      if (err) {
        console.error('Error checking table info:', err);
        return;
      }
      
      // Add image_url column if it doesn't exist
      db.run(`ALTER TABLE events ADD COLUMN image_url TEXT;`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Error adding image_url column:', err);
        }
      });
    });
    
    db.run(`COMMIT;`);
    db.run(`PRAGMA foreign_keys=on;`);
  });
};

module.exports = { db, initializeDatabase };
