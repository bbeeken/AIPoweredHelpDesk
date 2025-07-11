const http = require('http');
const assert = require('assert');
const app = require('../server');

const server = app.listen(0, () => {
  const port = server.address().port;
  http.get({ port, path: '/index.html' }, res => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
      assert.strictEqual(res.statusCode, 200);
      assert.ok(body.includes('class="skip-link"'), 'skip link should exist');
      server.close(() => console.log('Skip link test passed'));
    });
  });
});
