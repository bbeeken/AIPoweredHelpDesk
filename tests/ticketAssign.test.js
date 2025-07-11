const http = require('http');
const assert = require('assert');
const app = require('../server');

const server = app.listen(0, () => {
  const port = server.address().port;
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
      const assign = http.request({ port, path: `/tickets/${ticket.id}/assign/2`, method: 'POST' }, ares => {
        ares.resume();
        ares.on('end', () => {
          http.get({ port, path: `/tickets/${ticket.id}` }, gres => {
            let out = '';
            gres.on('data', d => out += d);
            gres.on('end', () => {
              const updated = JSON.parse(out);
              assert.strictEqual(updated.assigneeId, 2);
              http.get({ port, path: `/tickets/${ticket.id}/history` }, hres => {
                let hist = '';
                hres.on('data', d => hist += d);
                hres.on('end', () => {
                  const arr = JSON.parse(hist);
                  const entry = arr.find(e => e.action === 'assignee' && e.to === 2);
                  assert.ok(entry);
                  server.close(() => console.log('Ticket assign test passed'));
                });
              });
            });
          });
        });
      });
      assign.end();
    });
  });
  create.end(JSON.stringify({ question: 'Assign test' }));
});
