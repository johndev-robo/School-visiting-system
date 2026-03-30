const db = require('../db');

class Student {
  // Create a new student with optional parent/guardian linking
  static async create({ name, class_name, roll_no, guardianId = null, relationship = 'Parent', isPrimary = true }) {
    const [result] = await db.execute(
      'INSERT INTO students (name, class, roll_no, created_at) VALUES (?, ?, ?, NOW())',
      [name, class_name, roll_no || null]
    );
    
    const studentId = result.insertId;

    // If guardianId is provided, link the guardian to the student
    if (guardianId) {
      await db.execute(
        `INSERT INTO student_guardians (student_id, guardian_id, relationship, is_primary, is_active)
         VALUES (?, ?, ?, ?, TRUE)`,
        [studentId, guardianId, relationship, isPrimary]
      );
    }

    return studentId;
  }

  // Get all students with their primary guardians
  static async getAllWithGuardians() {
    const [rows] = await db.execute(
      `SELECT s.*, u.name as guardian_name, u.email as guardian_email, sg.relationship
       FROM students s
       LEFT JOIN student_guardians sg ON s.id = sg.student_id AND sg.is_primary = TRUE
       LEFT JOIN users u ON sg.guardian_id = u.id
       ORDER BY s.name`
    );
    return rows;
  }

  // Get a student with all guardians
  static async getByIdWithGuardians(id) {
    const [student] = await db.execute(
      'SELECT * FROM students WHERE id = ?',
      [id]
    );

    if (student.length === 0) return null;

    const [guardians] = await db.execute(
      `SELECT sg.*, u.name, u.email, u.phone
       FROM student_guardians sg
       JOIN users u ON sg.guardian_id = u.id
       WHERE sg.student_id = ? AND sg.is_active = TRUE
       ORDER BY sg.is_primary DESC`,
      [id]
    );

    return {
      ...student[0],
      guardians
    };
  }

  // Get a student by ID
  static async getById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM students WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  // Update student
  static async update(id, { name, class_name, roll_no }) {
    const [result] = await db.execute(
      'UPDATE students SET name = ?, class = ?, roll_no = ? WHERE id = ?',
      [name, class_name, roll_no || null, id]
    );
    return result.affectedRows;
  }

  // Delete student
  static async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM students WHERE id = ?',
      [id]
    );
    return result.affectedRows;
  }
}

module.exports = Student;