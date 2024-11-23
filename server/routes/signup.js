// server/routes/signup.js

import express from 'express';
import { update_user, username_exist } from '../userdb.js';

const router = express.Router();

// 注册处理
router.post('/signup', async (req, res) => {
  const { username, password, nickname, email, birthday, gender } = req.body;

  // 服务器端验证
  let errorMessages = [];

  if (!username) errorMessages.push('Account ID is required.');
  if (!password) errorMessages.push('Password is required.');
  if (!nickname) errorMessages.push('Nickname is required.');
  if (!email) errorMessages.push('Email address is required.');
  if (!birthday) errorMessages.push('Birthday is required.');
  if (!gender) errorMessages.push('Gender is required.');

  if (username && username.length < 3) errorMessages.push('Account ID must be at least 3 characters.');
  if (password && password.length < 3) errorMessages.push('Password must be at least 3 characters.');

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailPattern.test(email)) {
    errorMessages.push('Please enter a valid email address.');
  }

  if (errorMessages.length > 0) {
    return res.json({ success: false, message: errorMessages.join(' ') });
  }

  try {
    // 检查用户名是否已存在
    const exists = await username_exist(username);
    if (exists) {
      return res.json({ success: false, message: 'Account ID already exists. Please choose another one.' });
    }

    // 创建新用户对象
    const newUser = {
      username: username,
      password: password, // 直接传递明文密码，哈希在 userdb.js 中处理
      nickname: nickname,
      email: email,
      birthday: birthday,
      gender: gender,
      role: 'user',
      enabled: true,
    };

    // 使用 update_user 函数将用户添加到数据库
    const success = await update_user(newUser);
    if (success) {
      return res.json({ success: true, message: 'Registration successful.' });
    } else {
      return res.json({ success: false, message: 'Server error. Please try again later.' });
    }
  } catch (err) {
    console.error('Error during user registration:', err);
    return res.json({ success: false, message: 'Server error. Please try again later.' });
  }
});

export default router;
