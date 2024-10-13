const { sendMessageToQueue } = require('../pubsub/producer');
const pool = require('../utils/db');

const createTask = async (taskData,userid) => {
  const { title, description, status, priority, due_date, project_id, assigned_user_id } = taskData;
  const result = await pool.query(
    `INSERT INTO tasks (title, description, status, priority, due_date, project_id, assigned_user_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [title, description, status, priority, due_date, project_id, assigned_user_id]
  );

  await sendMessageToQueue({
    status:status, taskId:result.rows[0].id, userId:userid
  });

  return result.rows[0];
};

const updateTask = async (id, updateData,userid) => {

  const { status, priority, assigned_user_id } = updateData;
  const result = await pool.query(
    `UPDATE tasks SET status = $1, priority = $2, assigned_user_id = $3 WHERE id = $4 RETURNING *`,
    [status, priority, assigned_user_id, id]
  );
  await sendMessageToQueue({
    status:status, taskId:id, userId:userid
  });
  return result.rows[0];
};

const queryTasks = async (filters) => {
  const { project_id, assigned_user_id, status, priority, dueInDays, commentKeyword } = filters;
  
  // Base query
  let query = 'SELECT DISTINCT tasks.*';
  let joinClause = '';
  let whereClause = ' WHERE 1=1';
  const queryParams = [];
  
  // Add join clause if commentKeyword is provided
  if (commentKeyword) {
    joinClause = ' LEFT JOIN comments ON tasks.id = comments.task_id';
  }
  
  // Add the join clause to the query
  query += joinClause + ' FROM tasks' + joinClause;
  
  // Add conditions dynamically based on filters
  if (project_id) {
    queryParams.push(project_id);
    whereClause += ` AND tasks.project_id = $${queryParams.length}`;
  }
  
  if (assigned_user_id) {
    queryParams.push(assigned_user_id);
    whereClause += ` AND tasks.assigned_user_id = $${queryParams.length}`;
  }
  
  if (status) {
    queryParams.push(status);
    whereClause += ` AND tasks.status = $${queryParams.length}`;
  }

  if (priority) {
    queryParams.push(priority);
    whereClause += ` AND tasks.priority = $${queryParams.length}`;
  }
  
  if (dueInDays) {
    queryParams.push(dueInDays);
    whereClause += ` AND tasks.due_date <= NOW() + INTERVAL '$${queryParams.length} days'`;
  }
  
  if (commentKeyword) {
    queryParams.push(`%${commentKeyword}%`); // Use LIKE for partial matching
    whereClause += ` AND comments.content ILIKE $${queryParams.length}`; 
  }

  // Combine the query parts
  const finalQuery = query + whereClause;

  // Execute the query with the dynamically built SQL and parameters
  const result = await pool.query(finalQuery, queryParams);

  return result.rows;
};




module.exports = { createTask, updateTask, queryTasks };
