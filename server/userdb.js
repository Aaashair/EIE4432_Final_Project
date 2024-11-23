// server/userdb.js

import { connectToDatabase } from './dbclient.js';
import bcrypt from 'bcrypt';
import fs from 'fs/promises';
import path from 'path';

// Import modules to define __dirname
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Define __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const collectionName = 'usersinfo';
let usersCollection;

async function getUsersCollection() {
  if (!usersCollection) {
    const db = await connectToDatabase();
    usersCollection = db.collection(collectionName);
  }
  return usersCollection;
}

async function init_db() {
  try {
    const collection = await getUsersCollection();

    const count = await collection.countDocuments();
    if (count === 0) {
      // Read users from users.json
      const data = await fs.readFile(path.join(__dirname, '..', 'users.json'), 'utf8');
      const userArray = JSON.parse(data);

      // Hash passwords
      const hashedUsers = await Promise.all(
        userArray.map(async (user) => {
          const hashedPassword = await bcrypt.hash(user.password, 10);
          return { ...user, password: hashedPassword };
        })
      );

      // Insert users into database
      const result = await collection.insertMany(hashedUsers);
      console.log(`Added ${result.insertedCount} users`);
    } else {
      console.log('Database already initialized with users.');
    }
  } catch (err) {
    console.error('Unable to initialize the database!');
    console.error(err);
  }
}

init_db().catch(console.error);

// Update or insert user
async function update_user(user) {
  try {
    const { username, password, nickname, email, birthday, gender, role, enabled } = user;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user object
    const newUser = {
      username,
      password: hashedPassword,
      nickname,
      email,
      birthday,
      gender,
      role,
      enabled,
    };

    const collection = await getUsersCollection();

    const result = await collection.updateOne({ username }, { $set: newUser }, { upsert: true });

    return true;
  } catch (err) {
    console.error('Unable to update the database!');
    console.error(err);
    return false;
  }
}

// Check if username exists
async function username_exist(username) {
  try {
    const collection = await getUsersCollection();
    const user = await collection.findOne({ username: username });
    return user !== null;
  } catch (err) {
    console.error('Unable to fetch from database!');
    console.error(err);
    return false;
  }
}

// Validate user credentials
async function validate_user(username, password) {
  try {
    const collection = await getUsersCollection();
    const user = await collection.findOne({ username: username });

    if (user && user.enabled) {
      // Compare passwords
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        // Password matches
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      } else {
        // Password does not match
        return false;
      }
    } else {
      // User does not exist or is disabled
      return false;
    }
  } catch (err) {
    console.error('Unable to fetch from database!');
    console.error(err);
    return false;
  }
}

export { update_user, username_exist, validate_user };
