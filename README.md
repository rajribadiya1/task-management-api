# Task Management API

A RESTful Task Management API built with Node.js, Express, MongoDB, and JWT authentication.

## Features
- User Registration & Login with JWT
- Password Hashing with bcrypt
- Complete Task CRUD Operations
- Role-based Access Control (User/Admin)
- Task Filtering by Status & Priority
- Pagination & Sorting
- MongoDB Atlas Cloud Database

## Tech Stack
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for Authentication
- bcryptjs for Password Hashing

## API Endpoints

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user
- GET /api/auth/me - Get current user
- GET /api/auth/users - Get all users (debug)

### Tasks
- POST /api/tasks - Create task
- GET /api/tasks - Get all tasks (with filters)
- GET /api/tasks/:id - Get single task
- PUT /api/tasks/:id - Update task
- DELETE /api/tasks/:id - Delete task

## Installation

```bash
git clone https://github.com/YOUR_USERNAME/task-management-api.git
cd task-management-api
npm install
cp .env.example .env  # Configure your environment variables
npm start
```
