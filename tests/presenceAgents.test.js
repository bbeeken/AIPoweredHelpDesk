const http = require('http');
const assert = require('assert');
const WebSocket = require('ws');
const app = require('../server');
const { setupWebSocket } = require('../utils/websocketServer');

const server = app.listen(0, () => {
  const port = server.address().port;
  setupWebSocket(server);
  const ws = new WebSocket(`ws://localhost:${port}/events/subscribe?userId=1`);
  ws.on('open', () => {
    http.get({ port, path: '/presence/agents' }, res => {
      let data = '';
      res.on('data', c => (data += c));
      res.on('end', () => {
        const agents = JSON.parse(data);
        assert.ok(Array.isArray(agents));
        assert.strictEqual(agents.length, 1);
        assert.strictEqual(agents[0].id, 1);
        ws.close();
      });
    });
  });
  ws.on('close', () => {
    http.get({ port, path: '/presence/agents' }, res2 => {
      let body = '';
      res2.on('data', d => (body += d));
      res2.on('end', () => {
        const list = JSON.parse(body);
        assert.strictEqual(list.length, 0);
        server.close(() => console.log('WebSocket presence test passed'));
      });
    });
  });
});
