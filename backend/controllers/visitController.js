const Visit = require('../models/Visit');
const Student = require('../models/Student');
const StudentGuardian = require('../models/StudentGuardian');
const VisitingHourPolicy = require('../models/VisitingHourPolicy');

class VisitController {
  // Get request visit page with student list (only for their own children)
  static async requestVisitPage(req, res) {
    try {
      const parentId = req.session.userId;
      // Only show students linked to this parent
      const students = await StudentGuardian.getStudentsByGuardian(parentId);
      const policies = await VisitingHourPolicy.getAll();
      
      res.render('parent/request_visit', { 
        students, 
        policies,
        occasions: ['Academic Visit', 'Medication Drop-off', 'Lunch Supervision', 'Leisure Visit', 'Emergency', 'Other']
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error loading request visit page');
    }
  }

  // Get smart time recommendations based on occasion
  static async getTimeRecommendations(req, res) {
    try {
      const { occasion, date } = req.query;
      
      if (!occasion || !date) {
        return res.status(400).json({ error: 'Occasion and date required' });
      }

      const recommendations = await VisitingHourPolicy.getRecommendedTimeSlot(occasion, date);
      res.json(recommendations);
    } catch (err) {
      console.error('Error getting recommendations:', err);
      res.status(500).json({ error: 'Failed to get time recommendations' });
    }
  }

  // List parent's visits
  static async listByParent(req, res) {
    try {
      const parentId = req.session.userId;
      const visits = await Visit.getByParent(parentId);
      res.render('parent/visit_status', { visits });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error fetching visits');
    }
  }

  // List all visits (admin view)
  static async listAll(req, res) {
    try {
      const visits = await Visit.getAll();
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.render('admin/visit_management', { visits, session: req.session });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error fetching visits');
    }
  }

  // Create visit with security checks and smart timing
  static async create(req, res) {
    try {
      const { studentId, date, occasion, startTime, endTime, reason } = req.body;
      const parentId = req.session.userId;

      // Validate required fields
      if (!studentId || !date || !occasion || !startTime || !endTime) {
        return res.status(400).json({ 
          error: 'Missing required fields: studentId, date, occasion, startTime, endTime' 
        });
      }

      // Security Check: Ensure parent can only request for their own children
      const canRequest = await StudentGuardian.canRequestVisit(parentId, studentId);
      if (!canRequest) {
        return res.status(403).json({ 
          error: 'You do not have permission to request visits for this student' 
        });
      }

      // Validate against visiting hour policy
      const validation = await VisitingHourPolicy.validateVisitRequest(occasion, date, startTime, endTime);
      if (!validation.valid) {
        return res.status(400).json({ 
          error: validation.reason 
        });
      }

      // Create visit
      const visitId = await Visit.create({
        parentId,
        studentId,
        date,
        startTime,
        endTime,
        occasion,
        reason: reason || null,
        status: 'Pending'
      });

      // JSON fetch sends Content-Type: application/json; browsers use Accept: */* not application/json
      const wantsJson =
        req.is('json') ||
        (req.headers.accept && req.headers.accept.includes('application/json'));
      if (wantsJson) {
        res.status(201).json({
          message: 'Visit request submitted successfully',
          visitId,
          validation
        });
      } else {
        res.redirect('/visits/status');
      }
    } catch (err) {
      console.error('Error creating visit:', err);
      if (res.headersSent) return;
      
      res.status(500).json({ 
        error: err.message || 'Error creating visit request'
      });
    }
  }

  // Update visit status (admin only)
  static async updateStatus(req, res) {
    try {
      const { id, status } = req.body;
      const visitId = parseInt(id, 10);
      if (!visitId || Number.isNaN(visitId) || !status) {
        return res.status(400).json({ success: false, error: 'Invalid visit id or status' });
      }
      const affected = await Visit.updateStatus(visitId, status);
      if (affected === 0) {
        return res.status(404).json({ success: false, error: 'Visit not found' });
      }
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: 'Update failed' });
    }
  }

  // Check in visitor (security checkpoint)
  static async checkIn(req, res) {
    try {
      const { visitId } = req.body;
      const securityOfficerId = req.session.userId;

      // Get visit details
      const visit = await Visit.getById(visitId);
      if (!visit) {
        return res.status(404).json({ error: 'Visit not found' });
      }

      // Verify custodial rights at checkpoint
      const verification = await StudentGuardian.verifyCustodialRights(visit.parent_id, visit.student_id);
      if (!verification.verified) {
        return res.status(403).json({ 
          error: verification.reason,
          visitor: visit.parent_name
        });
      }

      // Check in the visit
      await Visit.checkIn(visitId);

      res.json({
        success: true,
        message: `${visit.parent_name} checked in for ${visit.student_name}`,
        visit: {
          parent: visit.parent_name,
          student: visit.student_name,
          occasion: visit.visit_occasion,
          startTime: visit.scheduled_start_time,
          endTime: visit.scheduled_end_time,
          requiresSupervision: verification.requiresSupervision
        }
      });
    } catch (err) {
      console.error('Error checking in:', err);
      res.status(500).json({ error: 'Check-in failed' });
    }
  }

  // Check out visitor (security checkpoint)
  static async checkOut(req, res) {
    try {
      const { visitId } = req.body;

      const visit = await Visit.getById(visitId);
      if (!visit) {
        return res.status(404).json({ error: 'Visit not found' });
      }

      await Visit.checkOut(visitId);

      res.json({
        success: true,
        message: `${visit.parent_name} checked out`,
        duration: visit.scheduled_end_time ? 'On schedule' : 'Overtime'
      });
    } catch (err) {
      console.error('Error checking out:', err);
      res.status(500).json({ error: 'Check-out failed' });
    }
  }

  // Delete visit (cancel)
  static async delete(req, res) {
    try {
      const { id } = req.params;
      await Visit.delete(id);
      res.redirect('/visits/all');
    } catch (err) {
      console.error(err);
      res.status(500).send('Error deleting visit');
    }
  }

  // Get visiting hour policies
  static async getPolicies(req, res) {
    try {
      const policies = await VisitingHourPolicy.getAll();
      res.json(policies);
    } catch (err) {
      console.error('Error fetching policies:', err);
      res.status(500).json({ error: 'Failed to fetch policies' });
    }
  }
}

module.exports = VisitController;