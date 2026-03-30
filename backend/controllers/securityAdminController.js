const StudentGuardian = require('../models/StudentGuardian');
const VisitingHourPolicy = require('../models/VisitingHourPolicy');
const User = require('../models/User');
const Student = require('../models/Student');

class SecurityAdminController {
  // Link student to guardian
  static async linkGuardian(req, res) {
    try {
      const { studentId, guardianId, relationship, isPrimary } = req.body;

      if (!studentId || !guardianId || !relationship) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const id = await StudentGuardian.linkGuardian(studentId, guardianId, relationship, isPrimary);
      
      res.status(201).json({
        message: 'Guardian linked successfully',
        id
      });
    } catch (err) {
      console.error('Error linking guardian:', err);
      res.status(500).json({ error: err.message });
    }
  }

  // Get guardians for a student
  static async getStudentGuardians(req, res) {
    try {
      const { studentId } = req.params;
      const guardians = await StudentGuardian.getByStudent(studentId);

      res.json(guardians);
    } catch (err) {
      console.error('Error fetching guardians:', err);
      res.status(500).json({ error: 'Failed to fetch guardians' });
    }
  }

  // Get students for a guardian
  static async getGuardianStudents(req, res) {
    try {
      const { guardianId } = req.params;
      const students = await StudentGuardian.getStudentsByGuardian(guardianId);

      res.json(students);
    } catch (err) {
      console.error('Error fetching students:', err);
      res.status(500).json({ error: 'Failed to fetch students' });
    }
  }

  // Remove guardian link
  static async removeGuardian(req, res) {
    try {
      const { id } = req.params;
      await StudentGuardian.removeGuardian(id);

      res.json({ message: 'Guardian link removed successfully' });
    } catch (err) {
      console.error('Error removing guardian:', err);
      res.status(500).json({ error: 'Failed to remove guardian' });
    }
  }

  // Manage visiting hour policies
  static async getPolicies(req, res) {
    try {
      const policies = await VisitingHourPolicy.getAll();
      res.json(policies);
    } catch (err) {
      console.error('Error fetching policies:', err);
      res.status(500).json({ error: 'Failed to fetch policies' });
    }
  }

  // Update visiting hour policy
  static async updatePolicy(req, res) {
    try {
      const { id } = req.params;
      const { occasion, description, allowedDays, startTime, endTime, maxDuration, requiresTeacher, advanceNotice } = req.body;

      await VisitingHourPolicy.update(id, {
        occasion,
        description,
        allowedDays,
        startTime,
        endTime,
        maxDuration,
        requiresTeacher,
        advanceNotice
      });

      res.json({ message: 'Policy updated successfully' });
    } catch (err) {
      console.error('Error updating policy:', err);
      res.status(500).json({ error: 'Failed to update policy' });
    }
  }

  // Remove guardian by student and guardian ID
  static async removeGuardianRelationship(req, res) {
    try {
      const { studentId, guardianId } = req.body;

      if (!studentId || !guardianId) {
        return res.status(400).json({ error: 'Missing studentId or guardianId' });
      }

      await StudentGuardian.deactivateGuardian(studentId, guardianId);
      
      res.json({ message: 'Guardian link removed successfully' });
    } catch (err) {
      console.error('Error removing guardian relationship:', err);
      res.status(500).json({ error: 'Failed to remove guardian' });
    }
  }

  // Set guardian as primary contact
  static async setPrimaryGuardian(req, res) {
    try {
      const { studentId, guardianId } = req.body;

      if (!studentId || !guardianId) {
        return res.status(400).json({ error: 'Missing studentId or guardianId' });
      }

      // First, set all guardians for this student to non-primary
      const db = require('../db');
      await db.execute(
        'UPDATE student_guardians SET is_primary = FALSE WHERE student_id = ?',
        [studentId]
      );

      // Then set the selected one as primary
      await db.execute(
        'UPDATE student_guardians SET is_primary = TRUE WHERE student_id = ? AND guardian_id = ?',
        [studentId, guardianId]
      );

      res.json({ message: 'Primary guardian updated successfully' });
    } catch (err) {
      console.error('Error setting primary guardian:', err);
      res.status(500).json({ error: 'Failed to set primary guardian' });
    }
  }

  // Get dashboard with statistics
  static async getDashboard(req, res) {
    try {
      // This would show relationship stats, policy effectiveness, etc.
      const guardians = await StudentGuardian.getAll();
      const policies = await VisitingHourPolicy.getAll();

      res.json({
        totalGuardianRelationships: guardians.length,
        visitingPolicies: policies.length,
        relationships: guardians
      });
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      res.status(500).json({ error: 'Failed to fetch dashboard' });
    }
  }
}

module.exports = SecurityAdminController;
