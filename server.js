const express = require('express');
const bodyParser = require('body-parser');
const n8nClient = require('./utils/n8nClient');
const data = require('./data/mockData');

const app = express();
app.use(bodyParser.json());

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
