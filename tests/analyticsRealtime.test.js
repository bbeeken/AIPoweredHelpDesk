const http = require('http');
const assert = require('assert');
const WebSocket = require('ws');
const app = require('../server');
const { setupAnalyticsSocket } = require('../utils/websocketServer');

const server = app.listen(0, () => {
  const port = server.address().port;
  setupAnalyticsSocket(server);

  const ws = new WebSocket(`ws://localhost:${port}/ws/analytics`);
  let got = false;

  ws.on('message', msg => {
    const data = JSON.parse(msg);
    if (data.event === 'analytics') {
      got = true;
      ws.close();
    }
  });

  ws.on('open', () => {
    const req = http.request(
      { port, path: '/tickets', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      () => {}
    );
    req.end(JSON.stringify({ question: 'test ticket', assigneeId: 1 }));
  });

  ws.on('close', () => {
    assert.ok(got, 'should receive analytics update');
    server.close(() => console.log('Analytics realtime test passed'));
  });
});
