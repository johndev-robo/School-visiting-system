// backend/controllers/dashboardController.js
const Visit = require('../models/Visit');
const User = require('../models/User');
const Student = require('../models/Student');
const Notification = require('../models/Notification');

class DashboardController {
  // Admin Dashboard
  static async adminDashboard(req, res) {
    try {
      const visits = await Visit.getAll();
      const students = await Student.getAllWithGuardians();
      const users = await User.getAll();
      
      const stats = {
        totalVisits: visits ? visits.length : 0,
        pendingVisits: visits ? visits.filter(v => v.status === 'Pending').length : 0,
        totalStudents: students ? students.length : 0,
        totalUsers: users ? users.length : 0
      };
      
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.render('admin/dashboard', { stats, visits });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error loading admin dashboard');
    }
  }

  // Parent Dashboard
  static async parentDashboard(req, res) {
    try {
      const parentId = req.session.userId;
      const visits = await Visit.getByParent(parentId);
      const notifications = await Notification.getByUser(parentId);
      
      res.render('parent/dashboard', { 
        visits, 
        notifications,
        visitsCount: visits ? visits.length : 0,
        unreadNotifications: notifications ? notifications.filter(n => !n.read).length : 0
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error loading parent dashboard');
    }
  }

  // Tutor Dashboard
  static async tutorDashboard(req, res) {
    try {
      const visits = await Visit.getAll();
      
      res.render('tutor/dashboard', { 
        visits,
        visitsCount: visits ? visits.length : 0
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error loading tutor dashboard');
    }
  }

  // Security Officer Dashboard
  static async securityDashboard(req, res) {
    try {
      const visits = await Visit.getAll();
      
      res.render('security/dashboard', { 
        visits,
        visitsCount: visits ? visits.length : 0
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error loading security dashboard');
    }
  }

  // Tutor Visit Requests (for approval)
  static async tutorVisitRequests(req, res) {
    try {
      const visits = await Visit.getAll();
      // Filter for pending visits only
      const pendingVisits = visits.filter(v => v.status === 'Pending');
      
      res.render('tutor/visit_requests', { 
        visits: pendingVisits,
        visitsCount: pendingVisits ? pendingVisits.length : 0
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error loading visit requests');
    }
  }
}

module.exports = DashboardController;
