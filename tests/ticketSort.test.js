const http = require('http');
const assert = require('assert');
const app = require('../server');

const server = app.listen(0, () => {
  const port = server.address().port;
  http.get({ port, path: '/tickets?sortBy=dueDate' }, res => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
      const tickets = JSON.parse(body);
      assert.ok(Array.isArray(tickets));
      assert.strictEqual(tickets[0].id, 2355);
      server.close(() => console.log('Ticket sorting test passed'));
    });
  });
});
