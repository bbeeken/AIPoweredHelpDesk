const WebSocket = require('ws');
const url = require('url');
const eventBus = require('./eventBus');
const data = require('../data/mockData');

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

module.exports = { setupWebSocket, getPresence };
