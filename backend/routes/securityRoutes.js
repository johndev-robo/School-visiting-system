const express = require('express');
const router = express.Router();
const securityAdminController = require('../controllers/securityAdminController');
const { isAuthenticated, isAdmin: isAdminUser, isSecurityOfficer } = require('../middleware/authMiddleware');

// Middleware: Ensure user is Admin
const adminOnly = (req, res, next) => {
  if (req.session && req.session.userRole !== 'Admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};

// ===== Security officer pages (linked from sidebar) =====

router.get('/visit-schedule', isSecurityOfficer, (req, res) => {
  res.render('security/visit_schedule', { session: req.session });
});

router.get('/log-entry', isSecurityOfficer, (req, res) => {
  res.render('security/log_entry', { session: req.session });
});

// ===== Student-Guardian Relationships =====

// Link a guardian to a student
router.post('/guardians/link', isAuthenticated, adminOnly, securityAdminController.linkGuardian);

// Get all guardians for a student
router.get('/students/:studentId/guardians', isAuthenticated, securityAdminController.getStudentGuardians);

// Get all students for a guardian
router.get('/guardians/:guardianId/students', isAuthenticated, securityAdminController.getGuardianStudents);

// Static paths must be registered before /guardians/:id so "remove" is not captured as an id
router.delete('/guardians/remove', isAuthenticated, adminOnly, securityAdminController.removeGuardianRelationship);

router.put('/guardians/set-primary', isAuthenticated, adminOnly, securityAdminController.setPrimaryGuardian);

router.delete('/guardians/:id', isAuthenticated, adminOnly, securityAdminController.removeGuardian);

// ===== Visiting Hour Policies =====

// Get all visiting hour policies
router.get('/policies', isAuthenticated, securityAdminController.getPolicies);

// Update a visiting hour policy
router.put('/policies/:id', isAuthenticated, adminOnly, securityAdminController.updatePolicy);

// ===== Dashboard =====

// Get security admin dashboard
router.get('/dashboard', isAuthenticated, adminOnly, securityAdminController.getDashboard);

module.exports = router;
