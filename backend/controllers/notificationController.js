const Notification = require('../models/Notification');

class NotificationController {
  static async list(req, res) {
    try {
      const userId = req.session.userId;
      const notifications = await Notification.getByUser(userId);

      // Check if this is an API request or a view request
      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        // API request - return JSON
        res.json({ notifications });
      } else {
        // View request - render the notifications page
        res.render('notifications', {
          notifications: notifications || [],
          session: req.session
        });
      }
    } catch (err) {
      console.error(err);
      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        res.status(500).json({ error: 'Error fetching notifications' });
      } else {
        res.status(500).render('404', { session: req.session });
      }
    }
  }

  static async markRead(req, res) {
    try {
      const { id } = req.body;
      await Notification.markAsRead(id);
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: 'Failed to mark notification as read' });
    }
  }
}

module.exports = NotificationController;