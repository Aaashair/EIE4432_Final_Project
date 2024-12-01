// server/routes/tickets.js

import express from 'express';
import { getAllTickets, addTicket, getTicketsByUsername } from '../ticketsdb.js';

const router = express.Router();

// Route: GET /api/tickets
// Description: 获取所有票务信息
router.get('/tickets', async (req, res) => {
  try {
    const tickets = await getAllTickets();
    res.json({ success: true, tickets });
  } catch (err) {
    console.error('Error fetching tickets:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch tickets.' });
  }
});

router.get('/tickets/:username', async (req, res) => {
  const username = req.params.username;

  if (!username) {
    return res.status(400).json({ success: false, message: 'Username is required.' });
  }

  try {
    const tickets = await getTicketsByUsername(username);
    res.json({ success: true, tickets });
  } catch (err) {
    console.error('Error fetching tickets for user:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch tickets for user.' });
  }
});

// Route: POST /api/tickets
// Description: 增加新的票务信息
router.post('/tickets', async (req, res) => {
  const { username, title, date, description, venue, type, price, seatNo } = req.body;

  // 基本输入验证
  if (!username || !title || !date || !description || !venue || !type || !price || !seatNo) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  // 构建新的票务对象
  const newTicketData = {
    username,
    title,
    date,
    description,
    venue,
    type,
    price,
    seatNo,
  };

  try {
    const ticketId = await addTicket(newTicketData);
    res.json({ success: true, ticketId });
  } catch (err) {
    console.error('Error adding ticket:', err);
    res.status(500).json({ success: false, message: 'Failed to add ticket.' });
  }
});

export default router;
