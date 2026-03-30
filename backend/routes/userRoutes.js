const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { isAdmin } = require('../middleware/authMiddleware');

// Only admin can manage users
router.use(isAdmin);

router.get('/', UserController.list);
router.post('/create', UserController.create);
router.post('/update', UserController.update);
router.get('/delete/:id', UserController.delete);

module.exports = router;