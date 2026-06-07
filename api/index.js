const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API is working!',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Task Management API',
    endpoints: ['/health', '/api/auth/register', '/api/auth/login']
  });
});

// Test registration
app.post('/api/auth/register', (req, res) => {
  res.json({
    success: true,
    message: 'Registration endpoint working',
    token: 'test_token_123'
  });
});

// Test login
app.post('/api/auth/login', (req, res) => {
  res.json({
    success: true,
    message: 'Login endpoint working',
    token: 'test_token_123'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
});

module.exports = app;