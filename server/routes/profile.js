// server/routes/profile.js

import express from 'express';
import { getUserByUsername, updateUserProfile } from '../userdb.js';

const router = express.Router();

// 中间件：检查用户是否已登录
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user && req.session.user.username) {
    next();
  } else {
    res.status(401).json({ success: false, message: 'Unauthorized' });
  }
}

// GET /auth/profile - 获取用户资料
router.get('/profile', isAuthenticated, async (req, res) => {
  const username = req.session.user.username;

  try {
    const user = await getUserByUsername(username);
    if (user) {
      // 移除敏感信息
      const { password, ...userWithoutPassword } = user;
      res.json({ success: true, user: userWithoutPassword });
    } else {
      res.json({ success: false, message: 'User not found.' });
    }
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.json({ success: false, message: 'Server error. Please try again later.' });
  }
});

// PUT /auth/profile - 更新用户资料
router.put('/profile', isAuthenticated, async (req, res) => {
  const username = req.session.user.username;
  const { nickname, email, birthday, gender, password } = req.body;

  try {
    const success = await updateUserProfile(username, { nickname, email, birthday, gender, password });
    if (success) {
      res.json({ success: true, message: 'Profile updated successfully.' });
    } else {
      res.json({ success: false, message: 'Failed to update profile.' });
    }
  } catch (err) {
    console.error('Error updating user profile:', err);
    res.json({ success: false, message: 'Server error. Please try again later.' });
  }
});

export default router;
