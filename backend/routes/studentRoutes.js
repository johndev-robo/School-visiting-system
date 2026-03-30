const express = require('express');
const router = express.Router();
const StudentController = require('../controllers/studentController');
const { isAdmin } = require('../middleware/authMiddleware');

// Admin-only access
router.use(isAdmin);

router.get('/', StudentController.list);
router.post('/create', StudentController.create);
router.post('/update', StudentController.update);
router.get('/:id', StudentController.viewStudent);
router.post('/:id/add-guardian', StudentController.addGuardian);
router.get('/delete/:id', StudentController.delete);

module.exports = router;