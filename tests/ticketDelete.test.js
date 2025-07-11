const http = require('http');
const assert = require('assert');
const app = require('../server');

const server = app.listen(0, () => {
  const port = server.address().port;
  const create = http.request({ port, path: '/tickets', method: 'POST', headers: { 'Content-Type': 'application/json' } }, res => {
    let body = '';
    res.on('data', c => body += c);
    res.on('end', () => {
      const ticket = JSON.parse(body);
      const del = http.request({ port, path: `/tickets/${ticket.id}`, method: 'DELETE' }, dres => {
        dres.resume();
        dres.on('end', () => {
          http.get({ port, path: `/tickets/${ticket.id}` }, gres => {
            gres.resume();
            assert.strictEqual(gres.statusCode, 404);
            server.close(() => console.log('Ticket delete test passed'));
          });
        });
      });
      del.end();
    });
  });
  create.end(JSON.stringify({ question: 'Delete me' }));
});
