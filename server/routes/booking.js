// server/routes/booking.js

import express from 'express';
import { getAllEvents, updateEvent } from '../eventdb.js';
import { connectToDatabase } from '../dbclient.js';

const router = express.Router();

// 预订停车位
router.post('/booking', async (req, res) => {
  try {
    const { seats } = req.body;

    if (!seats || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ error: 'No seats provided for booking.' });
    }

    const db = await connectToDatabase();
    const eventsCollection = db.collection('events');

    // 检查所有选择的停车位是否可用
    const availableSeats = await eventsCollection
      .find({
        _id: { $in: seats },
        status: 'available',
      })
      .toArray();

    if (availableSeats.length !== seats.length) {
      return res.status(400).json({ error: 'One or more selected seats are no longer available.' });
    }

    // 更新选择的停车位状态为占用
    const updateResult = await eventsCollection.updateMany({ _id: { $in: seats } }, { $set: { status: 'occupied' } });

    res.json({ message: 'Booking successful.' });
  } catch (err) {
    console.error('Error processing booking:', err);
    res.status(500).json({ error: 'An error occurred while processing the booking.' });
  }
});

export default router;
