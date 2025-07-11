const assert = require('assert');
const http = require('http');
const app = require('../server');

assert.ok(app, 'Express app should be defined');

// Basic integration tests
const server = app.listen(0, () => {
  const port = server.address().port;

  // check dashboard
  http.get({ port, path: '/dashboard' }, res => {
    let data = '';
    res.on('data', chunk => (data += chunk));
    res.on('end', () => {
      assert.strictEqual(res.statusCode, 200);
      const json = JSON.parse(data);
      assert.ok(json.message);

      // check ticket filter
      http.get({ port, path: '/tickets?status=open' }, res2 => {
        let body = '';
        res2.on('data', c => (body += c));
        res2.on('end', () => {
          const tickets = JSON.parse(body);
          assert.ok(Array.isArray(tickets));
          assert.ok(tickets.every(t => t.status === 'open'));

          // check attachments listing
          const tid = 2353;
          http.get({ port, path: `/tickets/${tid}/attachments` }, res3 => {
            let a = '';
            res3.on('data', ch => (a += ch));
            res3.on('end', () => {
              const attachments = JSON.parse(a);
              assert.ok(Array.isArray(attachments));
              server.close(() => console.log('All tests passed'));
            });
          });
        });
      });
    });
  }).on('error', err => {
    server.close(() => { throw err; });
  });
});
