-- Parent-Child Relationship & Smart Visiting Hours Migration

USE boarding_school_visiting;

-- Add behavior tracking columns to users table
ALTER TABLE users 
ADD COLUMN behavior_score INT DEFAULT 100 AFTER phone,
ADD COLUMN behavior_status ENUM('Unrestricted', 'Supervised', 'Banned') DEFAULT 'Unrestricted' AFTER behavior_score,
ADD COLUMN last_incident_date DATETIME AFTER behavior_status,
ADD INDEX idx_behavior_status (behavior_status);

-- Create student_guardians junction table
ALTER TABLE students ADD COLUMN parent_id INT AFTER admission_date;

-- Alternatively, create a separate guardians table
CREATE TABLE IF NOT EXISTS student_guardians (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  guardian_id INT NOT NULL,
  relationship ENUM('Parent', 'Guardian', 'Aunt', 'Uncle', 'Grandparent', 'Legal Guardian', 'Other') DEFAULT 'Parent',
  is_primary BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (guardian_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_relationship (student_id, guardian_id),
  INDEX idx_student_id (student_id),
  INDEX idx_guardian_id (guardian_id),
  INDEX idx_is_primary (is_primary)
);

-- Create visiting_hour_policies table
CREATE TABLE IF NOT EXISTS visiting_hour_policies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  visit_occasion ENUM('Academic Visit', 'Medication Drop-off', 'Lunch Supervision', 'Leisure Visit', 'Emergency', 'Other') NOT NULL,
  description TEXT,
  allowed_days VARCHAR(255),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_duration_minutes INT DEFAULT 60,
  requires_teacher_present BOOLEAN DEFAULT FALSE,
  requires_advance_notice_hours INT DEFAULT 24,
  max_visits_per_week INT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_occasion (visit_occasion),
  INDEX idx_visit_occasion (visit_occasion),
  INDEX idx_is_active (is_active)
);

-- Alter visits table to include visit_type and additional fields
ALTER TABLE visits 
ADD COLUMN visit_occasion ENUM('Academic Visit', 'Medication Drop-off', 'Lunch Supervision', 'Leisure Visit', 'Emergency', 'Other') DEFAULT 'Leisure Visit' AFTER reason,
ADD COLUMN scheduled_start_time TIME AFTER visit_time,
ADD COLUMN scheduled_end_time TIME AFTER scheduled_start_time,
ADD COLUMN actual_check_in_time TIME,
ADD COLUMN actual_check_out_time TIME,
ADD COLUMN is_verified_by INT AFTER status,
ADD CONSTRAINT fk_visit_verifier FOREIGN KEY (is_verified_by) REFERENCES users(id) ON DELETE SET NULL,
ADD INDEX idx_visit_occasion (visit_occasion),
ADD INDEX idx_scheduled_start (scheduled_start_time);

-- Alter visit_requests table similarly
ALTER TABLE visit_requests 
ADD COLUMN visit_occasion ENUM('Academic Visit', 'Medication Drop-off', 'Lunch Supervision', 'Leisure Visit', 'Emergency', 'Other') DEFAULT 'Leisure Visit' AFTER reason,
ADD COLUMN preferred_start_time TIME AFTER visit_occasion,
ADD COLUMN preferred_end_time TIME AFTER preferred_start_time,
ADD INDEX idx_visit_occasion (visit_occasion);

-- Insert default visiting hour policies
INSERT INTO visiting_hour_policies (visit_occasion, description, allowed_days, start_time, end_time, max_duration_minutes, requires_teacher_present, requires_advance_notice_hours, max_visits_per_week) VALUES
('Academic Visit', 'Parents meet with tutors to discuss academic progress', 'Monday,Tuesday,Wednesday,Thursday,Friday', '09:30:00', '10:15:00', 45, TRUE, 48, 2),
('Medication Drop-off', 'Drop off medication or health essentials', 'Monday,Tuesday,Wednesday,Thursday,Friday', '12:00:00', '13:00:00', 30, FALSE, 4, 10),
('Lunch Supervision', 'Supervise lunch or drop off lunch', 'Monday,Tuesday,Wednesday,Thursday,Friday', '12:00:00', '13:00:00', 45, FALSE, 24, 5),
('Leisure Visit', 'Social visit with child', 'Saturday,Sunday', '14:00:00', '18:00:00', 120, FALSE, 24, 2),
('Emergency', 'Emergency visit due to health or family crisis', 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday', '07:00:00', '19:00:00', 120, FALSE, 0, 10),
('Other', 'Other reason not listed', 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday', '14:00:00', '18:00:00', 90, FALSE, 24, 3);
