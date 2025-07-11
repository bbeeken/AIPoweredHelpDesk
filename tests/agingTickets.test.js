const http = require('http');
const assert = require('assert');
const app = require('../server');

const server = app.listen(0, () => {
  const port = server.address().port;
  http.get({ port, path: '/tickets/aging?days=300' }, res => {
    let data = '';
    res.on('data', d => data += d);
    res.on('end', () => {
      const tickets = JSON.parse(data);
      assert.ok(Array.isArray(tickets));
      assert.ok(tickets.some(t => t.id === 2353));
      server.close(() => console.log('Aging tickets test passed'));
    });
  });
});
