const express = require('express');
const router = express.Router();
const VisitController = require('../controllers/visitController');
const { isAuthenticated, isAdmin, canViewAllVisits } = require('../middleware/authMiddleware');

// Parent routes - request and view visits
router.get('/request', isAuthenticated, VisitController.requestVisitPage);
router.post('/request', isAuthenticated, VisitController.create);
router.get('/status', isAuthenticated, VisitController.listByParent);

// Smart time recommendations
router.get('/time-recommendations', isAuthenticated, VisitController.getTimeRecommendations);

// Visiting hour policies
router.get('/policies', isAuthenticated, VisitController.getPolicies);

// Staff routes — list all visits (status changes remain admin-only in the view)
router.get('/all', canViewAllVisits, VisitController.listAll);
router.post('/update-status', isAdmin, VisitController.updateStatus);
router.delete('/:id', isAdmin, VisitController.delete);

// Security checkpoint - Check in/out
router.post('/check-in', isAuthenticated, VisitController.checkIn);
router.post('/check-out', isAuthenticated, VisitController.checkOut);

module.exports = router;