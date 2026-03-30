const db = require('../db');

class StudentGuardian {
  // Link a student to a guardian
  static async linkGuardian(studentId, guardianId, relationship = 'Parent', isPrimary = false) {
    const [result] = await db.execute(
      `INSERT INTO student_guardians (student_id, guardian_id, relationship, is_primary)
       VALUES (?, ?, ?, ?)`,
      [studentId, guardianId, relationship, isPrimary]
    );
    return result.insertId;
  }

  // Get guardians for a student
  static async getByStudent(studentId) {
    const [rows] = await db.execute(
      `SELECT sg.*, u.name, u.email, u.phone
       FROM student_guardians sg
       JOIN users u ON sg.guardian_id = u.id
       WHERE sg.student_id = ? AND sg.is_active = TRUE
       ORDER BY sg.is_primary DESC`,
      [studentId]
    );
    return rows;
  }

  // Get primary guardian for a student
  static async getPrimaryGuardian(studentId) {
    const [rows] = await db.execute(
      `SELECT sg.*, u.name, u.email, u.phone
       FROM student_guardians sg
       JOIN users u ON sg.guardian_id = u.id
       WHERE sg.student_id = ? AND sg.is_primary = TRUE AND sg.is_active = TRUE
       LIMIT 1`,
      [studentId]
    );
    return rows[0] || null;
  }

  // Check if guardian can request visit for student (security check)
  static async canRequestVisit(guardianId, studentId) {
    const [rows] = await db.execute(
      `SELECT COUNT(*) as count FROM student_guardians
       WHERE student_id = ? AND guardian_id = ? AND is_active = TRUE`,
      [studentId, guardianId]
    );
    
    return rows[0]?.count > 0;
  }

  // Get all students for a guardian
  static async getStudentsByGuardian(guardianId) {
    const [rows] = await db.execute(
      `SELECT s.*, sg.relationship, sg.is_primary
       FROM student_guardians sg
       JOIN students s ON sg.student_id = s.id
       WHERE sg.guardian_id = ? AND sg.is_active = TRUE
       ORDER BY sg.is_primary DESC, s.name ASC`,
      [guardianId]
    );
    return rows;
  }

  // Get all guardians
  static async getAll() {
    const [rows] = await db.execute(
      `SELECT sg.*, u.name as guardian_name, s.name as student_name
       FROM student_guardians sg
       JOIN users u ON sg.guardian_id = u.id
       JOIN students s ON sg.student_id = s.id
       WHERE sg.is_active = TRUE
       ORDER BY s.name, sg.is_primary DESC`
    );
    return rows;
  }

  // Update guardian relationship
  static async updateRelationship(id, relationship, isPrimary) {
    const [result] = await db.execute(
      `UPDATE student_guardians 
       SET relationship = ?, is_primary = ?, updated_at = NOW()
       WHERE id = ?`,
      [relationship, isPrimary, id]
    );
    return result.affectedRows;
  }

  // Deactivate guardian (soft delete)
  static async deactivateGuardian(studentId, guardianId) {
    const [result] = await db.execute(
      `UPDATE student_guardians 
       SET is_active = FALSE, updated_at = NOW()
       WHERE student_id = ? AND guardian_id = ?`,
      [studentId, guardianId]
    );
    return result.affectedRows;
  }

  // Remove guardian
  static async removeGuardian(id) {
    const [result] = await db.execute(
      'DELETE FROM student_guardians WHERE id = ?',
      [id]
    );
    return result.affectedRows;
  }

  // Get relationship type
  static async getRelationship(studentId, guardianId) {
    const [rows] = await db.execute(
      `SELECT relationship FROM student_guardians
       WHERE student_id = ? AND guardian_id = ?`,
      [studentId, guardianId]
    );
    return rows[0]?.relationship || null;
  }

  // Verify custodial rights (for security checkpoint)
  static async verifyCustodialRights(parentId, studentId) {
    const [rows] = await db.execute(
      `SELECT sg.*, u.role, u.behavior_score, u.behavior_status
       FROM student_guardians sg
       JOIN users u ON sg.guardian_id = u.id
       WHERE sg.student_id = ? AND sg.guardian_id = ? AND u.role = 'Parent' AND sg.is_active = TRUE`,
      [studentId, parentId]
    );
    
    if (rows.length === 0) {
      return null;
    }

    const guardian = rows[0];
    
    // Check if banned
    if (guardian.behavior_status === 'Banned') {
      return {
        verified: false,
        reason: 'Guardian is banned from visiting',
        guardian: null
      };
    }

    return {
      verified: true,
      guardian: guardian,
      requiresSupervision: guardian.behavior_status === 'Supervised'
    };
  }
}

module.exports = StudentGuardian;
