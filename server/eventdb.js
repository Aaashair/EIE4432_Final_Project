// server/eventdb.js

import { connectToDatabase } from './dbclient.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to initialize the events collection
export async function initializeEventsCollection() {
  const db = await connectToDatabase();
  const eventsCollection = db.collection('events');

  const count = await eventsCollection.countDocuments();

  if (count === 0) {
    // If collection is empty, load data from events.json
    const dataPath = path.join(__dirname, '..', 'events.json');
    const jsonData = fs.readFileSync(dataPath, 'utf-8');
    const events = JSON.parse(jsonData);

    await eventsCollection.insertMany(events);

    console.log('Events collection has been initialized with data from events.json');
  } else {
    console.log('Events collection already has data, skipping initialization');
  }
}

// CRUD functions
export async function getAllEvents() {
  const db = await connectToDatabase();
  const eventsCollection = db.collection('events');

  const events = await eventsCollection.find().toArray();

  return events;
}

export async function getEventById(eventId) {
  const db = await connectToDatabase();
  const eventsCollection = db.collection('events');

  const event = await eventsCollection.findOne({ _id: eventId });

  return event;
}

export async function searchEvents(searchParams) {
  const db = await connectToDatabase();
  const eventsCollection = db.collection('events');

  const query = {};

  if (searchParams.search) {
    const searchRegex = new RegExp(searchParams.search, 'i');
    query.$or = [{ title: searchRegex }, { venue: searchRegex }, { description: searchRegex }];
  }

  if (searchParams.date) {
    query.date = searchParams.date;
  }

  const events = await eventsCollection.find(query).toArray();

  return events;
}

export async function createEvent(eventData) {
  const db = await connectToDatabase();
  const eventsCollection = db.collection('events');

  const result = await eventsCollection.insertOne(eventData);

  return result.insertedId;
}

export async function updateEvent(eventId, updateData) {
  const db = await connectToDatabase();
  const eventsCollection = db.collection('events');

  const result = await eventsCollection.updateOne({ _id: eventId }, { $set: updateData });

  return result.modifiedCount;
}

export async function deleteEvent(eventId) {
  const db = await connectToDatabase();
  const eventsCollection = db.collection('events');

  const result = await eventsCollection.deleteOne({ _id: eventId });

  return result.deletedCount;
}
