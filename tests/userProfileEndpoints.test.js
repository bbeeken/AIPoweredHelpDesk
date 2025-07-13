const http = require('http');
const assert = require('assert');
const app = require('../server');

const server = app.listen(0, () => {
  const port = server.address().port;
  http.get({ port, path: '/users/1/tickets' }, res => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
      const tickets = JSON.parse(data);
      assert.ok(Array.isArray(tickets));
      assert.ok(tickets.every(t => t.assigneeId === 1));
      http.get({ port, path: '/users/1/assets' }, res2 => {
        let body = '';
        res2.on('data', d => body += d);
        res2.on('end', () => {
          const assets = JSON.parse(body);
          assert.ok(Array.isArray(assets));
          assert.ok(assets.every(a => a.assignedTo === 1));
          server.close(() => console.log('User profile endpoints test passed'));
        });
      });
    });
  });
});
