// server/ticketsdb.js

import { connectToDatabase } from './dbclient.js';

// 函数：初始化票务集合（可选）
export async function initializeTicketsCollection() {
  const db = await connectToDatabase();
  const ticketsCollection = db.collection('tickets');

  // 如果需要，可以在此处执行集合的初始化操作（如创建索引）
}

// 函数：获取所有票务信息
export async function getAllTickets() {
  const db = await connectToDatabase();
  const ticketsCollection = db.collection('tickets');

  const tickets = await ticketsCollection.find().toArray();
  return tickets;
}

// 函数：根据用户名获取票务信息
export async function getTicketsByUsername(username) {
  try {
    const tickets = await getAllTickets();
    const userTickets = tickets.filter((ticket) => ticket.username === username);
    return userTickets;
  } catch (err) {
    console.error('Error getting tickets for username:', err);
    throw err;
  }
}

// 函数：增加新的票务信息
export async function addTicket(ticketData) {
  const db = await connectToDatabase();
  const ticketsCollection = db.collection('tickets');

  const result = await ticketsCollection.insertOne(ticketData);
  return result.insertedId;
}
