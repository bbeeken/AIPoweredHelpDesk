const WebSocket = require('ws');
const url = require('url');
const eventBus = require('./eventBus');
const data = require('../data/mockData');

function buildAnalytics() {
  const priorityStats = {};
  data.tickets.forEach((t) => {
    const p = t.priority || 'unspecified';
    priorityStats[p] = (priorityStats[p] || 0) + 1;
  });

  const days = 7;
  const now = new Date();
  const timeSeriesData = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000)
      .toISOString()
      .slice(0, 10);
    const created = data.tickets.filter((t) => {
      const h = (t.history || []).find((e) => e.action === 'created');
      return h && h.date.slice(0, 10) === d;
    }).length;
    const resolved = data.tickets.filter((t) => {
      const h = (t.history || []).find(
        (e) => e.action === 'status' && e.to === 'closed'
      );
      return h && h.date.slice(0, 10) === d;
    }).length;
    timeSeriesData.push({ date: d, tickets: created, resolved });
  }

  const teamPerformance = data.users.map((u) => {
    const closed = data.tickets.filter(
      (t) => t.assigneeId === u.id && t.status === 'closed'
    );
    const resolved = closed.length;
    let sum = 0;
    closed.forEach((t) => {
      const created = (t.history || []).find((h) => h.action === 'created');
      const close = (t.history || []).find(
        (h) => h.action === 'status' && h.to === 'closed'
      );
      if (created && close)
        sum += new Date(close.date) - new Date(created.date);
    });
    const avgTime = resolved ? (sum / resolved) / 3600000 : 0;
    return {
      name: u.name,
      resolved,
      avgTime: `${avgTime.toFixed(1)}h`,
      satisfaction: 4.5,
    };
  });

  return { priorityStats, timeSeriesData, teamPerformance };
}

// Map of ws -> userId
const clients = new Map();
// Set of online user ids
const online = new Set();

function broadcast(obj, wss) {
  const msg = JSON.stringify(obj);
  for (const ws of wss.clients) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(msg);
    }
  }
}

function setupWebSocket(server) {
  const wss = new WebSocket.Server({ noServer: true });

  server.on('upgrade', (req, socket, head) => {
    const pathname = url.parse(req.url).pathname;
    if (pathname === '/events/subscribe') {
      wss.handleUpgrade(req, socket, head, (ws) => {
        const { query } = url.parse(req.url, true);
        const userId = Number(query.userId);
        if (userId) {
          clients.set(ws, userId);
          online.add(userId);
        } else {
          clients.set(ws, null);
        }
        ws.on('close', () => {
          const id = clients.get(ws);
          clients.delete(ws);
          if (id) {
            // remove only if no other connection for this id
            let still = false;
            for (const other of clients.values()) {
              if (other === id) {
                still = true;
                break;
              }
            }
            if (!still) online.delete(id);
          }
        });
      });
    } else {
      socket.destroy();
    }
  });

  // Relay ticket events to clients
  eventBus.on('ticketCreated', (ticket) => {
    broadcast({ event: 'ticketCreated', data: ticket }, wss);
  });
  eventBus.on('ticketUpdated', (ticket) => {
    broadcast({ event: 'ticketUpdated', data: ticket }, wss);
  });

  return wss;
}

function getPresence() {
  return Array.from(online).map((id) => data.users.find((u) => u.id === id));
}

function setupAnalyticsSocket(server) {
  const wss = new WebSocket.Server({ noServer: true });

  server.on('upgrade', (req, socket, head) => {
    const pathname = url.parse(req.url).pathname;
    if (pathname === '/ws/analytics') {
      wss.handleUpgrade(req, socket, head, (ws) => {
        const payload = buildAnalytics();
        ws.send(JSON.stringify({ event: 'analytics', data: payload }));
      });
    }
  });

  const push = () => {
    const payload = buildAnalytics();
    broadcast({ event: 'analytics', data: payload }, wss);
  };

  eventBus.on('ticketCreated', push);
  eventBus.on('ticketUpdated', push);

  return wss;
}

module.exports = { setupWebSocket, getPresence, setupAnalyticsSocket };
