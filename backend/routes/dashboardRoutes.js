// backend/routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboardController');
const { isAuthenticated, isAdmin, isTutor, isSecurityOfficer, isParent } = require('../middleware/authMiddleware');

// Admin dashboard
router.get('/admin', isAdmin, DashboardController.adminDashboard);

// Parent dashboard
router.get('/parent', isParent, DashboardController.parentDashboard);

// Tutor dashboard
router.get('/tutor', isTutor, DashboardController.tutorDashboard);

// Tutor visit requests approval page
router.get('/tutor/visit-requests', isTutor, DashboardController.tutorVisitRequests);

// Security dashboard
router.get('/security', isSecurityOfficer, DashboardController.securityDashboard);

// Reports (sidebar links)
router.get('/admin/reports', isAdmin, (req, res) => {
  res.render('admin/reports', { session: req.session });
});

router.get('/tutor/reports', isTutor, (req, res) => {
  res.render('tutor/reports', { session: req.session });
});

// Generic dashboard route (redirects based on role)
router.get('/', isAuthenticated, (req, res) => {
  const role = req.session.userRole;
  
  switch(role) {
    case 'Admin':
      return res.redirect('/dashboard/admin');
    case 'Parent':
      return res.redirect('/dashboard/parent');
    case 'Tutor':
      return res.redirect('/dashboard/tutor');
    case 'Security Officer':
      return res.redirect('/dashboard/security');
    default:
      return res.status(403).send('Unknown role');
  }
});

module.exports = router;
