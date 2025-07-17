const express = require("./express");
const path = require("path");
const bodyParser = require("./body-parser");
const n8nClient = require("./utils/n8nClient");
const qdrant = require("./utils/qdrantClient");
const data = require("./data/mockData");
const dataService = require("./utils/dataService");
const auth = require("./utils/authService");
const eventBus = require("./utils/eventBus");

const aiService = require("./utils/aiService");

const wsServer = require("./utils/websocketServer");

const analytics = require("./utils/analyticsEngine");
const reportExporter = require("./utils/reportExporter");

const translation = require("./utils/translationService");
const sentimentService = require("./utils/sentimentService");

const assistant = require("./utils/assistant");

const http = require('http');

const fs = require('fs');
const { Server: IOServer } = require('socket.io');
const app = express();

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));
const reactDist = path.join(__dirname, 'frontend', 'dist');
if (fs.existsSync(reactDist)) {
  app.use(express.static(reactDist));
}
// return 404 for missing static assets instead of triggering auth
app.use((req, res, next) => {
  if (req.method === 'GET' && path.extname(req.path)) {
    return res.status(404).end();
  }
  next();
});
const CORS_ORIGIN = process.env.CORS_ORIGIN;

app.use((req, res, next) => {
  if (CORS_ORIGIN) {
    res.setHeader("Access-Control-Allow-Origin", CORS_ORIGIN);
  }
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PATCH,DELETE,OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    return res.end();
  }
  next();
});

// Simple auth endpoints
app.post("/auth/login", (req, res) => {
  const { username, password } = req.body;
  const result = auth.authenticate(username, password);
  if (!result) return res.status(401).json({ error: "Invalid credentials" });
  res.json({ user: result.user });
});

app.get("/auth/verify", (req, res) => {
  // Tokens are disabled; always return the first user
  res.json({ user: data.users[0] });
});

// Basic health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Server Sent Events endpoint for real-time updates
app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.write(": connected\n\n");

  const ticketCreated = (ticket) => {
    res.write(`event: ticketCreated\ndata:${JSON.stringify(ticket)}\n\n`);
  };
  const ticketUpdated = (ticket) => {
    res.write(`event: ticketUpdated\ndata:${JSON.stringify(ticket)}\n\n`);
  };

  eventBus.on("ticketCreated", ticketCreated);
  eventBus.on("ticketUpdated", ticketUpdated);

  req.on("close", () => {
    eventBus.off("ticketCreated", ticketCreated);
    eventBus.off("ticketUpdated", ticketUpdated);
  });
});

// Stream proactive assistance suggestions
const assistClients = new Set();
app.get("/assist", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.write(": connected\n\n");
  assistClients.add(res);
  req.on("close", () => assistClients.delete(res));
});

app.post("/assist", (req, res) => {
  const { text } = req.body || {};
  const suggestions = assistant.generateSuggestions(text || "");
  const payload = `data:${JSON.stringify(suggestions)}\n\n`;
  assistClients.forEach((c) => c.write(payload));
  res.json({ success: true });
});

// helper to track next ticket and asset ids
let nextTicketId = data.tickets.reduce((m, t) => Math.max(m, t.id), 0) + 1;
let nextAssetId =
  (data.assets || []).reduce((m, a) => Math.max(m, a.id), 0) + 1;
// store saved ticket filter presets per user
let nextFilterId = 1;
const filterPresets = {};
// in-memory notification preferences per user
const notificationPrefs = {};

// choose user with fewest open tickets
function getLeastBusyUserId() {
  const counts = {};
  data.users.forEach((u) => (counts[u.id] = 0));
  data.tickets.forEach((t) => {
    if (t.status !== "closed" && counts[t.assigneeId] !== undefined) {
      counts[t.assigneeId]++;
    }
  });
  let chosen = data.users[0];
  data.users.forEach((u) => {
    if (counts[u.id] < counts[chosen.id]) chosen = u;
  });
  return chosen.id;
}

// Authentication middleware
app.use((req, res, next) => {
  // Tokens are disabled; always use the first user
  req.user = data.users[0];
  next();
});

// Dashboard route with ticket stats and asset info
app.get("/dashboard", (req, res) => {
  const userTickets = data.tickets.filter((t) => t.assigneeId === req.user.id);
  const assets = data.assets.filter((a) => a.assignedTo === req.user.id);
  const pending = userTickets.filter((t) => t.status === "waiting");
  const openCount = userTickets.filter((t) => t.status === "open").length;
  const closedCount = userTickets.filter((t) => t.status === "closed").length;

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
app.get("/tickets", async (req, res) => {
  let tickets = await dataService.getTickets();
  const { status, priority, tag, assignee, submitter, sortBy, order } =
    req.query;
  if (status) tickets = tickets.filter((t) => t.status === status);
  if (priority) tickets = tickets.filter((t) => t.priority === priority);
  if (tag) tickets = tickets.filter((t) => (t.tags || []).includes(tag));
  if (assignee)
    tickets = tickets.filter((t) => t.assigneeId === Number(assignee));
  if (submitter)
    tickets = tickets.filter((t) => t.submitterId === Number(submitter));
  if (sortBy) {
    const dir = order === "desc" ? -1 : 1;
    tickets = tickets.slice().sort((a, b) => {
      const av = a[sortBy];
      const bv = b[sortBy];
      if (av == null) return 1;
      if (bv == null) return -1;
      const aDate = Date.parse(av);
      const bDate = Date.parse(bv);
      if (!isNaN(aDate) && !isNaN(bDate)) {
        return (aDate - bDate) * dir;
      }
      const aNum = Number(av);
      const bNum = Number(bv);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return (aNum - bNum) * dir;
      }
      return av > bv ? dir : av < bv ? -dir : 0;
    });
  }
  tickets.forEach(t => {
    if (!t.sentiment) t.sentiment = sentimentService.analyze(t.question);
  });
  res.json(tickets);
});

// Search tickets by text or tag
app.get("/tickets/search", (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);
  const query = q.toLowerCase();
  const tickets = data.tickets.filter((t) => {
    return (
      t.question.toLowerCase().includes(query) ||
      (t.comments || []).some((c) => c.text.toLowerCase().includes(query)) ||
      (t.tags || []).some((tag) => tag.toLowerCase().includes(query))
    );
  });
  res.json(tickets);
});

