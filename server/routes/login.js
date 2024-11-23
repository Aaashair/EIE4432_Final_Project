// server/routes/login.js

import express from 'express';
import { validate_user } from '../userdb.js';

const router = express.Router();

// 登录处理
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // 服务器端验证
  if (!username || !password) {
    return res.json({ success: false, message: 'Username and password are required.' });
  }

  try {
    // 使用 validate_user 函数验证用户
    const user = await validate_user(username, password);

    if (user) {
      if (!user.enabled) {
        return res.json({ success: false, message: 'Account is disabled. Please contact support.' });
      }
      // 验证成功
      return res.json({ success: true, role: user.role });
    } else {
      // 验证失败
      return res.json({ success: false, message: 'Incorrect username or password.' });
    }
  } catch (err) {
    console.error('Error during user login:', err);
    return res.json({ success: false, message: 'Server error. Please try again later.' });
  }
});

export default router;
