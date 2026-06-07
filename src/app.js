const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Task Management API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      test: 'GET /api/test',
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      users: 'GET /api/auth/users',
      tasks: 'GET /api/tasks',
      createTask: 'POST /api/tasks'
    }
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true,
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    endpoints: [
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/auth/users',
      'GET /api/tasks',
      'POST /api/tasks',
      'GET /api/tasks/:id',
      'PUT /api/tasks/:id',
      'DELETE /api/tasks/:id'
    ]
  });
});

// 404 handler - THIS MUST BE LAST
app.use('*', (req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`,
    availableEndpoints: {
      health: 'GET /health',
      test: 'GET /api/test',
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      users: 'GET /api/auth/users',
      tasks: 'GET /api/tasks',
      createTask: 'POST /api/tasks'
    }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

module.exports = app;