const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  adminDeleteTask
} = require('../controllers/taskController');
const { protect, admin } = require('../middleware/auth');

// All task routes require authentication
router.use(protect);

router.route('/')
  .post(createTask)
  .get(getTasks);

router.route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(deleteTask);

// Admin only route
router.delete('/admin/:id', admin, adminDeleteTask);

module.exports = router;