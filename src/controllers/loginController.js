const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

  
const loginController=async (req, res) => {
    const users = [
        {
          id: 1,
          username: 'abc',
          password: '$2b$12$hdkM.0Hn2uIo3I1sOLMB9O5fuktTW6fiGJBec32JYYqgYg2SXUspy' // bcrypt hash of 'password123'
        }
      ];
    const { username, password } = req.body;
  
    // Find the user in the mock database
    const user = users.find((u) => u.username === username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
  
    // Verify the password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
  
    // Generate JWT Token (with user ID and username as payload)
    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '2h' });
  
    res.json({ token });
  }

  module.exports={loginController}