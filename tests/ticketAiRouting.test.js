const http = require('http');
const assert = require('assert');
const app = require('../server');

const server = app.listen(0, () => {
  const port = server.address().port;
  const create1 = http.request(
    { port, path: '/tickets', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        const ticket = JSON.parse(body);
        assert.strictEqual(ticket.assigneeId, 1);
        assert.strictEqual(ticket.priority, 'medium');
        const create2 = http.request(
          { port, path: '/tickets', method: 'POST', headers: { 'Content-Type': 'application/json' } },
          res2 => {
            let b2 = '';
            res2.on('data', d => b2 += d);
            res2.on('end', () => {
              const ticket2 = JSON.parse(b2);
              assert.strictEqual(ticket2.assigneeId, 2);
              assert.strictEqual(ticket2.priority, 'high');
              server.close(() => console.log('AI routing test passed'));
            });
          }
        );
        create2.end(JSON.stringify({ question: 'The server had an error.' }));
      });
    }
  );
  create1.end(JSON.stringify({ question: 'I forgot my password' }));
});
