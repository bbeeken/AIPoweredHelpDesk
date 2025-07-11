const http = require('http');
const assert = require('assert');
const app = require('../server');

const server = app.listen(0, () => {
  const port = server.address().port;
  const dueDate = '2025-08-01T12:00:00Z';
  const create = http.request({
    port,
    path: '/tickets',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, res => {
    let body = '';
    res.on('data', c => body += c);
    res.on('end', () => {
      const ticket = JSON.parse(body);
      const newDate = '2025-09-01T12:00:00Z';
      const patch = http.request({
        port,
        path: `/tickets/${ticket.id}`,
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      }, res2 => {
        res2.resume();
        res2.on('end', () => {
          http.get({ port, path: `/tickets/${ticket.id}/history` }, res3 => {
            let data = '';
            res3.on('data', d => data += d);
            res3.on('end', () => {
              const history = JSON.parse(data);
              assert.ok(history.some(h => h.action === 'dueDate' && h.to === newDate));
              server.close(() => console.log('Due date history test passed'));
            });
          });
        });
      });
      patch.end(JSON.stringify({ dueDate: newDate }));
    });
  });
  create.end(JSON.stringify({ question: 'Test due date history', dueDate }));
});
