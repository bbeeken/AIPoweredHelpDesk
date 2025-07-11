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
        const closeReq = http.request({ port, path: `/tickets/${ticket.id}/close`, method: 'POST' }, cres => {
          cres.resume();
          cres.on('end', () => {
            http.get({ port, path: `/tickets/${ticket.id}` }, gres => {
              let data = '';
              gres.on('data', d => data += d);
              gres.on('end', () => {
                const closed = JSON.parse(data);
                assert.strictEqual(closed.status, 'closed');
                http.get({ port, path: `/tickets/${ticket.id}/history` }, hres => {
                  let hist = '';
                  hres.on('data', d => hist += d);
                  hres.on('end', () => {
                    const arr = JSON.parse(hist);
                    const entry = arr.find(e => e.action === 'status' && e.to === 'closed');
                    assert.ok(entry);
                    server.close(() => console.log('Ticket close test passed'));
                  });
                });
              });
            });
          });
        });
        closeReq.end();
      });
    }
  );
  create.end(JSON.stringify({ question: 'Close me' }));
});
