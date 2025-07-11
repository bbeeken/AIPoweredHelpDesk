const http = require('http');
const assert = require('assert');
const app = require('../server');

const server = app.listen(0, () => {
  const port = server.address().port;
  const create = http.request(
    { port, path: '/tickets', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    res => {
      let body = '';
      res.on('data', c => (body += c));
      res.on('end', () => {
        const ticket = JSON.parse(body);
        http.get({ port, path: '/tickets/recent?limit=1' }, res2 => {
          let data = '';
          res2.on('data', d => (data += d));
          res2.on('end', () => {
            const tickets = JSON.parse(data);
            assert.ok(Array.isArray(tickets));
            assert.strictEqual(tickets[0].id, ticket.id);
            server.close(() => console.log('Recent tickets test passed'));
          });
        });
      });
    }
  );
  create.end(JSON.stringify({ question: 'Newest ticket' }));
});
