-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS boarding_school_visiting;
USE boarding_school_visiting;

-- Drop existing tables (optional, for fresh install)
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS visit_requests;
DROP TABLE IF EXISTS visits;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS users;

-- Create Users Table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('Admin', 'Parent', 'Tutor', 'Security Officer') DEFAULT 'Parent',
  phone VARCHAR(15),
  address VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
);

-- Create Students Table
CREATE TABLE students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  class VARCHAR(50) NOT NULL,
  roll_no VARCHAR(20),
  admission_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name),
  INDEX idx_class (class)
);

-- Create Visits Table
CREATE TABLE visits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parent_id INT NOT NULL,
  student_id INT NOT NULL,
  visit_date DATE NOT NULL,
  visit_time TIME NOT NULL,
  status ENUM('Pending', 'Approved', 'Rejected', 'Completed') DEFAULT 'Pending',
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  INDEX idx_parent_id (parent_id),
  INDEX idx_student_id (student_id),
  INDEX idx_visit_date (visit_date),
  INDEX idx_status (status)
);

-- Create Visit Requests Table
CREATE TABLE visit_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parent_id INT NOT NULL,
  student_id INT NOT NULL,
  visit_date DATE NOT NULL,
  reason TEXT,
  status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  INDEX idx_parent_id (parent_id),
  INDEX idx_student_id (student_id),
  INDEX idx_status (status)
);

-- Create Notifications Table
CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_read (read)
);

-- Insert sample admin user (password: admin123)
INSERT INTO users (name, email, password, role, phone) VALUES
('Admin User', 'admin@school.com', '$2b$10$JNkZDC9Myt5fZdNuBYIFM.ds0Aa5csOjcr77rpC6seRj66QUBSfZ.', 'Admin', '1234567890');

-- Insert sample parent user (password: parent123)
INSERT INTO users (name, email, password, role, phone) VALUES
('John Parent', 'john@parent.com', '$2b$10$p9bPAacEPRKTpJHozYtEs..8RFxruWlPJZCmGVEp9SbBb9fljBdsW', 'Parent', '9876543210');

-- Insert sample tutor user (password: tutor123)
INSERT INTO users (name, email, password, role, phone) VALUES
('Mrs. Smith', 'smith@school.com', '$2b$10$WJMHjT//ignqMpk/BSXWt.HgrXx93oBKfTR/XI6kkrqqqge2GbBwK', 'Tutor', '5555555555');

-- Insert sample security officer (password: security123)
INSERT INTO users (name, email, password, role, phone) VALUES
('Security Head', 'security@school.com', '$2b$10$QiB83mYinWeBeS2d8xpFcuujm0U7JOQwwbpLl7F2HnkKdfI9sm6y.', 'Security Officer', '4444444444');

-- Insert sample students
INSERT INTO students (name, class, roll_no, admission_date) VALUES
('Alice Johnson', '10A', '101', '2023-06-01'),
('Bob Williams', '10A', '102', '2023-06-01'),
('Charlie Davis', '11B', '201', '2022-06-01'),
('Diana Martinez', '11B', '202', '2022-06-01');

-- =====================================
-- ADD MISSING TABLES AND COLUMNS FOR VISIT SYSTEM
-- =====================================

-- 1. Create student_guardians table (parent-child relationships)
CREATE TABLE IF NOT EXISTS student_guardians (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  guardian_id INT NOT NULL,
  relationship VARCHAR(50) DEFAULT 'Parent',
  is_primary BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (guardian_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_student_guardian (student_id, guardian_id),
  INDEX idx_guardian (guardian_id)
);

-- Link sample parent to students
INSERT INTO student_guardians (student_id, guardian_id, relationship, is_primary) VALUES
(1, 2, 'Parent', TRUE),  -- John Parent -> Alice
(2, 2, 'Parent', FALSE); -- John Parent -> Bob

-- 2. Add missing columns to visits table
ALTER TABLE visits 
ADD COLUMN IF NOT EXISTS visit_occasion VARCHAR(100) DEFAULT 'Leisure Visit',
ADD COLUMN IF NOT EXISTS scheduled_start_time TIME,
ADD COLUMN IF NOT EXISTS scheduled_end_time TIME,
ADD COLUMN IF NOT EXISTS actual_check_in_time TIME,
ADD COLUMN IF NOT EXISTS actual_check_out_time TIME;

-- 3. Create visiting_hour_policies table
CREATE TABLE IF NOT EXISTS visiting_hour_policies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  visit_occasion VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  allowed_days VARCHAR(100) DEFAULT 'Monday,Tuesday,Wednesday,Thursday,Friday', -- No weekends
  start_time TIME NOT NULL DEFAULT '09:00:00',
  end_time TIME NOT NULL DEFAULT '16:00:00',
  max_duration_minutes INT DEFAULT 60,
  requires_teacher_present BOOLEAN DEFAULT FALSE,
  requires_advance_notice_hours INT DEFAULT 24,
  max_visits_per_week INT DEFAULT 2,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_occasion (visit_occasion)
);

-- 4. Seed sample visiting policies
INSERT IGNORE INTO visiting_hour_policies (visit_occasion, description, allowed_days, start_time, end_time, max_duration_minutes, requires_teacher_present, requires_advance_notice_hours, max_visits_per_week) VALUES
('Academic Visit', 'Meet with teachers to discuss academic progress', 'Monday,Tuesday,Wednesday,Thursday,Friday', '14:00:00', '15:30:00', 90, TRUE, 48, 1),
('Medication Drop-off', 'Drop off medication or medical supplies', 'Monday,Tuesday,Wednesday,Thursday,Friday', '08:30:00', '09:00:00', 30, FALSE, 2, 3),
('Lunch Supervision', 'Join child for supervised lunch', 'Monday,Tuesday,Wednesday,Thursday,Friday', '12:00:00', '12:45:00', 45, TRUE, 24, 2),
('Leisure Visit', 'General family visit in designated area', 'Monday,Tuesday,Wednesday,Thursday,Friday', '15:30:00', '16:30:00', 60, FALSE, 24, 2),
('Emergency', 'Emergency family situations', 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday', '09:00:00', '17:00:00', 120, FALSE, 0, 1);

PRINT '✅ Schema updated for advanced visit system. Policies seeded. Parent-child links created.';
