const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const n8nClient = require('./utils/n8nClient');
const qdrant = require('./utils/qdrantClient');
const data = require('./data/mockData');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

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
    ticket.history = ticket.history || [];
    ticket.history.push({
      action: 'dueDate',
      from: ticket.dueDate,
      to: dueDate,
      by: req.user.id,
      date: now
    });
    ticket.dueDate = dueDate;
  }
  res.json(ticket);
});

// Delete a ticket
app.delete('/tickets/:id', (req, res) => {
  const index = data.tickets.findIndex(t => t.id === Number(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'Ticket not found' });
  }
  data.tickets.splice(index, 1);
  res.json({ success: true });
});

// Reassign ticket to the least busy user
app.post('/tickets/:id/reassign-least-busy', (req, res) => {
  const ticket = data.tickets.find(t => t.id === Number(req.params.id));
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  const newId = getLeastBusyUserId();
  if (newId !== ticket.assigneeId) {
    ticket.history = ticket.history || [];
    ticket.history.push({
      action: 'assignee',
      from: ticket.assigneeId,
      to: newId,
      by: req.user.id,
      date: new Date().toISOString()
    });
    ticket.assigneeId = newId;
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

// Remove an attachment from a ticket
app.delete('/tickets/:id/attachments/:attachmentId', (req, res) => {
  const ticket = data.tickets.find(t => t.id === Number(req.params.id));
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  const attId = Number(req.params.attachmentId);
  ticket.attachments = ticket.attachments || [];
  const initial = ticket.attachments.length;
  ticket.attachments = ticket.attachments.filter(a => a.id !== attId);
  if (ticket.attachments.length === initial) {
    return res.status(404).json({ error: 'Attachment not found' });
  }
  res.json(ticket.attachments);
});

// Add a comment to a ticket
app.post('/tickets/:id/comments', (req, res) => {
  const ticket = data.tickets.find(t => t.id === Number(req.params.id));
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'text required' });
  const nextId =
    (ticket.comments || []).reduce((m, c) => Math.max(m, c.id || 0), 0) + 1;
  const comment = {
    id: nextId,
    userId: req.user.id,
    text,
    date: new Date().toISOString()
  };
  ticket.comments.push(comment);
  res.status(201).json(comment);
});

// List comments for a ticket
app.get('/tickets/:id/comments', (req, res) => {
  const ticket = data.tickets.find(t => t.id === Number(req.params.id));
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  res.json(ticket.comments || []);
});

// Delete a comment from a ticket
app.delete('/tickets/:id/comments/:commentId', (req, res) => {
  const ticket = data.tickets.find(t => t.id === Number(req.params.id));
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  const cid = Number(req.params.commentId);
  ticket.comments = ticket.comments || [];
  const index = ticket.comments.findIndex(c => (c.id || 0) === cid);
  if (index === -1) return res.status(404).json({ error: 'Comment not found' });
  ticket.comments.splice(index, 1);
  res.json(ticket.comments);
});

// Edit a comment on a ticket
app.patch('/tickets/:id/comments/:commentId', (req, res) => {
  const ticket = data.tickets.find(t => t.id === Number(req.params.id));
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  const cid = Number(req.params.commentId);
  ticket.comments = ticket.comments || [];
  const comment = ticket.comments.find(c => (c.id || 0) === cid);
  if (!comment) return res.status(404).json({ error: 'Comment not found' });
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'text required' });
  comment.text = text;
  comment.edited = new Date().toISOString();
  res.json(comment);
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

// Mean Time To Resolution in hours
app.get('/stats/mttr', (req, res) => {
  const durations = data.tickets
    .filter(t => t.status === 'closed')
    .map(t => {
      const created = (t.history || []).find(h => h.action === 'created');
      const closed = (t.history || []).find(
        h => h.action === 'status' && h.to === 'closed'
      );
      if (!created || !closed) return null;
      return new Date(closed.date).getTime() - new Date(created.date).getTime();
    })
    .filter(d => d !== null);
  const avg = durations.length
    ? durations.reduce((sum, d) => sum + d, 0) / durations.length
    : 0;
  res.json({ mttr: avg / 3600000 });
});

// Ticket counts per user by status
app.get('/stats/workload', (req, res) => {
  const workload = data.users.map(u => ({
    userId: u.id,
    open: data.tickets.filter(
      t => t.assigneeId === u.id && t.status === 'open'
    ).length,
    waiting: data.tickets.filter(
      t => t.assigneeId === u.id && t.status === 'waiting'
    ).length,
    closed: data.tickets.filter(
      t => t.assigneeId === u.id && t.status === 'closed'
    ).length
  }));
  res.json(workload);
});

// Ticket counts per priority across all tickets
app.get('/stats/priorities', (req, res) => {
  const counts = {};
  data.tickets.forEach(t => {
    const p = t.priority || 'unspecified';
    counts[p] = (counts[p] || 0) + 1;
  });
  res.json(counts);
});

// Summary stats for a specific user
app.get('/stats/user/:userId', (req, res) => {
  const uid = Number(req.params.userId);
  const user = data.users.find(u => u.id === uid);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const tickets = data.tickets.filter(t => t.assigneeId === uid);
  const assets = (data.assets || []).filter(a => a.assignedTo === uid);
  const summary = {
    userId: uid,
    tickets: {
      open: tickets.filter(t => t.status === 'open').length,
      waiting: tickets.filter(t => t.status === 'waiting').length,
      closed: tickets.filter(t => t.status === 'closed').length
    },
    assets: assets.length
  };
  res.json(summary);
});

// Ticket counts per tag across all tickets
app.get('/stats/tags', (req, res) => {
  const counts = {};
  data.tickets.forEach(t => {
    (t.tags || []).forEach(tag => {
      counts[tag] = (counts[tag] || 0) + 1;
    });
  });
  res.json(counts);
});

// Asset counts per tag across all assets
app.get('/stats/asset-tags', (req, res) => {
  const counts = {};
  (data.assets || []).forEach(a => {
    (a.tags || []).forEach(tag => {
      counts[tag] = (counts[tag] || 0) + 1;
    });
  });
  res.json(counts);
});

// Asset counts per user
app.get('/stats/assets-per-user', (req, res) => {
  const stats = data.users.map(u => ({
    userId: u.id,
    count: (data.assets || []).filter(a => a.assignedTo === u.id).length
  }));
  res.json(stats);
});

// Asset management endpoints
app.get('/assets', (req, res) => {
  let assets = data.assets || [];
  const { tag, assignedTo } = req.query;
  if (tag) assets = assets.filter(a => (a.tags || []).includes(tag));
  if (assignedTo !== undefined) {
    const assignedId = Number(assignedTo);
    assets = assets.filter(a => Number(a.assignedTo) === assignedId);
  }
  res.json(assets);
});

// Assets assigned to a specific user
app.get('/assets/assigned/:userId', (req, res) => {
  const uid = Number(req.params.userId);
  const assets = (data.assets || []).filter(a => a.assignedTo === uid);
  res.json(assets);
});

// List all unassigned assets
app.get('/assets/unassigned', (req, res) => {
  const assets = (data.assets || []).filter(a => !a.assignedTo);
  res.json(assets);
});

app.post('/assets', (req, res) => {
  const { name, assignedTo, tags } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const now = new Date().toISOString();
  const asset = {
    id: nextAssetId++,
    name,
    assignedTo: assignedTo || null,
    history: [
      { action: 'created', by: req.user.id, date: now }
    ],
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
    asset.history = asset.history || [];
    asset.history.push({
      action: 'name',
      from: asset.name,
      to: name,
      by: req.user.id,
      date: now
    });
    asset.name = name;
  }
  if (assignedTo !== undefined && assignedTo !== asset.assignedTo) {
    asset.history = asset.history || [];
    asset.history.push({
      action: 'assignee',
      from: asset.assignedTo,
      to: assignedTo,
      by: req.user.id,
      date: now
    });
    asset.assignedTo = assignedTo;
  }
  res.json(asset);
});

// Delete an asset
app.delete('/assets/:id', (req, res) => {
  const index = (data.assets || []).findIndex(a => a.id === Number(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'Asset not found' });
  }
  data.assets.splice(index, 1);
  res.json({ success: true });
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
  const now = new Date().toISOString();
  asset.depreciationDate = now;
  asset.history = asset.history || [];
  asset.history.push({
    action: 'depreciated',
    by: req.user.id,
    date: now
  });
  res.json(asset);
});

// Retire an asset by setting retirementDate to now
app.post('/assets/:id/retire', (req, res) => {
  const asset = (data.assets || []).find(a => a.id === Number(req.params.id));
  if (!asset) return res.status(404).json({ error: 'Asset not found' });
  const now = new Date().toISOString();
  asset.retirementDate = now;
  asset.history = asset.history || [];
  asset.history.push({
    action: 'retired',
    by: req.user.id,
    date: now
  });
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
