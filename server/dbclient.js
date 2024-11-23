// server/dbclient.js

import { MongoClient } from 'mongodb';
import config from './config.js';

const currentDateTime = new Date().toLocaleString();
console.log(currentDateTime);

const connect_uri = config.CONNECTION_STR;

const client = new MongoClient(connect_uri);

let _db;

async function connectToDatabase() {
  if (!_db) {
    try {
      await client.connect();
      _db = client.db('ParkingLot'); // Use your database name
      console.log('Successfully connected to the database!');
    } catch (err) {
      console.error('Unable to establish connection to the database!');
      console.error(err);
      process.exit(1);
    }
  }
  return _db;
}

export { connectToDatabase };
