const db = require('../db');

class VisitRequest {
  // Create a visit request
  static async create({ parentId, studentId, visitDate, reason }) {
    const [result] = await db.execute(
      'INSERT INTO visit_requests (parent_id, student_id, visit_date, reason, created_at) VALUES (?, ?, ?, ?, NOW())',
      [parentId, studentId, visitDate, reason]
    );
    return result.insertId;
  }

  // Get requests by parent
  static async getByParent(parentId) {
    const [rows] = await db.execute(
      `SELECT vr.id, s.name as student, vr.visit_date as date, vr.reason, vr.status
       FROM visit_requests vr
       JOIN students s ON vr.student_id = s.id
       WHERE vr.parent_id = ?`,
      [parentId]
    );
    return rows;
  }

  // Get all requests (Admin/Tutor)
  static async getAll() {
    const [rows] = await db.execute(
      `SELECT vr.id, u.name as parent, s.name as student, vr.visit_date as date, vr.reason, vr.status
       FROM visit_requests vr
       JOIN users u ON vr.parent_id = u.id
       JOIN students s ON vr.student_id = s.id`
    );
    return rows;
  }

  // Update request status
  static async updateStatus(id, status) {
    const [result] = await db.execute(
      'UPDATE visit_requests SET status = ? WHERE id = ?',
      [status, id]
    );
    return result.affectedRows;
  }

  // Delete request
  static async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM visit_requests WHERE id = ?',
      [id]
    );
    return result.affectedRows;
  }
}

module.exports = VisitRequest;