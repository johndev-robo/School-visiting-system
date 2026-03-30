// backend/routes/index.js
const express = require('express');
const router = express.Router();

// Import all route modules
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const visitRoutes = require('./visitRoutes');
const notificationRoutes = require('./notificationRoutes');
const studentRoutes = require('./studentRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const securityRoutes = require('./securityRoutes');

// ----------------------------
// Mount routes on proper paths
// ----------------------------
router.use('/auth', authRoutes);                       // Authentication routes
router.use('/users', userRoutes);                     // User management routes
router.use('/visits', visitRoutes);                   // Visit management routes
router.use('/notifications', notificationRoutes);     // Notification routes
router.use('/students', studentRoutes);               // Student management routes
router.use('/dashboard', dashboardRoutes);            // Dashboard routes
router.use('/security', securityRoutes);              // Security & Custodial routes

module.exports = router;