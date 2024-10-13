const { createTask, updateTask, queryTasks } = require('../services/taskService');

const createTaskController = async (req, res) => {
  try {
    const task = await createTask(req.body,req.user);
    res.status(201).json(task);
  } catch (error) {
    
    res.status(500).json({ error: 'Failed to create task' });
  }
};

const updateTaskController = async (req, res) => {
  try {
    const task = await updateTask(req.params.id, req.body,req.user.id);
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
};

const queryTasksController = async (req, res) => {
  try {
    const tasks = await queryTasks(req.query);
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to query tasks' });
  }
};

module.exports = { createTaskController, updateTaskController, queryTasksController };
