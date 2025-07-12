const mockData = require('../data/mockData');
const db = require('./db');

const useDb = process.env.USE_MSSQL === 'true';

async function getTickets() {
  if (!useDb) return mockData.tickets;
  const rows = await db.query('SELECT * FROM V_Ticket_Master_Expanded');
  return rows;
}

async function getTicketById(id) {
  if (!useDb) return mockData.tickets.find(t => t.id === Number(id));
  const rows = await db.query('SELECT * FROM V_Ticket_Master_Expanded WHERE Ticket_ID = ?', [id]);
  return rows[0];
}

module.exports = { getTickets, getTicketById };
