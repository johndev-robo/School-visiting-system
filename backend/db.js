// backend/db/db.js
require('dotenv').config();
const mysql = require('mysql2/promise');

// ----------------------------
// Create a single database connection pool with promises
// ----------------------------
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'boarding_school_visiting',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0
});

// ----------------------------
// Test the connection
// ----------------------------
pool.getConnection()
  .then(connection => {
    console.log('MySQL Connected ✅');

    connection.execute("ALTER TABLE visits ADD COLUMN reason TEXT")
      .then(() => {
        console.log('DB check: visits.reason column added.');
      })
      .catch(alterErr => {
        // Column might already exist
        if (alterErr.errno === 1060) { // duplicate column
          console.log('DB check: visits.reason already exists.');
        } else {
          console.warn('DB check warning:', alterErr.message);
        }
      })
      .finally(() => connection.release());
  })
  .catch(err => {
    console.error('MySQL Connection Error:', err.message);
    process.exit(1);
  });

// ----------------------------
// Export the pool for use in models (already promise-based)
// ----------------------------
module.exports = pool;