// routes/events.js

import express from 'express';
import { getAllEvents, getEventById, searchEvents, createEvent, updateEvent, deleteEvent } from '../eventdb.js';
import { connectToDatabase } from '../dbclient.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

//文件上传配置event_management
// 处理文件上传配置
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', '..', 'public', 'assets')); // 确保路径正确
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

const upload = multer({ storage: storage });

// Route to get all events
router.get('/events', async (req, res) => {
  try {
    const events = await getAllEvents();
    res.json(events);
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ error: 'An error occurred while fetching events' });
  }
});

// Route to search events
router.get('/events/search', async (req, res) => {
  try {
    const searchParams = req.query;
    const events = await searchEvents(searchParams);
    res.json(events);
  } catch (err) {
    console.error('Error searching events:', err);
    res.status(500).json({ error: 'An error occurred while searching events' });
  }
});

// Route for autocomplete suggestions
router.get('/events/suggestions', async (req, res) => {
  try {
    const q = req.query.q || '';
    const db = await connectToDatabase();
    const eventsCollection = db.collection('events');
    const suggestions = await eventsCollection
      .find({ title: { $regex: new RegExp(`^${q}`, 'i') } })
      .project({ title: 1 })
      .limit(5)
      .toArray();

    res.json(suggestions.map((event) => event.title));
  } catch (err) {
    console.error('Error fetching suggestions:', err);
    res.status(500).json({ error: 'An error occurred while fetching suggestions' });
  }
});

// Route to get event by ID
router.get('/events/:id', async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await getEventById(eventId);
    if (event) {
      res.json(event);
    } else {
      res.status(404).json({ error: 'Event not found' });
    }
  } catch (err) {
    console.error('Error fetching event by ID:', err);
    res.status(500).json({ error: 'An error occurred while fetching the event' });
  }
});

// Route to create a new event
router.post('/events', upload.single('coverImage'), async (req, res) => {
  try {
    const eventData = req.body;

    // 处理数值字段
    eventData.tickets = parseInt(eventData.tickets);
    eventData.normalPrice = parseFloat(eventData.normalPrice);
    eventData.evPrice = parseFloat(eventData.evPrice);

    // 处理上传的图片
    if (req.file) {
      eventData.coverImage = 'assets/' + req.file.filename;
    }

    // 初始化座位，如果需要
    if (!eventData.seat) {
      eventData.seat = generateDefaultSeatMap(); // 需要实现此函数
    }

    await createEvent(eventData);
    res.status(201).json({ message: 'Event created successfully' });
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ error: 'An error occurred while creating the event' });
  }
});

// Route to update an event
router.put('/events/:id', upload.single('coverImage'), async (req, res) => {
  try {
    const eventId = req.params.id;
    const updateData = req.body;

    // 处理数值字段
    if (updateData.tickets) updateData.tickets = parseInt(updateData.tickets);
    if (updateData.normalPrice) updateData.normalPrice = parseFloat(updateData.normalPrice);
    if (updateData.evPrice) updateData.evPrice = parseFloat(updateData.evPrice);

    // 处理上传的图片
    if (req.file) {
      updateData.coverImage = 'assets/' + req.file.filename;
    }

    const modifiedCount = await updateEvent(eventId, updateData);
    if (modifiedCount > 0) {
      res.json({ message: 'Event updated successfully' });
    } else {
      res.status(404).json({ error: 'Event not found' });
    }
  } catch (err) {
    console.error('Error updating event:', err);
    res.status(500).json({ error: 'An error occurred while updating the event' });
  }
});

// Route to delete an event
router.delete('/events/:id', async (req, res) => {
  try {
    const eventId = req.params.id;
    const deletedCount = await deleteEvent(eventId);
    if (deletedCount > 0) {
      res.json({ message: 'Event deleted successfully' });
    } else {
      res.status(404).json({ error: 'Event not found' });
    }
  } catch (err) {
    console.error('Error deleting event:', err);
    res.status(500).json({ error: 'An error occurred while deleting the event' });
  }
});

// Helper function to generate a default seat map
function generateDefaultSeatMap() {
  const rows = ['A', 'B', 'C', 'D'];
  const cols = 9;
  const seatMap = {};

  rows.forEach((row) => {
    for (let i = 1; i <= cols; i++) {
      const seatId = `${row}${i}`;
      seatMap[seatId] = {
        valid: true,
        occupied: false,
        type: row === 'A' && i === 2 ? 'ev-charging' : 'normal', // 示例逻辑
        userID: 'none',
      };
    }
  });

  return seatMap;
}

// Route to update a single seat
router.patch('/events/:id/seats/:seatId', async (req, res) => {
  try {
    const eventId = req.params.id;
    const seatId = req.params.seatId;
    const updateData = req.body; // 预期包含 valid 和 type 字段

    // 构建动态更新对象
    const updateObject = {};
    if (typeof updateData.valid !== 'undefined') {
      updateObject[`seat.${seatId}.valid`] = updateData.valid;
    }
    if (typeof updateData.type !== 'undefined') {
      updateObject[`seat.${seatId}.type`] = updateData.type;
    }

    if (Object.keys(updateObject).length === 0) {
      return res.status(400).json({ error: 'No valid fields provided for update.' });
    }

    const modifiedCount = await updateEvent(eventId, updateObject);
    if (modifiedCount > 0) {
      res.json({ message: 'Seat updated successfully' });
    } else {
      res.status(404).json({ error: 'Event or seat not found' });
    }
  } catch (err) {
    console.error('Error updating seat:', err);
    res.status(500).json({ error: 'An error occurred while updating the seat' });
  }
});

export default router;
