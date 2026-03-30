const db = require('../db');

class VisitingHourPolicy {
  // Get policy by occasion
  static async getByOccasion(occasion) {
    const [rows] = await db.execute(
      'SELECT * FROM visiting_hour_policies WHERE visit_occasion = ? AND is_active = TRUE',
      [occasion]
    );
    return rows[0] || null;
  }

  // Get all active policies
  static async getAll() {
    const [rows] = await db.execute(
      'SELECT * FROM visiting_hour_policies WHERE is_active = TRUE ORDER BY visit_occasion ASC'
    );
    return rows;
  }

  // Get recommended time slot based on occasion and date
  static async getRecommendedTimeSlot(occasion, requestedDate) {
    const policy = await this.getByOccasion(occasion);
    
    if (!policy) {
      return null;
    }

    const dateObj = new Date(requestedDate);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    const allowedDays = policy.allowed_days.split(',').map(d => d.trim());

    if (!allowedDays.includes(dayName)) {
      return {
        allowed: false,
        reason: `${occasion} is not allowed on ${dayName}. Allowed days: ${policy.allowed_days}`
      };
    }

    return {
      allowed: true,
      startTime: policy.start_time,
      endTime: policy.end_time,
      maxDuration: policy.max_duration_minutes,
      requiresTeacherPresent: policy.requires_teacher_present,
      advanceNoticeRequired: policy.requires_advance_notice_hours
    };
  }

  // Validate if visit request complies with policy
  static async validateVisitRequest(occasion, requestedDate, startTime, endTime) {
    const policy = await this.getByOccasion(occasion);
    
    if (!policy) {
      return {
        valid: false,
        reason: `No visiting policy found for: ${occasion}`
      };
    }

    // Check day of week
    const dateObj = new Date(requestedDate);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    const allowedDays = policy.allowed_days.split(',').map(d => d.trim());

    if (!allowedDays.includes(dayName)) {
      return {
        valid: false,
        reason: `${occasion} is not allowed on ${dayName}. Allowed days: ${policy.allowed_days}`
      };
    }

    // Check time is within policy window
    const policyStart = policy.start_time;
    const policyEnd = policy.end_time;

    if (startTime < policyStart || startTime > policyEnd) {
      return {
        valid: false,
        reason: `Start time ${startTime} is outside allowed window (${policyStart} - ${policyEnd})`
      };
    }

    if (endTime > policyEnd) {
      return {
        valid: false,
        reason: `End time ${endTime} exceeds policy end time (${policyEnd})`
      };
    }

    // Check duration
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const durationMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);

    if (durationMinutes > policy.max_duration_minutes) {
      return {
        valid: false,
        reason: `Visit duration (${durationMinutes}min) exceeds maximum (${policy.max_duration_minutes}min)`
      };
    }

    // Check advance notice requirement
    if (policy.requires_advance_notice_hours > 0) {
      const now = new Date();
      const visitTime = new Date(requestedDate);
      const hoursDifference = (visitTime - now) / (1000 * 60 * 60);

      if (hoursDifference < policy.requires_advance_notice_hours) {
        return {
          valid: false,
          reason: `Request must be made at least ${policy.requires_advance_notice_hours} hours in advance`
        };
      }
    }

    return {
      valid: true,
      message: `Visit request complies with ${occasion} policy`
    };
  }

  // Update policy
  static async update(id, updates) {
    const { occasion, description, allowedDays, startTime, endTime, maxDuration, requiresTeacher, advanceNotice } = updates;
    
    const [result] = await db.execute(
      `UPDATE visiting_hour_policies 
       SET visit_occasion = ?, description = ?, allowed_days = ?, start_time = ?, 
           end_time = ?, max_duration_minutes = ?, requires_teacher_present = ?, 
           requires_advance_notice_hours = ?, updated_at = NOW()
       WHERE id = ?`,
      [occasion, description, allowedDays, startTime, endTime, maxDuration, requiresTeacher, advanceNotice, id]
    );
    
    return result.affectedRows;
  }

  // Create new policy
  static async create(policyData) {
    const { occasion, description, allowedDays, startTime, endTime, maxDuration, requiresTeacher, advanceNotice } = policyData;
    
    const [result] = await db.execute(
      `INSERT INTO visiting_hour_policies 
       (visit_occasion, description, allowed_days, start_time, end_time, max_duration_minutes, requires_teacher_present, requires_advance_notice_hours)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [occasion, description, allowedDays, startTime, endTime, maxDuration, requiresTeacher, advanceNotice]
    );
    
    return result.insertId;
  }

  // Get visits this week for a student
  static async getWeeklyVisitCount(studentId, occasion) {
    const [rows] = await db.execute(
      `SELECT COUNT(*) as count FROM visits 
       WHERE student_id = ? AND visit_occasion = ? 
       AND visit_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       AND status IN ('Approved', 'Completed')`,
      [studentId, occasion]
    );
    
    return rows[0]?.count || 0;
  }

  // Check if weekly limit exceeded
  static async isWeeklyLimitExceeded(studentId, occasion) {
    const policy = await this.getByOccasion(occasion);
    
    if (!policy || !policy.max_visits_per_week) {
      return false;
    }

    const weeklyCount = await this.getWeeklyVisitCount(studentId, occasion);
    return weeklyCount >= policy.max_visits_per_week;
  }
}

module.exports = VisitingHourPolicy;
