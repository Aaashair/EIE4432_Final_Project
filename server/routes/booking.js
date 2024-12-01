// server/routes/booking.js

import express from 'express';
import { getEventById, updateEvent } from '../eventdb.js';
import { addTicket } from '../ticketsdb.js'; // 引入 addTicket 函数

const router = express.Router();

// POST /api/booking
router.post('/booking', async (req, res) => {
  try {
    const { eventId, seats, totalPrice, cardNumber, discountCode, user } = req.body;

    if (!eventId || !seats || seats.length === 0 || !cardNumber) {
      return res.status(400).json({ error: 'Invalid payment data' });
    }

    const event = await getEventById(eventId);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // 服务器端验证折扣码和重新计算总价
    let finalTotalPrice = 0;
    let discountApplied = false;

    seats.forEach((seatId) => {
      const seat = event.seat[seatId];
      if (!seat || seat.occupied || !seat.valid) {
        throw new Error(`Seat ${seatId} is not available.`);
      }
      finalTotalPrice += seat.type === 'ev-charging' ? event.evPrice : event.normalPrice;
    });

    if (discountCode && discountCode === event.discountCode) {
      finalTotalPrice -= 10;
      discountApplied = true;
    }

    if (finalTotalPrice !== totalPrice) {
      return res.status(400).json({ error: 'Total price mismatch.' });
    }

    // 更新座位状态到 eventdb
    const updateData = {};
    seats.forEach((seatId) => {
      updateData[`seat.${seatId}.occupied`] = true;
      updateData[`seat.${seatId}.userID`] = user.username || 'guest'; // 使用用户名或 'guest'
    });

    const result = await updateEvent(eventId, updateData);

    if (result.matchedCount === 0) {
      return res.status(500).json({ error: 'Failed to update seat statuses' });
    }

    // 将票务信息添加到数据库
    for (const seatId of seats) {
      const seat = event.seat[seatId];
      const ticketData = {
        username: user.username || 'guest',
        eventId: event._id,
        title: event.title,
        date: event.date,
        description: event.description,
        venue: event.venue,
        type: seat.type,
        price: seat.type === 'ev-charging' ? event.evPrice : event.normalPrice,
        seatNo: seatId,
      };

      if (discountApplied) {
        ticketData.price -= 10 / seats.length; // 将折扣分摊到每张票上
      }

      await addTicket(ticketData);
    }

    res.status(200).json({ message: 'Payment processed successfully' });
  } catch (err) {
    console.error('Error processing payment:', err);
    res.status(500).json({ error: 'An error occurred while processing the payment' });
  }
});

export default router;
