const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global cache for database connection
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ MongoDB Connected');
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// Import models after connection
let User, Task;

// Routes
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'API is running on Vercel',
    timestamp: new Date().toISOString()
  });
});

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    await connectDB();
    
    // Dynamically import model
    const UserModel = require('../src/models/User');
    const User = await UserModel();
    
    const { name, email, password } = req.body;
    
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }
    
    // Create user
    const user = await User.create({ name, email, password });
    
    // Generate JWT
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE
    });
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    await connectDB();
    
    const UserModel = require('../src/models/User');
    const User = await UserModel();
    
    const { email, password } = req.body;
    
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE
    });
    
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Auth middleware
const protect = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      await connectDB();
      const UserModel = require('../src/models/User');
      const User = await UserModel();
      
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }
  }
  
  if (!token) {
    res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }
};

// Create task
app.post('/api/tasks', protect, async (req, res) => {
  try {
    await connectDB();
    const TaskModel = require('../src/models/Task');
    const Task = await TaskModel();
    
    const task = await Task.create({
      ...req.body,
      user: req.user._id
    });
    
    res.status(201).json({
      success: true,
      task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get all tasks
app.get('/api/tasks', protect, async (req, res) => {
  try {
    await connectDB();
    const TaskModel = require('../src/models/Task');
    const Task = await TaskModel();
    
    const { status, priority, page = 1, limit = 10 } = req.query;
    const filter = { user: req.user._id };
    
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    
    const tasks = await Task.find(filter)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Task.countDocuments(filter);
    
    res.status(200).json({
      success: true,
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
});

// Get single task
app.get('/api/tasks/:id', protect, async (req, res) => {
  try {
    await connectDB();
    const TaskModel = require('../src/models/Task');
    const Task = await TaskModel();
    
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    if (task.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
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
});

// Update task
app.put('/api/tasks/:id', protect, async (req, res) => {
  try {
    await connectDB();
    const TaskModel = require('../src/models/Task');
    const Task = await TaskModel();
    
    let task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    if (task.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
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
});

// Delete task
app.delete('/api/tasks/:id', protect, async (req, res) => {
  try {
    await connectDB();
    const TaskModel = require('../src/models/Task');
    const Task = await TaskModel();
    
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    if (task.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
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
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

// Export for Vercel
module.exports = app;