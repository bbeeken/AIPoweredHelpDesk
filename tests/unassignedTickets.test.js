const http = require('http');
const assert = require('assert');
const app = require('../server');

const server = app.listen(0, () => {
  const port = server.address().port;
  const create = http.request(
    { port, path: '/tickets', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        const ticket = JSON.parse(body);
        http.get({ port, path: '/tickets/unassigned' }, res2 => {
          let data = '';
          res2.on('data', d => data += d);
          res2.on('end', () => {
            const tickets = JSON.parse(data);
            assert.ok(Array.isArray(tickets));
            assert.ok(tickets.some(t => t.id === ticket.id));
            server.close(() => console.log('Unassigned tickets test passed'));
          });
        });
      });
    }
  );
  create.end(JSON.stringify({ question: 'Spare ticket', assigneeId: null }));
});
