const Task = require('../models/Task');

// @desc    Create task
// @route   POST /api/tasks
const createTask = async (req, res) => {
  try {
    console.log('📝 Creating task for user:', req.user.id);
    
    const task = await Task.create({
      ...req.body,
      user: req.user.id
    });
    
    console.log('✅ Task created:', task._id);
    
    res.status(201).json({
      success: true,
      task
    });
  } catch (error) {
    console.error('Task creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all tasks
// @route   GET /api/tasks
const getTasks = async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 10 } = req.query;
    const filter = { user: req.user.id };
    
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    
    const tasks = await Task.find(filter)
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Task.countDocuments(filter);
    
    console.log(`📊 Found ${tasks.length} tasks for user ${req.user.id}`);
    
    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    if (task.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }
    
    res.status(200).json({
      success: true,
      task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
const updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    if (task.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }
    
    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    if (task.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }
    
    await task.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Make sure all functions are exported
module.exports = {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask
};