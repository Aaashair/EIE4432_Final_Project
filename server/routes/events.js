// routes/events.js

import express from 'express';
import { getAllEvents, getEventById, searchEvents } from '../eventdb.js';

import { connectToDatabase } from '../dbclient.js';

const router = express.Router();

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

export default router;
