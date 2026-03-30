const Student = require('../models/Student');
const User = require('../models/User');
const db = require('../db');

class StudentController {
  static async list(req, res) {
    try {
      const students = await Student.getAllWithGuardians();
      const [parents] = await db.execute(
        "SELECT id, name, email FROM users WHERE role = 'Parent' ORDER BY name"
      );
      res.render('admin/student_management', { students, parents });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error fetching students');
    }
  }

  static async create(req, res) {
    try {
      const { name, class_name, roll_no, guardianId, relationship = 'Parent', isPrimary = true } = req.body;
      
      if (!name || !class_name) {
        return res.status(400).send('Name and class are required');
      }

      const studentId = await Student.create({
        name,
        class_name,
        roll_no,
        guardianId: guardianId ? parseInt(guardianId) : null,
        relationship,
        isPrimary: isPrimary === 'on' ? true : false
      });

      const wantsJson =
        req.is('json') ||
        (req.headers.accept && req.headers.accept.includes('application/json'));
      if (wantsJson) {
        res.status(201).json({
          message: 'Student created successfully',
          studentId,
          guardianLinked: guardianId ? true : false
        });
      } else {
        res.redirect('/students');
      }
    } catch (err) {
      console.error(err);
      if (res.headersSent) return;
      res.status(500).send('Error creating student: ' + err.message);
    }
  }

  static async update(req, res) {
    try {
      const { id, name, class_name, roll_no } = req.body;
      await Student.update(id, { name, class_name, roll_no });
      res.redirect('/students');
    } catch (err) {
      console.error(err);
      res.status(500).send('Error updating student');
    }
  }

  // Add/change guardian for existing student
  static async addGuardian(req, res) {
    try {
      const { studentId, guardianId, relationship = 'Parent', isPrimary = false } = req.body;

      if (!studentId || !guardianId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const StudentGuardian = require('../models/StudentGuardian');
      const id = await StudentGuardian.linkGuardian(
        parseInt(studentId),
        parseInt(guardianId),
        relationship,
        isPrimary
      );

      res.json({
        message: 'Guardian linked successfully',
        id
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }

  // View student with all guardians
  static async viewStudent(req, res) {
    try {
      const { id } = req.params;
      const student = await Student.getByIdWithGuardians(id);

      if (!student) {
        return res.status(404).send('Student not found');
      }

      const [parents] = await db.execute(
        "SELECT id, name, email FROM users WHERE role = 'Parent' ORDER BY name"
      );

      res.render('admin/student_detail', { student, parents });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error fetching student');
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      await Student.delete(id);
      res.redirect('/students');
    } catch (err) {
      console.error(err);
      res.status(500).send('Error deleting student');
    }
  }
}

module.exports = StudentController;