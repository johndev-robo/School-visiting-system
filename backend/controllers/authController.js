const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const SECRET_KEY = process.env.JWT_SECRET || 'supersecretkey';

class AuthController {
  // Render registration page
  static registerPage(req, res) {
    res.render('register');
  }

  // Handle registration
  static async register(req, res) {
    try {
      const { name, email, password, confirmPassword } = req.body;

      if (password !== confirmPassword) {
        return res.status(400).send('Passwords do not match');
      }

      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).send('Email already registered');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await User.create({ name, email, password: hashedPassword, role: 'Parent' });

      res.redirect('/auth/login');
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error during registration');
    }
  }

  // Render login page
  static loginPage(req, res) {
    res.render('login');
  }

  // Handle login
  static async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await User.findByEmail(email);

      if (!user) return res.status(401).send('Invalid credentials');

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).send('Invalid credentials');

      // Create session
      const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
      req.session.userId = user.id;
      req.session.userName = user.name;
      req.session.userRole = user.role;

      // Redirect based on role
      switch(user.role) {
        case 'Admin':
          res.redirect('/dashboard/admin');
          break;
        case 'Parent':
          res.redirect('/dashboard/parent');
          break;
        case 'Tutor':
          res.redirect('/dashboard/tutor');
          break;
        case 'Security Officer':
          res.redirect('/dashboard/security');
          break;
        default:
          res.redirect('/dashboard');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error during login');
    }
  }

  // Logout
  static logout(req, res) {
    req.session.destroy(err => {
      if (err) console.error(err);
      res.redirect('/');
    });
  }
}

module.exports = AuthController;