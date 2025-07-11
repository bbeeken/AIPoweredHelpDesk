const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const n8nClient = require('./utils/n8nClient');
const qdrant = require('./utils/qdrantClient');
const data = require('./data/mockData');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// helper to track next ticket and asset ids
let nextTicketId = data.tickets.reduce((m, t) => Math.max(m, t.id), 0) + 1;
let nextAssetId = (data.assets || []).reduce((m, a) => Math.max(m, a.id), 0) + 1;

// choose user with fewest open tickets
function getLeastBusyUserId() {
  const counts = {};
  data.users.forEach(u => (counts[u.id] = 0));
  data.tickets.forEach(t => {
    if (t.status !== 'closed' && counts[t.assigneeId] !== undefined) {
      counts[t.assigneeId]++;
    }
  });
  let chosen = data.users[0];
  data.users.forEach(u => {
    if (counts[u.id] < counts[chosen.id]) chosen = u;
  });
  return chosen.id;
}

// Middleware to simulate authentication
app.use((req, res, next) => {
  req.user = data.users[0];
  next();
});

// Dashboard route with ticket stats and asset info
app.get('/dashboard', (req, res) => {
  const userTickets = data.tickets.filter(t => t.assigneeId === req.user.id);
  const assets = data.assets.filter(a => a.assignedTo === req.user.id);
  const pending = userTickets.filter(t => t.status === 'waiting');
  const openCount = userTickets.filter(t => t.status === 'open').length;
  const closedCount = userTickets.filter(t => t.status === 'closed').length;

  let message = `Hi ${req.user.name}, you have ${userTickets.length} tickets assigned to you.`;
  message += ` (${openCount} open / ${closedCount} closed)`;
  if (pending.length) {
    const t = pending[0];
    message += ` Ticket ${t.id} appears to be waiting for your response. They asked: ${t.question}`;
  }
  if (assets.length) {
    message += ` You manage ${assets.length} assets.`;
  }
  res.json({ message });
});

// List all tickets
app.get('/tickets', (req, res) => {
  let tickets = data.tickets;
  const { status, priority, tag, assignee } = req.query;
  if (status) tickets = tickets.filter(t => t.status === status);
  if (priority) tickets = tickets.filter(t => t.priority === priority);
  if (tag) tickets = tickets.filter(t => (t.tags || []).includes(tag));
  if (assignee) tickets = tickets.filter(t => t.assigneeId === Number(assignee));
  res.json(tickets);
});

// Tickets assigned to a specific user
app.get('/tickets/assigned/:userId', (req, res) => {
  const uid = Number(req.params.userId);
  const tickets = data.tickets.filter(t => t.assigneeId === uid);
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
  const assignedId = assigneeId || getLeastBusyUserId();
  const ticket = {
    id: nextTicketId++,
    assigneeId: assignedId,
    submitterId: req.user.id,
    status: 'open',
    priority: priority || 'medium',
    question,
    dueDate: dueDate || null,
    tags: Array.isArray(tags) ? tags : [],
    comments: [],
    history: [
      { action: 'created', by: req.user.id, date: new Date().toISOString() }
    ]
  };
  data.tickets.push(ticket);
  res.status(201).json(ticket);
  qdrant
    .addTicketText(ticket.id, ticket.question)
    .catch(err => console.error('Qdrant indexing failed:', err.message));
});

