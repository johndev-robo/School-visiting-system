const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Registration routes
router.get('/register', AuthController.registerPage);
router.post('/register', AuthController.register);

// Login routes
router.get('/login', AuthController.loginPage);
router.post('/login', AuthController.login);

// Logout route
router.get('/logout', isAuthenticated, AuthController.logout);

module.exports = router;