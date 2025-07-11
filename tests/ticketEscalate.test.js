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
      const id = ticket.id;
      const escalate = http.request({
        port,
        path: `/tickets/${id}/escalate`,
        method: 'POST'
      }, eres => {
        eres.resume();
        eres.on('end', () => {
          http.get({ port, path: `/tickets/${id}` }, gres => {
            let out = '';
            gres.on('data', d => out += d);
            gres.on('end', () => {
              const updated = JSON.parse(out);
              assert.strictEqual(updated.priority, 'high');
              http.get({ port, path: `/tickets/${id}/history` }, hres => {
                let hist = '';
                hres.on('data', d => hist += d);
                hres.on('end', () => {
                  const arr = JSON.parse(hist);
                  const entry = arr.find(e => e.action === 'priority' && e.to === 'high');
                  assert.ok(entry);
                  server.close(() => console.log('Ticket escalate test passed'));
                });
              });
            });
          });
        });
      });
      escalate.end();
    });
  });
  create.end(JSON.stringify({ question: 'Escalate test', priority: 'low' }));
});