// Search using Qdrant vectors
app.get("/tickets/vector-search", async (req, res) => {
  const { q, limit } = req.query;
  if (!q) return res.json([]);
  try {
    const result = await qdrant.searchTickets(String(q), Number(limit) || 5);
    const ids = (result.result || []).map((p) => p.id);
    const tickets = data.tickets.filter((t) => ids.includes(t.id));
    res.json(tickets);
  } catch (err) {
    console.error("Qdrant search failed", err.message);
    const query = String(q).toLowerCase();
    const fallback = data.tickets.filter((t) =>
      t.question.toLowerCase().includes(query)
    );
    res.json(fallback.slice(0, Number(limit) || 5));
  }
});

// Tickets assigned to a specific user
app.get("/tickets/assigned/:userId", (req, res) => {
  const uid = Number(req.params.userId);
  const tickets = data.tickets.filter((t) => t.assigneeId === uid);
  res.json(tickets);
});

// List tickets that are not assigned to anyone
app.get("/tickets/unassigned", (req, res) => {
  const tickets = data.tickets.filter((t) => !t.assigneeId);
  res.json(tickets);
});



// Create a new ticket


app.post("/tickets", async (req, res) => {
  const { question, assigneeId, priority, dueDate, tags } = req.body;
  if (!question) return res.status(400).json({ error: "question required" });

  let assignedId = assigneeId;
  let finalPriority = priority;

  if (assignedId === undefined || finalPriority === undefined) {
    const category = aiService.categorizeTicket(question);
    const defaults = aiService.categoryDefaults[category] || {};
    if (assignedId === undefined) {
      assignedId =
        defaults.assigneeId !== undefined
          ? defaults.assigneeId
          : getLeastBusyUserId();
    }
    if (finalPriority === undefined && defaults.priority) {
      finalPriority = defaults.priority;
    }
  }

  if (assignedId === undefined) assignedId = getLeastBusyUserId();
  if (finalPriority === undefined) finalPriority = "medium";

  const { translated, lang } = await translation.translateToDefault(question);


  const text = translated;


  const ticket = {
    id: nextTicketId++,
    assigneeId: assignedId,
    submitterId: req.user.id,
    status: "open",
    priority: finalPriority,
    question: translated,
    originalQuestion: lang !== "en" ? question : undefined,
    language: lang,
    category: aiService.categorizeTicket(translated),
    sentiment: sentimentService.analyze(question),
    dueDate: dueDate || null,
    tags: Array.isArray(tags) ? tags : [],
    comments: [],
    history: [
      { action: "created", by: req.user.id, date: new Date().toISOString() },
    ],
  };

  try {

    const [sentimentLabel, suggested] = await Promise.all([
      ai.analyzeSentiment(translated),
      ai.suggestTags(translated),

    ]);
    if (ticket.sentiment && typeof ticket.sentiment === "object") {
      ticket.sentiment.label = sentimentLabel;
    } else {
      ticket.sentiment = { label: sentimentLabel };
    }
    suggested.forEach((t) => {
      if (!ticket.tags.includes(t)) ticket.tags.push(t);
    });
  } catch (err) {
    console.error("AI processing failed:", err.message);
  }

  data.tickets.push(ticket);
  eventBus.emit("ticketCreated", ticket);
  res.status(201).json(ticket);
  qdrant
    .addTicketText(ticket.id, ticket.question)
    .catch((err) => console.error("Qdrant indexing failed:", err.message));
});

// Update an existing ticket
app.patch("/tickets/:id", (req, res) => {
  const ticket = data.tickets.find((t) => t.id === Number(req.params.id));
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });
  const { status, assigneeId, priority, dueDate } = req.body;
  const now = new Date().toISOString();
  if (status && status !== ticket.status) {
    ticket.history = ticket.history || [];
    ticket.history.push({
      action: "status",
      from: ticket.status,
      to: status,
      by: req.user.id,
      date: now,
    });
    ticket.status = status;
  }
  if (assigneeId && assigneeId !== ticket.assigneeId) {
    ticket.history = ticket.history || [];
    ticket.history.push({
      action: "assignee",
      from: ticket.assigneeId,
      to: assigneeId,
      by: req.user.id,
      date: now,
    });
    ticket.assigneeId = assigneeId;
  }
  if (priority && priority !== ticket.priority) {
    ticket.history = ticket.history || [];
    ticket.history.push({
      action: "priority",
      from: ticket.priority,
      to: priority,
      by: req.user.id,
      date: now,
    });
    ticket.priority = priority;
  }
  if (dueDate && dueDate !== ticket.dueDate) {
    ticket.history = ticket.history || [];
    ticket.history.push({
      action: "dueDate",
      from: ticket.dueDate,
      to: dueDate,
      by: req.user.id,
      date: now,
    });
    ticket.dueDate = dueDate;
  }
  eventBus.emit("ticketUpdated", ticket);
  res.json(ticket);
});

