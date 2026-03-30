const db = require('../db');
const StudentGuardian = require('./StudentGuardian');
const VisitingHourPolicy = require('./VisitingHourPolicy');

class Visit {
  // Create a visit with security checks and smart timing
  static async create({ parentId, studentId, date, startTime, endTime, occasion = 'Leisure Visit', reason, status = 'Pending' }) {
    // Security Check 1: Verify parent-child relationship
    const canRequest = await StudentGuardian.canRequestVisit(parentId, studentId);
    if (!canRequest) {
      throw new Error('Parent does not have custodial rights for this student');
    }

    // Security Check 2: Get policy for this occasion
    const policyValidation = await VisitingHourPolicy.validateVisitRequest(occasion, date, startTime, endTime);
    if (!policyValidation.valid) {
      throw new Error(`Policy violation: ${policyValidation.reason}`);
    }

    // Security Check 3: Check weekly limits
    const weeklyLimitExceeded = await VisitingHourPolicy.isWeeklyLimitExceeded(studentId, occasion);
    if (weeklyLimitExceeded) {
      const policy = await VisitingHourPolicy.getByOccasion(occasion);
      throw new Error(`Weekly limit exceeded for ${occasion}. Maximum ${policy.max_visits_per_week} visits per week.`);
    }

    // Create visit with smart timing
    const [result] = await db.execute(
      `INSERT INTO visits 
       (parent_id, student_id, visit_date, visit_time, visit_occasion, scheduled_start_time, scheduled_end_time, status, reason) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [parentId, studentId, date, startTime, occasion, startTime, endTime, status, reason]
    );
    return result.insertId;
  }

  // Get visits by parent with security enforcement
  static async getByParent(parentId) {
    try {
      const [rows] = await db.execute(
        `SELECT v.id, v.visit_date as date, v.visit_time as time, v.visit_occasion, 
                v.scheduled_start_time, v.scheduled_end_time, v.status, v.reason,
                s.name as student, s.id as student_id
         FROM visits v
         JOIN students s ON v.student_id = s.id
         WHERE v.parent_id = ?
         ORDER BY v.visit_date DESC`,
        [parentId]
      );
      return rows;
    } catch (err) {
      console.error('Error in getByParent:', err);
      throw err;
    }
  }

  // Get all visits (for Admin/Tutor)
  // Use LEFT JOINs so every visit row is listed even if user/student FK data is missing (INNER JOIN hid rows)
  static async getAll() {
    try {
      const [rows] = await db.execute(
        `SELECT v.id, v.visit_date as date, v.visit_time as time, v.visit_occasion,
                v.scheduled_start_time, v.scheduled_end_time, v.status, v.reason,
                COALESCE(u.name, '(unknown parent)') as parent,
                COALESCE(s.name, '(unknown student)') as student,
                v.actual_check_in_time, v.actual_check_out_time
         FROM visits v
         LEFT JOIN users u ON v.parent_id = u.id
         LEFT JOIN students s ON v.student_id = s.id
         ORDER BY v.visit_date DESC, v.id DESC`
      );
      return rows;
    } catch (err) {
      console.error('Error in getAll:', err);
      throw err;
    }
  }

  // Get visits by student
  static async getByStudent(studentId) {
    const [rows] = await db.execute(
      `SELECT v.id, v.visit_date as date, v.visit_time as time, v.visit_occasion,
              v.scheduled_start_time, v.scheduled_end_time, v.status, v.reason,
              u.name as parent, u.email
       FROM visits v
       JOIN users u ON v.parent_id = u.id
       WHERE v.student_id = ?
       ORDER BY v.visit_date DESC`,
      [studentId]
    );
    return rows;
  }

  // Check in a visit (security checkpoint)
  static async checkIn(visitId, checkInTime = new Date().toTimeString().slice(0, 8)) {
    const [result] = await db.execute(
      'UPDATE visits SET actual_check_in_time = ? WHERE id = ?',
      [checkInTime, visitId]
    );
    return result.affectedRows;
  }

  // Check out a visit (security checkpoint)
  static async checkOut(visitId, checkOutTime = new Date().toTimeString().slice(0, 8)) {
    const [result] = await db.execute(
      'UPDATE visits SET actual_check_out_time = ?, status = "Completed" WHERE id = ?',
      [checkOutTime, visitId]
    );
    return result.affectedRows;
  }

  // Get visit details with full information
  static async getById(id) {
    const [rows] = await db.execute(
      `SELECT v.*, u.name as parent_name, u.email as parent_email, u.phone as parent_phone,
              s.name as student_name, s.class as student_class,
              u2.name as verified_by_name
       FROM visits v
       LEFT JOIN users u ON v.parent_id = u.id
       LEFT JOIN students s ON v.student_id = s.id
       LEFT JOIN users u2 ON v.is_verified_by = u2.id
       WHERE v.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  // Update visit status
  static async updateStatus(visitId, status) {
    const [result] = await db.execute(
      'UPDATE visits SET status = ? WHERE id = ?',
      [status, visitId]
    );
    return result.affectedRows;
  }

  // Delete visit
  static async delete(visitId) {
    const [result] = await db.execute(
      'DELETE FROM visits WHERE id = ?',
      [visitId]
    );
    return result.affectedRows;
  }
}

module.exports = Visit;