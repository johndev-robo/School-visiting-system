// backend/app.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');

// Import database connection (promise-based pool)
const db = require('./db');

// Import routes
const routes = require('./routes');

// Middleware for auth
const { isAuthenticated } = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

// ----------------------------
// Body Parser
// ----------------------------
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ----------------------------
// Session Management
// ----------------------------
app.use(session({
  key: 'boarding_school_session',
  secret: process.env.SESSION_SECRET || 'supersecretkey',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 2 * 60 * 60 * 1000 } // 2 hours
}));

// ----------------------------
// Set View Engine
// ----------------------------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../frontend/views'));

// ----------------------------
// Make session available to all views
// ----------------------------
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// ----------------------------
// Serve Static Files
// ----------------------------
app.use('/css', express.static(path.join(__dirname, '../frontend/css')));
app.use('/js', express.static(path.join(__dirname, '../frontend/js')));
app.use('/components', express.static(path.join(__dirname, '../frontend/components')));
app.use('/images', express.static(path.join(__dirname, '../'))); // expose root files for static images

// ----------------------------
// Home Route (must be before API routes)
// ----------------------------
app.get('/', (req, res) => {
  res.render('index');
});

// ----------------------------
// Routes
// ----------------------------
app.use('/', routes); // all app routes are centralized

// ----------------------------
// 404 Handler
// ----------------------------
app.use((req, res) => {
  res.status(404).render('404');
});

// ----------------------------
// Global Error Handler
// ----------------------------
app.use((err, req, res, next) => {
  console.error('Global Error:', err);
  res.status(500).send('Something went wrong!');
});

// ----------------------------
// Start Server
// ----------------------------
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});