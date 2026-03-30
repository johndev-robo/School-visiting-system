const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notificationController');
const { isAuthenticated } = require('../middleware/authMiddleware');

router.get('/', isAuthenticated, NotificationController.list);
router.post('/mark-read', isAuthenticated, NotificationController.markRead);

module.exports = router;