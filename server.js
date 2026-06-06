const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./src/config/database');

// Load environment variables
dotenv.config();

// Connect to MongoDB Atlas
connectDB();

const app = require('./src/app');

// Start server only after DB connection
const PORT = process.env.PORT || 3000;

// Only start listening after DB connection is successful
const startServer = async () => {
  try {
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 API URL: http://localhost:${PORT}`);
      console.log(`✅ Ready to accept requests`);
    });
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err, promise) => {
      console.log('❌ Unhandled Rejection:', err.message);
      server.close(() => process.exit(1));
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

startServer();