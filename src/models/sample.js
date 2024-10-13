// CREATE TABLE users (
//     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//     name VARCHAR(255) NOT NULL,
//     email VARCHAR(255) UNIQUE NOT NULL
//   );
  
//   CREATE TABLE projects (
//     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//     name VARCHAR(255) NOT NULL,
//     owner_id UUID REFERENCES users(id)
//   );
  
//   CREATE TABLE tasks (
//     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//     title VARCHAR(255) NOT NULL,
//     description TEXT,
//     status VARCHAR(20) CHECK (status IN ('pending', 'in_progress', 'completed')),
//     priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high')),
//     created_at TIMESTAMP DEFAULT NOW(),
//     due_date TIMESTAMP,
//     project_id UUID REFERENCES projects(id),
//     assigned_user_id UUID REFERENCES users(id)
//   );
  
//   CREATE TABLE comments (
//     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//     task_id UUID REFERENCES tasks(id),
//     author_id UUID REFERENCES users(id),
//     content TEXT,
//     created_at TIMESTAMP DEFAULT NOW()
//   );
  
//   CREATE TABLE notifications (
//     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//     user_id UUID REFERENCES users(id),
//     task_id UUID REFERENCES tasks(id),
//     message VARCHAR(255),
//     created_at TIMESTAMP DEFAULT NOW()
//   );
  