// Bulk update tickets (status, assignee, priority, dueDate)
app.patch("/tickets/bulk-update", (req, res) => {
  const { ids, status, assigneeId, priority, dueDate } = req.body;
  if (!Array.isArray(ids) || !ids.length)
    return res.status(400).json({ error: "ids array required" });
  const updated = [];
  ids.forEach((id) => {
    const ticket = data.tickets.find((t) => t.id === Number(id));
    if (!ticket) return;
    const now = new Date().toISOString();
    if (status && status !== ticket.status) {
      ticket.history = ticket.history || [];
      ticket.history.push({
        action: "status",
        from: ticket.status,
        to: status,
        by: req.user.id,
        date: now,
      });
      ticket.status = status;
    }
    if (assigneeId !== undefined && assigneeId !== ticket.assigneeId) {
      ticket.history = ticket.history || [];
      ticket.history.push({
        action: "assignee",
        from: ticket.assigneeId,
        to: assigneeId,
        by: req.user.id,
        date: now,
      });
      ticket.assigneeId = assigneeId;
    }
    if (priority && priority !== ticket.priority) {
      ticket.history = ticket.history || [];
      ticket.history.push({
        action: "priority",
        from: ticket.priority,
        to: priority,
        by: req.user.id,
        date: now,
      });
      ticket.priority = priority;
    }
    if (dueDate && dueDate !== ticket.dueDate) {
      ticket.history = ticket.history || [];
      ticket.history.push({
        action: "dueDate",
        from: ticket.dueDate,
        to: dueDate,
        by: req.user.id,
        date: now,
      });
      ticket.dueDate = dueDate;
    }
    eventBus.emit("ticketUpdated", ticket);
    updated.push(ticket);
  });
  res.json(updated);
});

// Bulk assign tickets to a user
app.post("/tickets/bulk-assign", (req, res) => {
  const { ids, assigneeId } = req.body;
  if (!Array.isArray(ids) || !ids.length || assigneeId === undefined)
    return res.status(400).json({ error: "ids and assigneeId required" });
  const updated = [];
  ids.forEach((id) => {
    const ticket = data.tickets.find((t) => t.id === Number(id));
    if (!ticket) return;
    if (ticket.assigneeId === assigneeId) return;
    const now = new Date().toISOString();
    ticket.history = ticket.history || [];
    ticket.history.push({
      action: "assignee",
      from: ticket.assigneeId,
      to: assigneeId,
      by: req.user.id,
      date: now,
    });
    ticket.assigneeId = assigneeId;
    eventBus.emit("ticketUpdated", ticket);
    updated.push(ticket);
  });
  res.json(updated);
});

// Delete a ticket
app.delete("/tickets/:id", (req, res) => {
  const index = data.tickets.findIndex((t) => t.id === Number(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: "Ticket not found" });
  }
  data.tickets.splice(index, 1);
  res.json({ success: true });
});

// Reassign ticket to the least busy user
app.post("/tickets/:id/reassign-least-busy", (req, res) => {
  const ticket = data.tickets.find((t) => t.id === Number(req.params.id));
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });
  const newId = getLeastBusyUserId();
  if (newId !== ticket.assigneeId) {
    ticket.history = ticket.history || [];
    ticket.history.push({
      action: "assignee",
      from: ticket.assigneeId,
      to: newId,
      by: req.user.id,
      date: new Date().toISOString(),
    });
    ticket.assigneeId = newId;
  }
  eventBus.emit("ticketUpdated", ticket);
  res.json(ticket);
});

// Assign a ticket to a specific user
app.post("/tickets/:id/assign/:userId", (req, res) => {
  const ticket = data.tickets.find((t) => t.id === Number(req.params.id));
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });
  const uid = Number(req.params.userId);
  if (uid !== ticket.assigneeId) {
    ticket.history = ticket.history || [];
    ticket.history.push({
      action: "assignee",
      from: ticket.assigneeId,
      to: uid,
      by: req.user.id,
      date: new Date().toISOString(),
    });
    ticket.assigneeId = uid;
  }
  eventBus.emit("ticketUpdated", ticket);
  res.json(ticket);
});

// Escalate a ticket to high priority
app.post("/tickets/:id/escalate", (req, res) => {
  const ticket = data.tickets.find((t) => t.id === Number(req.params.id));
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });
  if (ticket.priority !== "high") {
    ticket.history = ticket.history || [];
    ticket.history.push({
      action: "priority",
      from: ticket.priority,
      to: "high",
      by: req.user.id,
      date: new Date().toISOString(),
    });
    ticket.priority = "high";
  }
  eventBus.emit("ticketUpdated", ticket);
  res.json(ticket);
});

// Close a ticket
app.post("/tickets/:id/close", (req, res) => {
  const ticket = data.tickets.find((t) => t.id === Number(req.params.id));
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });
  if (ticket.status !== "closed") {
    ticket.history = ticket.history || [];
    ticket.history.push({
      action: "status",
      from: ticket.status,
      to: "closed",
      by: req.user.id,
      date: new Date().toISOString(),
    });
    ticket.status = "closed";
  }
  eventBus.emit("ticketUpdated", ticket);
  res.json(ticket);
});

// Reopen a ticket
app.post("/tickets/:id/reopen", (req, res) => {
  const ticket = data.tickets.find((t) => t.id === Number(req.params.id));
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });
  if (ticket.status !== "open") {
    ticket.history = ticket.history || [];
    ticket.history.push({
      action: "status",
      from: ticket.status,
      to: "open",
      by: req.user.id,
      date: new Date().toISOString(),
    });
    ticket.status = "open";
  }
  eventBus.emit("ticketUpdated", ticket);
  res.json(ticket);
});

// List attachments for a ticket
app.get("/tickets/:id/attachments", (req, res) => {
  const ticket = data.tickets.find((t) => t.id === Number(req.params.id));
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });
  res.json(ticket.attachments || []);
});

