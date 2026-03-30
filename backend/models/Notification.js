const db = require('../db');

class Notification {
  // Create a notification
  static async create({ userId, message }) {
    const [result] = await db.execute(
      'INSERT INTO notifications (user_id, message, created_at) VALUES (?, ?, NOW())',
      [userId, message]
    );
    return result.insertId;
  }

  // Get notifications for a user
  static async getByUser(userId) {
    const [rows] = await db.execute(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows;
  }

  // Mark notification as read
  static async markAsRead(id) {
    const [result] = await db.execute(
      'UPDATE notifications SET read = TRUE WHERE id = ?',
      [id]
    );
    return result.affectedRows;
  }

  // Delete notification
  static async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM notifications WHERE id = ?',
      [id]
    );
    return result.affectedRows;
  }
}

module.exports = Notification;