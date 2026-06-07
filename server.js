const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./src/config/database');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = require('./src/app');

// Serve static files (HTML page)
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 API URL: http://localhost:${PORT}`);
  console.log(`🌐 Web Interface: http://localhost:${PORT}`);
  console.log(`\n📋 Available endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/`);
  console.log(`   GET  http://localhost:${PORT}/health`);
  console.log(`   GET  http://localhost:${PORT}/api/test`);
  console.log(`   POST http://localhost:${PORT}/api/auth/register`);
  console.log(`   POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   GET  http://localhost:${PORT}/api/auth/users`);
  console.log(`   GET  http://localhost:${PORT}/api/tasks`);
  console.log(`   POST http://localhost:${PORT}/api/tasks`);
  console.log(`\n✅ Ready to accept requests\n`);
});

// Handle unhandled rejection
process.on('unhandledRejection', (err) => {
  console.log('❌ Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});