// Update an existing ticket
app.patch('/tickets/:id', (req, res) => {
  const ticket = data.tickets.find(t => t.id === Number(req.params.id));
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  const { status, assigneeId, priority, dueDate } = req.body;
  const now = new Date().toISOString();
  if (status && status !== ticket.status) {
    ticket.history = ticket.history || [];
    ticket.history.push({ action: 'status', from: ticket.status, to: status, by: req.user.id, date: now });
    ticket.status = status;
  }
  if (assigneeId && assigneeId !== ticket.assigneeId) {
    ticket.history = ticket.history || [];
    ticket.history.push({ action: 'assignee', from: ticket.assigneeId, to: assigneeId, by: req.user.id, date: now });
    ticket.assigneeId = assigneeId;
  }
  if (priority && priority !== ticket.priority) {
    ticket.history = ticket.history || [];
    ticket.history.push({ action: 'priority', from: ticket.priority, to: priority, by: req.user.id, date: now });
    ticket.priority = priority;
  }
  if (dueDate && dueDate !== ticket.dueDate) {
    ticket.dueDate = dueDate;
  }
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

// List comments for a ticket
app.get('/tickets/:id/comments', (req, res) => {
  const ticket = data.tickets.find(t => t.id === Number(req.params.id));
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  res.json(ticket.comments || []);
});

// View ticket change history
app.get('/tickets/:id/history', (req, res) => {
  const ticket = data.tickets.find(t => t.id === Number(req.params.id));
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  res.json(ticket.history || []);
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

// List tickets due within the next N days (default 3)
app.get('/tickets/due-soon', (req, res) => {
  const days = Number(req.query.days) || 3;
  const now = Date.now();
  const cutoff = now + days * 24 * 60 * 60 * 1000;
  const tickets = data.tickets.filter(t => {
    if (!t.dueDate || t.status === 'closed') return false;
    const due = new Date(t.dueDate).getTime();
    return due >= now && due <= cutoff;
  });
  res.json(tickets);
});

// List open tickets created more than N days ago (default 7)
app.get('/tickets/aging', (req, res) => {
  const days = Number(req.query.days) || 7;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const tickets = data.tickets.filter(t => {
    if (t.status === 'closed') return false;
    const createdEntry = (t.history || []).find(h => h.action === 'created');
    if (!createdEntry) return false;
    const created = new Date(createdEntry.date).getTime();
    return created < cutoff;
  });
  res.json(tickets);
});

// Simple system stats
app.get('/stats', (req, res) => {
  const stats = {
    tickets: {
      open: data.tickets.filter(t => t.status === 'open').length,
      waiting: data.tickets.filter(t => t.status === 'waiting').length,
      closed: data.tickets.filter(t => t.status === 'closed').length
    },
    assets: {
      total: (data.assets || []).length
    }
  };
  res.json(stats);
});

// Asset management endpoints
app.get('/assets', (req, res) => {
  let assets = data.assets || [];
  const { tag, assignedTo } = req.query;
  if (tag) assets = assets.filter(a => (a.tags || []).includes(tag));
  if (assignedTo) assets = assets.filter(a => String(a.assignedTo) === String(assignedTo));
  res.json(assets);
});

// Assets assigned to a specific user
app.get('/assets/assigned/:userId', (req, res) => {
  const uid = Number(req.params.userId);
  const assets = (data.assets || []).filter(a => a.assignedTo === uid);
  res.json(assets);
});

app.post('/assets', (req, res) => {
  const { name, assignedTo, tags } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const asset = {
    id: nextAssetId++,
    name,
    assignedTo: assignedTo || null,
    history: [],
    maintenance: [],
    tags: Array.isArray(tags) ? tags : []
  };
  data.assets = data.assets || [];
  data.assets.push(asset);
  res.status(201).json(asset);
});

app.get('/assets/:id', (req, res) => {
  const asset = (data.assets || []).find(a => a.id === Number(req.params.id));
  if (!asset) return res.status(404).json({ error: 'Asset not found' });
  res.json(asset);
});

// View asset assignment history
app.get('/assets/:id/history', (req, res) => {
  const asset = (data.assets || []).find(a => a.id === Number(req.params.id));
  if (!asset) return res.status(404).json({ error: 'Asset not found' });
  res.json(asset.history || []);
});

app.patch('/assets/:id', (req, res) => {
  const asset = (data.assets || []).find(a => a.id === Number(req.params.id));
  if (!asset) return res.status(404).json({ error: 'Asset not found' });
  const { name, assignedTo } = req.body;
  const now = new Date().toISOString();
  if (name && name !== asset.name) {
    asset.name = name;
  }
  if (assignedTo !== undefined && assignedTo !== asset.assignedTo) {
    asset.history = asset.history || [];
    asset.history.push({ from: asset.assignedTo, to: assignedTo, date: now });
    asset.assignedTo = assignedTo;
  }
  res.json(asset);
});

// List tags for an asset
app.get('/assets/:id/tags', (req, res) => {
  const asset = (data.assets || []).find(a => a.id === Number(req.params.id));
  if (!asset) return res.status(404).json({ error: 'Asset not found' });
  res.json(asset.tags || []);
});

// Add tags to an asset
app.post('/assets/:id/tags', (req, res) => {
  const asset = (data.assets || []).find(a => a.id === Number(req.params.id));
  if (!asset) return res.status(404).json({ error: 'Asset not found' });
  const { tag, tags } = req.body;
  const newTags = tags || (tag ? [tag] : []);
  if (!newTags.length) return res.status(400).json({ error: 'tag or tags required' });
  asset.tags = asset.tags || [];
  newTags.forEach(t => {
    if (!asset.tags.includes(t)) asset.tags.push(t);
  });
  res.status(201).json(asset.tags);
});

// Remove a tag from an asset
app.delete('/assets/:id/tags/:tag', (req, res) => {
  const asset = (data.assets || []).find(a => a.id === Number(req.params.id));
  if (!asset) return res.status(404).json({ error: 'Asset not found' });
  const tag = req.params.tag;
  asset.tags = (asset.tags || []).filter(t => t !== tag);
  res.json(asset.tags);
});

// View maintenance records for an asset
app.get('/assets/:id/maintenance', (req, res) => {
  const asset = (data.assets || []).find(a => a.id === Number(req.params.id));
  if (!asset) return res.status(404).json({ error: 'Asset not found' });
  res.json(asset.maintenance || []);
});

// Add a maintenance record to an asset
app.post('/assets/:id/maintenance', (req, res) => {
  const asset = (data.assets || []).find(a => a.id === Number(req.params.id));
  if (!asset) return res.status(404).json({ error: 'Asset not found' });
  const { description, cost } = req.body;
  if (!description) return res.status(400).json({ error: 'description required' });
  const record = { description, cost: cost || 0, date: new Date().toISOString() };
  asset.maintenance = asset.maintenance || [];
  asset.maintenance.push(record);
  res.status(201).json(record);
});

// Get total maintenance cost for an asset
app.get('/assets/:id/maintenance/total-cost', (req, res) => {
  const asset = (data.assets || []).find(a => a.id === Number(req.params.id));
  if (!asset) return res.status(404).json({ error: 'Asset not found' });
  const total = (asset.maintenance || []).reduce((sum, r) => sum + (r.cost || 0), 0);
  res.json({ total });
});

// Mark an asset as depreciated by setting depreciationDate to now
app.post('/assets/:id/depreciate', (req, res) => {
  const asset = (data.assets || []).find(a => a.id === Number(req.params.id));
  if (!asset) return res.status(404).json({ error: 'Asset not found' });
  asset.depreciationDate = new Date().toISOString();
  res.json(asset);
});

// Retire an asset by setting retirementDate to now
app.post('/assets/:id/retire', (req, res) => {
  const asset = (data.assets || []).find(a => a.id === Number(req.params.id));
  if (!asset) return res.status(404).json({ error: 'Asset not found' });
  asset.retirementDate = new Date().toISOString();
  res.json(asset);
});

// List all depreciated assets
app.get('/assets/depreciated', (req, res) => {
  const assets = (data.assets || []).filter(a => a.depreciationDate);
  res.json(assets);
});

// List all retired assets
app.get('/assets/retired', (req, res) => {
  const assets = (data.assets || []).filter(a => a.retirementDate);
  res.json(assets);
});

// Search assets by name
app.get('/assets/search', (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);
  const query = q.toLowerCase();
  const assets = (data.assets || []).filter(a =>
    a.name.toLowerCase().includes(query)
  );
  res.json(assets);
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