// Add an attachment to a ticket
app.post("/tickets/:id/attachments", (req, res) => {
  const ticket = data.tickets.find((t) => t.id === Number(req.params.id));
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });
  const { name, url } = req.body;
  if (!name || !url)
    return res.status(400).json({ error: "name and url required" });
  const attach = {
    id:
      (ticket.attachments && ticket.attachments.length
        ? Math.max(...ticket.attachments.map((a) => a.id))
        : 0) + 1,
    name,
    url,
    uploaded: new Date().toISOString(),
  };
  ticket.attachments = ticket.attachments || [];
  ticket.attachments.push(attach);
  res.status(201).json(attach);
});

// Remove an attachment from a ticket
app.delete("/tickets/:id/attachments/:attachmentId", (req, res) => {
  const ticket = data.tickets.find((t) => t.id === Number(req.params.id));
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });
  const attId = Number(req.params.attachmentId);
  ticket.attachments = ticket.attachments || [];
  const initial = ticket.attachments.length;
  ticket.attachments = ticket.attachments.filter((a) => a.id !== attId);
  if (ticket.attachments.length === initial) {
    return res.status(404).json({ error: "Attachment not found" });
  }
  res.json(ticket.attachments);
});

// Add a comment to a ticket
function parseMentions(text) {
  const regex = /@([a-zA-Z0-9_]+)/g;
  const mentions = [];
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const highlighted = escaped.replace(regex, (m, name) => {
    const user = data.users.find(
      (u) => u.name.toLowerCase() === name.toLowerCase(),
    );
    if (user) mentions.push(user.id);
    return `<mark>@${name}</mark>`;
  });
  return { highlighted, mentions };
}

app.post("/tickets/:id/comments", (req, res) => {
  const ticket = data.tickets.find((t) => t.id === Number(req.params.id));
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });
  const { text, isInternal } = req.body;
  if (!text) return res.status(400).json({ error: "text required" });
  const nextId =
    (ticket.comments || []).reduce((m, c) => Math.max(m, c.id || 0), 0) + 1;
  const { highlighted, mentions } = parseMentions(text);
  const comment = {
    id: nextId,
    userId: req.user.id,
    text,
    html: highlighted,
    mentions,
    sentiment: sentimentService.analyze(text),
    isInternal: !!isInternal,
    date: new Date().toISOString(),
  };
  ticket.comments.push(comment);
  res.status(201).json(comment);
});

// List comments for a ticket
app.get("/tickets/:id/comments", (req, res) => {
  const ticket = data.tickets.find((t) => t.id === Number(req.params.id));
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });
  let comments = ticket.comments || [];
  if (req.user.id === ticket.submitterId) {
    comments = comments.filter((c) => !c.isInternal);
  }
  comments = comments.map((c) => ({ ...c, html: parseMentions(c.text).highlighted }));
  res.json(comments);
});

// Get a single comment from a ticket
app.get("/tickets/:id/comments/:commentId", (req, res) => {
  const ticket = data.tickets.find((t) => t.id === Number(req.params.id));
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });
  const cid = Number(req.params.commentId);
  const comment = (ticket.comments || []).find((c) => (c.id || 0) === cid);
  if (!comment || (req.user.id === ticket.submitterId && comment.isInternal))
    return res.status(404).json({ error: "Comment not found" });
  res.json({ ...comment, html: parseMentions(comment.text).highlighted });
});

// Delete a comment from a ticket
app.delete("/tickets/:id/comments/:commentId", (req, res) => {
  const ticket = data.tickets.find((t) => t.id === Number(req.params.id));
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });
  const cid = Number(req.params.commentId);
  ticket.comments = ticket.comments || [];
  const index = ticket.comments.findIndex((c) => (c.id || 0) === cid);
  if (index === -1) return res.status(404).json({ error: "Comment not found" });
  ticket.comments.splice(index, 1);
  res.json(ticket.comments);
});

// Edit a comment on a ticket
app.patch("/tickets/:id/comments/:commentId", (req, res) => {
  const ticket = data.tickets.find((t) => t.id === Number(req.params.id));
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });
  const cid = Number(req.params.commentId);
  ticket.comments = ticket.comments || [];
  const comment = ticket.comments.find((c) => (c.id || 0) === cid);
  if (!comment) return res.status(404).json({ error: "Comment not found" });
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "text required" });
  comment.text = text;
  comment.html = parseMentions(text).highlighted;
  comment.sentiment = sentimentService.analyze(text);
  comment.edited = new Date().toISOString();
  res.json(comment);
});

// View ticket change history
app.get("/tickets/:id/history", (req, res) => {
  const ticket = data.tickets.find((t) => t.id === Number(req.params.id));
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });
  res.json(ticket.history || []);
});

// List tags for a ticket
app.get("/tickets/:id/tags", (req, res) => {
  const ticket = data.tickets.find((t) => t.id === Number(req.params.id));
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });
  res.json(ticket.tags || []);
});

// Add tags to a ticket
app.post("/tickets/:id/tags", (req, res) => {
  const ticket = data.tickets.find((t) => t.id === Number(req.params.id));
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });
  const { tag, tags } = req.body;
  const newTags = tags || (tag ? [tag] : []);
  if (!newTags.length)
    return res.status(400).json({ error: "tag or tags required" });
  ticket.tags = ticket.tags || [];
  newTags.forEach((t) => {
    if (!ticket.tags.includes(t)) ticket.tags.push(t);
  });
  res.status(201).json(ticket.tags);
});

// Remove a tag from a ticket
app.delete("/tickets/:id/tags/:tag", (req, res) => {
  const ticket = data.tickets.find((t) => t.id === Number(req.params.id));
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });
  const tag = req.params.tag;
  ticket.tags = (ticket.tags || []).filter((t) => t !== tag);
  res.json(ticket.tags);
});

