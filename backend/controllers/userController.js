const User = require('../models/User');

class UserController {
  static async list(req, res) {
    try {
      const users = await User.getAll ? await User.getAll() : [];
      res.render('admin/user_management', { users });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error fetching users');
    }
  }

  static async create(req, res) {
    try {
      const { name, email, password, role, phone } = req.body;
      if (!name || !email || !password || !role) {
        return res.status(400).send('Name, email, password, and role are required');
      }

      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash(password, 10);
      await User.create({ name, email, password: hashedPassword, role, phone });
      res.redirect('/users');
    } catch (err) {
      console.error(err);
      res.status(500).send('Error creating user');
    }
  }

  static async update(req, res) {
    try {
      const { id, name, email, role, phone } = req.body;
      if (!id || !name || !email || !role) {
        return res.status(400).send('All fields are required');
      }

      await User.update(id, { name, email, role, phone });
      res.redirect('/users');
    } catch (err) {
      console.error(err);
      res.status(500).send('Error updating user');
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      await User.delete(id);
      res.redirect('/users');
    } catch (err) {
      console.error(err);
      res.status(500).send('Error deleting user');
    }
  }
}

module.exports = UserController;