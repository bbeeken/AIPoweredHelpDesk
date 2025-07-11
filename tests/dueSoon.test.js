const http = require('http');
const assert = require('assert');
const app = require('../server');

const server = app.listen(0, () => {
  const port = server.address().port;
  const dueDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const create = http.request({ port, path: '/tickets', method: 'POST', headers: { 'Content-Type': 'application/json' } }, res => {
    let body = '';
    res.on('data', c => body += c);
    res.on('end', () => {
      const ticket = JSON.parse(body);
      http.get({ port, path: '/tickets/due-soon?days=2' }, res2 => {
        let out = '';
        res2.on('data', d => out += d);
        res2.on('end', () => {
          const tickets = JSON.parse(out);
          assert.ok(tickets.some(t => t.id === ticket.id));
          server.close(() => console.log('Due soon test passed'));
        });
      });
    });
  });
  create.end(JSON.stringify({ question: 'Test due soon', dueDate }));
});

