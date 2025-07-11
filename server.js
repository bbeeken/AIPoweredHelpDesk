const express = require('express');
const bodyParser = require('body-parser');
const n8nClient = require('./utils/n8nClient');
const data = require('./data/mockData');

const app = express();
app.use(bodyParser.json());

// helper to track next ticket id
let nextTicketId = data.tickets.reduce((m, t) => Math.max(m, t.id), 0) + 1;

// Middleware to simulate authentication
app.use((req, res, next) => {
  req.user = data.users[0];
  next();
});

// Dashboard route
app.get('/dashboard', (req, res) => {
  const userTickets = data.tickets.filter(t => t.assigneeId === req.user.id);
  const pending = userTickets.filter(t => t.status === 'waiting');
  let message = `Hi ${req.user.name}, you have ${userTickets.length} tickets assigned to you.`;
  if (pending.length) {
    const t = pending[0];
    message += ` Ticket ${t.id} appears to be waiting for your response. They asked: ${t.question}`;
  }
  res.json({message});
});

// List all tickets
app.get('/tickets', (req, res) => {
  let tickets = data.tickets;
  const { status, priority, tag } = req.query;
  if (status) tickets = tickets.filter(t => t.status === status);
  if (priority) tickets = tickets.filter(t => t.priority === priority);
  if (tag) tickets = tickets.filter(t => (t.tags || []).includes(tag));
  res.json(tickets);
});

// View a single ticket
app.get('/tickets/:id', (req, res) => {
  const ticket = data.tickets.find(t => t.id === Number(req.params.id));
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  res.json(ticket);
});

// Create a new ticket
app.post('/tickets', (req, res) => {
  const { question, assigneeId, priority, dueDate, tags } = req.body;
  if (!question) return res.status(400).json({ error: 'question required' });
  const ticket = {
    id: nextTicketId++,
    assigneeId: assigneeId || req.user.id,
    submitterId: req.user.id,
    status: 'open',
    priority: priority || 'medium',
    question,
    dueDate: dueDate || null,
    tags: Array.isArray(tags) ? tags : [],
    comments: []
  };
  data.tickets.push(ticket);
  res.status(201).json(ticket);
});

// Update an existing ticket
app.patch('/tickets/:id', (req, res) => {
  const ticket = data.tickets.find(t => t.id === Number(req.params.id));
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  const { status, assigneeId, priority, dueDate } = req.body;
  if (status) ticket.status = status;
  if (assigneeId) ticket.assigneeId = assigneeId;
  if (priority) ticket.priority = priority;
  if (dueDate) ticket.dueDate = dueDate;
  res.json(ticket);
});

// List attachments for a ticket
app.get('/tickets/:id/attachments', (req, res) => {
  const ticket = data.tickets.find(t => t.id === Number(req.params.id));
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  res.json(ticket.attachments || []);
});

// Add an attachment to a ticket
app.post('/tickets/:id/attachments', (req, res) => {
  const ticket = data.tickets.find(t => t.id === Number(req.params.id));
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  const { name, url } = req.body;
  if (!name || !url) return res.status(400).json({ error: 'name and url required' });
  const attach = {
    id: (ticket.attachments && ticket.attachments.length ? Math.max(...ticket.attachments.map(a => a.id)) : 0) + 1,
    name,
    url,
    uploaded: new Date().toISOString()
  };
  ticket.attachments = ticket.attachments || [];
  ticket.attachments.push(attach);
  res.status(201).json(attach);
});

// Add a comment to a ticket
app.post('/tickets/:id/comments', (req, res) => {
  const ticket = data.tickets.find(t => t.id === Number(req.params.id));
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'text required' });
  const comment = { userId: req.user.id, text, date: new Date().toISOString() };
  ticket.comments.push(comment);
  res.status(201).json(comment);
});

// List tags for a ticket
app.get('/tickets/:id/tags', (req, res) => {
  const ticket = data.tickets.find(t => t.id === Number(req.params.id));
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  res.json(ticket.tags || []);
});

// Add tags to a ticket
app.post('/tickets/:id/tags', (req, res) => {
  const ticket = data.tickets.find(t => t.id === Number(req.params.id));
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  const { tag, tags } = req.body;
  const newTags = tags || (tag ? [tag] : []);
  if (!newTags.length) return res.status(400).json({ error: 'tag or tags required' });
  ticket.tags = ticket.tags || [];
  newTags.forEach(t => {
    if (!ticket.tags.includes(t)) ticket.tags.push(t);
  });
  res.status(201).json(ticket.tags);
});

// Remove a tag from a ticket
app.delete('/tickets/:id/tags/:tag', (req, res) => {
  const ticket = data.tickets.find(t => t.id === Number(req.params.id));
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  const tag = req.params.tag;
  ticket.tags = (ticket.tags || []).filter(t => t !== tag);
  res.json(ticket.tags);
});

// Search tickets by text or tag
app.get('/tickets/search', (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);
  const query = q.toLowerCase();
  const tickets = data.tickets.filter(t => {
    return (
      t.question.toLowerCase().includes(query) ||
      (t.comments || []).some(c => c.text.toLowerCase().includes(query)) ||
      (t.tags || []).some(tag => tag.toLowerCase().includes(query))
    );
  });
  res.json(tickets);
});

// List overdue tickets
app.get('/tickets/overdue', (req, res) => {
  const now = Date.now();
  const tickets = data.tickets.filter(t => t.dueDate && new Date(t.dueDate).getTime() < now && t.status !== 'closed');
  res.json(tickets);
});

// AI endpoint for natural language commands
app.post('/ai', async (req, res) => {
  const { text } = req.body;
  try {
    const response = await n8nClient.processText(text, req.user);
    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process text' });
  }
});

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
