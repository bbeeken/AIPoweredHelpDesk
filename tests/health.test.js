const http = require('http');
const assert = require('assert');
const app = require('../server');

const server = app.listen(0, () => {
  const port = server.address().port;
  http.get({ port, path: '/health' }, res => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
      assert.strictEqual(res.statusCode, 200);
      const json = JSON.parse(body);
      assert.strictEqual(json.status, 'ok');
      server.close(() => console.log('Health check test passed'));
    });
  });
});
