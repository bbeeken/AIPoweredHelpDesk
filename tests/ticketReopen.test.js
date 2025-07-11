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
        const closeReq = http.request({ port, path: `/tickets/${ticket.id}/close`, method: 'POST' }, cRes => {
          cRes.resume();
          cRes.on('end', () => {
            const reopenReq = http.request({ port, path: `/tickets/${ticket.id}/reopen`, method: 'POST' }, rRes => {
              rRes.resume();
              rRes.on('end', () => {
                http.get({ port, path: `/tickets/${ticket.id}` }, gRes => {
                  let data = '';
                  gRes.on('data', d => data += d);
                  gRes.on('end', () => {
                    const reopened = JSON.parse(data);
                    assert.strictEqual(reopened.status, 'open');
                    http.get({ port, path: `/tickets/${ticket.id}/history` }, hRes => {
                      let hist = '';
                      hRes.on('data', d => hist += d);
                      hRes.on('end', () => {
                        const arr = JSON.parse(hist);
                        const entry = arr.find(e => e.action === 'status' && e.to === 'open');
                        assert.ok(entry);
                        server.close(() => console.log('Ticket reopen test passed'));
                      });
                    });
                  });
                });
              });
            });
            reopenReq.end();
          });
        });
        closeReq.end();
      });
    }
  );
  create.end(JSON.stringify({ question: 'Reopen test' }));
});
