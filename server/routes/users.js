// server/routes/users.js

import express from 'express';
import { getAllUsers } from '../userdb.js';

const router = express.Router();

// GET 端点，获取所有用户信息
router.get('/users', async (req, res) => {
  console.log('Received GET request to /auth/users');
  try {
    const users = await getAllUsers();
    console.log('Successfully fetched users from database');

    // 在发送前移除敏感信息，如密码
    const usersWithoutPasswords = users.map((user) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.json({ success: true, users: usersWithoutPasswords });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
});

export default router;