// List overdue tickets
app.get("/tickets/overdue", (req, res) => {
  const now = Date.now();
  const tickets = data.tickets.filter(
    (t) =>
      t.dueDate && new Date(t.dueDate).getTime() < now && t.status !== "closed",
  );
  res.json(tickets);
});

// List tickets due within the next N days (default 3)
app.get("/tickets/due-soon", (req, res) => {
  const days = Number(req.query.days) || 3;
  const now = Date.now();
  const cutoff = now + days * 24 * 60 * 60 * 1000;
  const tickets = data.tickets.filter((t) => {
    if (!t.dueDate || t.status === "closed") return false;
    const due = new Date(t.dueDate).getTime();
    return due >= now && due <= cutoff;
  });
  res.json(tickets);
});

// List open tickets created more than N days ago (default 7)
app.get("/tickets/aging", (req, res) => {
  const days = Number(req.query.days) || 7;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const tickets = data.tickets.filter((t) => {
    if (t.status === "closed") return false;
    const createdEntry = (t.history || []).find((h) => h.action === "created");
    if (!createdEntry) return false;
    const created = new Date(createdEntry.date).getTime();
    return created < cutoff;
  });
  res.json(tickets);
});

// List most recently created tickets
app.get("/tickets/recent", (req, res) => {
  const limit = Number(req.query.limit) || 5;
  const sorted = data.tickets.slice().sort((a, b) => {
    const aCreated = new Date(
      (a.history || []).find((h) => h.action === "created").date,
    ).getTime();
    const bCreated = new Date(
      (b.history || []).find((h) => h.action === "created").date,
    ).getTime();
    return bCreated - aCreated;
  });
  res.json(sorted.slice(0, limit));
});

// Simple system stats
// View a single ticket
app.get("/tickets/:id", async (req, res) => {
  const ticket = await dataService.getTicketById(Number(req.params.id));
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });
  if (!ticket.sentiment) ticket.sentiment = sentimentService.analyze(ticket.question);
  res.json(ticket);
});
app.get("/stats", (req, res) => {
  const stats = {
    tickets: {
      open: data.tickets.filter((t) => t.status === "open").length,
      waiting: data.tickets.filter((t) => t.status === "waiting").length,
      closed: data.tickets.filter((t) => t.status === "closed").length,
    },
    assets: {
      total: (data.assets || []).length,
    },
  };
  res.json(stats);
});

// Consolidated stats for dashboard UI
app.get("/stats/dashboard", (req, res) => {
  const insights = analytics.generateInsights(data.tickets, data.assets || []);
  res.json(insights);
});

// Mean Time To Resolution in hours
app.get("/stats/mttr", (req, res) => {
  const mttr = analytics.calculateMTTR(data.tickets);
  res.json({ mttr });
});

// Predict ticket creation volume for the next N days (default 7)
app.get("/stats/forecast", (req, res) => {
  const days = Number(req.query.days) || 7;
  const forecast = analytics.predictTicketVolume(data.tickets, days);
  res.json({ forecast });
});

