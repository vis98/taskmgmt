const express = require('express');
const { createTaskController, updateTaskController, queryTasksController } = require('./src/controllers/taskController');
const { loginController } = require('./src/controllers/loginController');

const authMiddleware = require('./src/middlewares/authmiddleware');
require('dotenv').config();

const app = express();
app.use(express.json());

// Public Routes
app.post('/tasks', authMiddleware, createTaskController);  // Create Task
app.put('/tasks/:id', authMiddleware, updateTaskController);  // Update Task
app.get('/tasks/query', authMiddleware, queryTasksController);  // Query Tasks

 
  // Login Route - Authenticate User and Generate Token
  app.post('/login', loginController);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
