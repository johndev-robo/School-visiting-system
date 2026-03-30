const db = require('../db');

class User {
  // Create a new user
  static async create({ name, email, password, role }) {
    const [result] = await db.execute(
      'INSERT INTO users (name, email, password, role, created_at) VALUES (?, ?, ?, ?, NOW())',
      [name, email, password, role]
    );
    return result.insertId;
  }

  // Find user by email
  static async findByEmail(email) {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  }

  // Find user by ID
  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  // Get all users
  static async getAll() {
    const [rows] = await db.execute(
      'SELECT id, name, email, role, phone, created_at FROM users ORDER BY created_at DESC'
    );
    return rows;
  }

  // Update user info
  static async update(id, { name, email, role, phone }) {
    const [result] = await db.execute(
      'UPDATE users SET name = ?, email = ?, role = ?, phone = ? WHERE id = ?',
      [name, email, role, phone, id]
    );
    return result.affectedRows;
  }

  // Delete user
  static async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM users WHERE id = ?',
      [id]
    );
    return result.affectedRows;
  }
}

module.exports = User;