// Export analytics report in various formats
app.post("/api/analytics/export", (req, res) => {
  const { format = "csv" } = req.body || {};
  const reportData = analytics.generateInsights(data.tickets, data.assets || []);
  const buffer = reportExporter.generate([reportData], format);
  res.setHeader("Content-Type", reportExporter.contentType(format));
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="report.${reportExporter.extension(format)}"`,
  );
  res.end(buffer);
});

// Ticket counts per user by status
app.get("/stats/workload", (req, res) => {
  const workload = data.users.map((u) => ({
    userId: u.id,
    open: data.tickets.filter(
      (t) => t.assigneeId === u.id && t.status === "open",
    ).length,
    waiting: data.tickets.filter(
      (t) => t.assigneeId === u.id && t.status === "waiting",
    ).length,
    closed: data.tickets.filter(
      (t) => t.assigneeId === u.id && t.status === "closed",
    ).length,
  }));
  res.json(workload);
});

// Ticket volume trends for the last N days with simple anomaly detection
app.get("/stats/trends", (req, res) => {
  const days = Number(req.query.days) || 30;
  const now = new Date();
  const counts = {};
  data.tickets.forEach((t) => {
    const created = (t.history || []).find((h) => h.action === "created");
    if (!created) return;
    const d = new Date(created.date);
    const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diff < days) {
      const key = d.toISOString().slice(0, 10);
      counts[key] = (counts[key] || 0) + 1;
    }
  });
  const series = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000)
      .toISOString()
      .slice(0, 10);
    series.push({ date: d, tickets: counts[d] || 0 });
  }
  const avg = series.reduce((s, r) => s + r.tickets, 0) / days;
  const anomalies = series.filter((r) => r.tickets > avg * 1.5).map((r) => r.date);
  res.json({ series, forecast: avg * days, anomalies });
});

// Ticket counts per priority across all tickets
app.get("/stats/priorities", (req, res) => {
  const counts = {};
  data.tickets.forEach((t) => {
    const p = t.priority || "unspecified";
    counts[p] = (counts[p] || 0) + 1;
  });
  res.json(counts);
});

// Summary stats for a specific user
app.get("/stats/user/:userId", (req, res) => {
  const uid = Number(req.params.userId);
  const user = data.users.find((u) => u.id === uid);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  const tickets = data.tickets.filter((t) => t.assigneeId === uid);
  const assets = (data.assets || []).filter((a) => a.assignedTo === uid);
  const summary = {
    userId: uid,
    tickets: {
      open: tickets.filter((t) => t.status === "open").length,
      waiting: tickets.filter((t) => t.status === "waiting").length,
      closed: tickets.filter((t) => t.status === "closed").length,
    },
    assets: assets.length,
  };
  res.json(summary);
});

// Ticket counts per tag across all tickets
app.get("/stats/tags", (req, res) => {
  const counts = {};
  data.tickets.forEach((t) => {
    (t.tags || []).forEach((tag) => {
      counts[tag] = (counts[tag] || 0) + 1;
    });
  });
  res.json(counts);
});

// Asset counts per tag across all assets
app.get("/stats/asset-tags", (req, res) => {
  const counts = {};
  (data.assets || []).forEach((a) => {
    (a.tags || []).forEach((tag) => {
      counts[tag] = (counts[tag] || 0) + 1;
    });
  });
  res.json(counts);
});

// Asset counts per user
app.get("/stats/assets-per-user", (req, res) => {
  const stats = data.users.map((u) => ({
    userId: u.id,
    count: (data.assets || []).filter((a) => a.assignedTo === u.id).length,
  }));
  res.json(stats);
});

// Total maintenance cost per asset
app.get("/stats/maintenance-cost", (req, res) => {
  const costs = {};
  (data.assets || []).forEach((a) => {
    const total = (a.maintenance || []).reduce(
      (sum, r) => sum + (r.cost || 0),
      0,
    );
    costs[a.id] = total;
  });
  res.json(costs);
});

// Overdue ticket counts per user
app.get("/stats/overdue", (req, res) => {
  const now = Date.now();
  const stats = data.users.map((u) => ({
    userId: u.id,
    count: data.tickets.filter((t) => {
      if (t.assigneeId !== u.id) return false;
      if (!t.dueDate || t.status === "closed") return false;
      return new Date(t.dueDate).getTime() < now;
    }).length,
  }));
  res.json(stats);
});

// Comment counts per ticket
app.get("/stats/comments", (req, res) => {
  const counts = {};
  data.tickets.forEach((t) => {
    counts[t.id] = (t.comments || []).length;
  });
  res.json(counts);
});

// New analytics API endpoints
app.get("/api/analytics/overview", (req, res) => {
  const overview = analytics.generateInsights(data.tickets, data.assets || []);
  const priorities = {};
  data.tickets.forEach((t) => {
    const p = t.priority || "unspecified";
    priorities[p] = (priorities[p] || 0) + 1;
  });
  overview.priorities = priorities;
  overview.teamPerformance = data.users.map((u) => {
    const resolved = data.tickets.filter(
      (t) => t.assigneeId === u.id && t.status === "closed",
    );
    const durations = resolved
      .map((t) => {
        const created = (t.history || []).find((h) => h.action === "created");
        const closed = (t.history || []).find(
          (h) => h.action === "status" && h.to === "closed",
        );
        if (!created || !closed) return null;
        return (
          new Date(closed.date).getTime() - new Date(created.date).getTime()
        );
      })
      .filter((d) => d !== null);
    const avg = durations.length
      ? (durations.reduce((s, d) => s + d, 0) / durations.length) / 3600000
      : 0;
    return {
      name: u.name,
      resolved: resolved.length,
      avgTime: `${avg.toFixed(1)}h`,
      satisfaction: 4.5,
    };
  });
  res.json(overview);
});

app.get("/api/analytics/timeseries", (req, res) => {
  const days = Number(req.query.days) || 7;
  const now = new Date();
  const series = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000)
      .toISOString()
      .slice(0, 10);
    const ticketsCreated = data.tickets.filter((t) => {
      const created = (t.history || []).find((h) => h.action === "created");
      return created && created.date.slice(0, 10) === d;
    }).length;
    const ticketsResolved = data.tickets.filter((t) => {
      const closed = (t.history || []).find(
        (h) => h.action === "status" && h.to === "closed",
      );
      return closed && closed.date.slice(0, 10) === d;
    }).length;
    series.push({ date: d, tickets: ticketsCreated, resolved: ticketsResolved });
  }
  res.json(series);
});

// Asset management endpoints
// List all depreciated assets
app.get("/assets/depreciated", (req, res) => {
  const assets = (data.assets || []).filter((a) => a.depreciationDate);
  res.json(assets);
});

// List all retired assets
app.get("/assets/retired", (req, res) => {
  const assets = (data.assets || []).filter((a) => a.retirementDate);
  res.json(assets);
});

app.get("/assets", (req, res) => {
  let assets = data.assets || [];
  const { tag, assignedTo, sortBy, order } = req.query;
  if (tag) assets = assets.filter((a) => (a.tags || []).includes(tag));
  if (assignedTo !== undefined) {
    const assignedId = Number(assignedTo);
    assets = assets.filter((a) => Number(a.assignedTo) === assignedId);
  }
  if (sortBy) {
    const dir = order === "desc" ? -1 : 1;
    assets = assets.slice().sort((a, b) => {
      const av = a[sortBy];
      const bv = b[sortBy];
      if (av == null) return 1;
      if (bv == null) return -1;
      const aNum = Number(av);
      const bNum = Number(bv);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return (aNum - bNum) * dir;
      }
      return av > bv ? dir : av < bv ? -dir : 0;
    });
  }
  res.json(assets);
});

// Assets assigned to a specific user
app.get("/assets/assigned/:userId", (req, res) => {
  const uid = Number(req.params.userId);
  const assets = (data.assets || []).filter((a) => a.assignedTo === uid);
  res.json(assets);
});

// Tickets and assets for a specific user
app.get("/users/:id/tickets", (req, res) => {
  const uid = Number(req.params.id);
  const user = data.users.find((u) => u.id === uid);
  if (!user) return res.status(404).json({ error: "User not found" });
  const tickets = data.tickets.filter((t) => t.assigneeId === uid);
  res.json(tickets);
});

app.get("/users/:id/assets", (req, res) => {
  const uid = Number(req.params.id);
  const user = data.users.find((u) => u.id === uid);
  if (!user) return res.status(404).json({ error: "User not found" });
  const assets = (data.assets || []).filter((a) => a.assignedTo === uid);
  res.json(assets);
});

// List all unassigned assets
app.get("/assets/unassigned", (req, res) => {
  const assets = (data.assets || []).filter((a) => !a.assignedTo);

  res.json(assets);
});


// Search assets by name

app.get("/assets/search", (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);
  const query = q.toLowerCase();
  const assets = (data.assets || []).filter((a) =>
    a.name.toLowerCase().includes(query),

  );
  res.json(assets);
});


app.post("/assets", (req, res) => {

  const { name, assignedTo, tags } = req.body;
  if (!name) return res.status(400).json({ error: "name required" });
  const now = new Date().toISOString();
  const asset = {
    id: nextAssetId++,
    name,
    assignedTo: assignedTo || null,
    history: [{ action: "created", by: req.user.id, date: now }],
    maintenance: [],
    tags: Array.isArray(tags) ? tags : [],
  };
  data.assets = data.assets || [];
  data.assets.push(asset);
  res.status(201).json(asset);
});

app.get("/assets/:id", (req, res) => {
  const asset = (data.assets || []).find((a) => a.id === Number(req.params.id));
  if (!asset) return res.status(404).json({ error: "Asset not found" });
  res.json(asset);
});

// View asset assignment history
app.get("/assets/:id/history", (req, res) => {
  const asset = (data.assets || []).find((a) => a.id === Number(req.params.id));
  if (!asset) return res.status(404).json({ error: "Asset not found" });
  res.json(asset.history || []);
});

app.patch("/assets/:id", (req, res) => {
  const asset = (data.assets || []).find((a) => a.id === Number(req.params.id));
  if (!asset) return res.status(404).json({ error: "Asset not found" });
  const { name, assignedTo } = req.body;
  const now = new Date().toISOString();
  if (name && name !== asset.name) {
    asset.history = asset.history || [];
    asset.history.push({
      action: "name",
      from: asset.name,
      to: name,
      by: req.user.id,
      date: now,
    });
    asset.name = name;
  }
  if (assignedTo !== undefined && assignedTo !== asset.assignedTo) {
    asset.history = asset.history || [];
    asset.history.push({
      action: "assignee",
      from: asset.assignedTo,
      to: assignedTo,
      by: req.user.id,
      date: now,
    });
    asset.assignedTo = assignedTo;
  }
  res.json(asset);
});

// Delete an asset
app.delete("/assets/:id", (req, res) => {
  const index = (data.assets || []).findIndex(
    (a) => a.id === Number(req.params.id),
  );
  if (index === -1) {
    return res.status(404).json({ error: "Asset not found" });
  }
  data.assets.splice(index, 1);
  res.json({ success: true });
});

// List tags for an asset
app.get("/assets/:id/tags", (req, res) => {
  const asset = (data.assets || []).find((a) => a.id === Number(req.params.id));
  if (!asset) return res.status(404).json({ error: "Asset not found" });
  res.json(asset.tags || []);
});

// Add tags to an asset
app.post("/assets/:id/tags", (req, res) => {
  const asset = (data.assets || []).find((a) => a.id === Number(req.params.id));
  if (!asset) return res.status(404).json({ error: "Asset not found" });
  const { tag, tags } = req.body;
  const newTags = tags || (tag ? [tag] : []);
  if (!newTags.length)
    return res.status(400).json({ error: "tag or tags required" });
  asset.tags = asset.tags || [];
  newTags.forEach((t) => {
    if (!asset.tags.includes(t)) asset.tags.push(t);
  });
  res.status(201).json(asset.tags);
});

// Remove a tag from an asset
app.delete("/assets/:id/tags/:tag", (req, res) => {
  const asset = (data.assets || []).find((a) => a.id === Number(req.params.id));
  if (!asset) return res.status(404).json({ error: "Asset not found" });
  const tag = req.params.tag;
  asset.tags = (asset.tags || []).filter((t) => t !== tag);
  res.json(asset.tags);
});

// View maintenance records for an asset
app.get("/assets/:id/maintenance", (req, res) => {
  const asset = (data.assets || []).find((a) => a.id === Number(req.params.id));
  if (!asset) return res.status(404).json({ error: "Asset not found" });
  res.json(asset.maintenance || []);
});

// Add a maintenance record to an asset
app.post("/assets/:id/maintenance", (req, res) => {
  const asset = (data.assets || []).find((a) => a.id === Number(req.params.id));
  if (!asset) return res.status(404).json({ error: "Asset not found" });
  const { description, cost } = req.body;
  if (!description)
    return res.status(400).json({ error: "description required" });
  const record = {
    description,
    cost: cost || 0,
    date: new Date().toISOString(),
  };
  asset.maintenance = asset.maintenance || [];
  asset.maintenance.push(record);
  res.status(201).json(record);
});

// Get total maintenance cost for an asset
app.get("/assets/:id/maintenance/total-cost", (req, res) => {
  const asset = (data.assets || []).find((a) => a.id === Number(req.params.id));
  if (!asset) return res.status(404).json({ error: "Asset not found" });
  const total = (asset.maintenance || []).reduce(
    (sum, r) => sum + (r.cost || 0),
    0,
  );
  res.json({ total });
});

// Get the most recent maintenance record for an asset
app.get("/assets/:id/maintenance/last", (req, res) => {
  const asset = (data.assets || []).find((a) => a.id === Number(req.params.id));
  if (!asset) return res.status(404).json({ error: "Asset not found" });
  const records = asset.maintenance || [];
  if (!records.length)
    return res.status(404).json({ error: "No maintenance records" });
  res.json(records[records.length - 1]);
});

// Mark an asset as depreciated by setting depreciationDate to now
app.post("/assets/:id/depreciate", (req, res) => {
  const asset = (data.assets || []).find((a) => a.id === Number(req.params.id));
  if (!asset) return res.status(404).json({ error: "Asset not found" });
  const now = new Date().toISOString();
  asset.depreciationDate = now;
  asset.history = asset.history || [];
  asset.history.push({
    action: "depreciated",
    by: req.user.id,
    date: now,
  });
  res.json(asset);
});

// Retire an asset by setting retirementDate to now
app.post("/assets/:id/retire", (req, res) => {
  const asset = (data.assets || []).find((a) => a.id === Number(req.params.id));
  if (!asset) return res.status(404).json({ error: "Asset not found" });
  const now = new Date().toISOString();
  asset.retirementDate = now;
  asset.history = asset.history || [];
  asset.history.push({
    action: "retired",
    by: req.user.id,
    date: now,
  });
  res.json(asset);
});

// User-specific ticket filter presets
app.get("/filters", (req, res) => {
  const presets = filterPresets[req.user.id] || [];
  res.json(presets);
});

app.post("/filters", (req, res) => {
  const { name, filters } = req.body;
  if (!name || !filters) {
    return res.status(400).json({ error: "name and filters required" });
  }
  filterPresets[req.user.id] = filterPresets[req.user.id] || [];
  const preset = { id: nextFilterId++, name, filters };
  filterPresets[req.user.id].push(preset);
  res.status(201).json(preset);
});

// Notification preference CRUD
app.get("/notifications/preferences", (req, res) => {
  res.json(notificationPrefs[req.user.id] || {});
});

app.post("/notifications/preferences", (req, res) => {
  notificationPrefs[req.user.id] = req.body || {};
  res.status(201).json(notificationPrefs[req.user.id]);
});

app.patch("/notifications/preferences", (req, res) => {
  notificationPrefs[req.user.id] = {
    ...(notificationPrefs[req.user.id] || {}),
    ...(req.body || {}),
  };
  res.json(notificationPrefs[req.user.id]);
});

app.delete("/notifications/preferences", (req, res) => {
  delete notificationPrefs[req.user.id];
  res.json({ success: true });
});

// Presence listing
app.get("/presence/agents", (req, res) => {
  res.json(wsServer.getPresence());
});


// AI endpoint for natural language commands
app.post("/ai", async (req, res) => {
  const { text } = req.body;
  try {
    const response = await n8nClient.processText(text, req.user);
    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to process text" });
  }
});


// AI-powered ticket routing
app.post("/ai/route-ticket", (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "text required" });
  const lower = text.toLowerCase();
  let priority = "medium";
  if (/(urgent|immediately|asap)/.test(lower)) priority = "high";
  const suggestions = [
    { team: "support", keywords: ["password", "login", "account"] },
    { team: "operations", keywords: ["error", "failure", "bug"] },
  ];
  let team = "general";
  for (const s of suggestions) {
    if (s.keywords.some((k) => lower.includes(k))) {
      team = s.team;
      break;
    }
  }
  res.json({ priority, team, confidence: 0.8 });
});

// Predict ticket volume for next N days
app.get("/ai/predict-volume", (req, res) => {
  const days = Number(req.query.days) || 7;
  const counts = {};
  data.tickets.forEach((t) => {
    const created = (t.history || []).find((h) => h.action === "created");
    if (!created) return;
    const d = new Date(created.date).toISOString().slice(0, 10);
    counts[d] = (counts[d] || 0) + 1;
  });
  const total = Object.values(counts).reduce((sum, c) => sum + c, 0);
  const avg = Object.keys(counts).length ? total / Object.keys(counts).length : 0;
  res.json({ forecast: avg * days });
});

// Agent workload optimization
app.get("/ai/agent-workload", (req, res) => {
  const workload = data.users.map((u) => ({
    userId: u.id,
    open: data.tickets.filter((t) => t.assigneeId === u.id && t.status !== "closed").length,
  }));
  const recommended = workload.reduce((a, b) => (a.open < b.open ? a : b), workload[0]);
  res.json({ workload, recommendedAssigneeId: recommended.userId });
});

// Estimate escalation risk

app.get("/ai/escalation-risk", (req, res) => {
  const now = Date.now();
  const risks = data.tickets
    .filter((t) => t.status !== "closed")
    .map((t) => {
      let score = 0.1;
      if (t.priority === "high") score += 0.5;
      if (t.dueDate && new Date(t.dueDate).getTime() < now) score += 0.4;
      return { ticketId: t.id, risk: Math.min(score, 1) };
    });
  res.json(risks);
});


// Basic sentiment analysis for a text string
app.post("/ai/sentiment", (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "text required" });
  const sentiment = aiService.analyzeSentiment(text);
  res.json({ sentiment });
});

// Sentiment analysis endpoint
app.post("/sentiment", (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "text required" });
  const result = sentimentService.analyze(text);
  res.json(result);

});

app.get('*', (req, res) => {
  if (fs.existsSync(reactDist)) {
    res.sendFile(path.join(reactDist, 'index.html'));
  } else {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});

const PORT = process.env.PORT || 3000;

let io;
function attachSocket(server) {
  if (io) return;
  io = new IOServer(server);
  eventBus.on('ticketCreated', (t) => io.emit('ticketCreated', t));
  eventBus.on('ticketUpdated', (t) => io.emit('ticketUpdated', t));
}

if (require.main === module) {

  const server = http.createServer(app);
  attachSocket(server);
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

  wsServer.setupWebSocket(server);
  wsServer.setupAnalyticsSocket(server);

}

module.exports = app;
module.exports.attachSocket = attachSocket;
